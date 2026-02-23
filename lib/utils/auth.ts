import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db/mongodb';
import User, { IUser } from '@/lib/models/User';
import Agent, { IAgent } from '@/lib/models/Agent';
import { errorResponse, extractApiKey } from './api-helpers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';

export function signToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

const HARVARD_DOMAINS = [
  'harvard.edu',
  'fas.harvard.edu',
  'college.harvard.edu',
  'g.harvard.edu',
  'hbs.edu',
  'hks.harvard.edu',
  'hls.harvard.edu',
  'gse.harvard.edu',
  'hsph.harvard.edu',
  'seas.harvard.edu',
  'post.harvard.edu',
  'mba.harvard.edu',
  'dce.harvard.edu',
];

export function validateEmail(email: string): { valid: boolean; school?: 'MIT' | 'Harvard' } {
  const lower = email.toLowerCase().trim();

  const testEmails = (process.env.TEST_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (testEmails.includes(lower)) {
    return { valid: true, school: 'MIT' };
  }

  if (lower.endsWith('@mit.edu')) return { valid: true, school: 'MIT' };

  for (const domain of HARVARD_DOMAINS) {
    if (lower.endsWith(`@${domain}`)) return { valid: true, school: 'Harvard' };
  }

  return { valid: false };
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const cookie = req.cookies.get('token')?.value;
  if (cookie) return cookie;

  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return null;
}

export async function authenticateUser(req: NextRequest): Promise<IUser | null> {
  const token = getTokenFromRequest(req);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  await connectDB();
  const user = await User.findById(payload.userId);
  if (!user) return null;

  User.updateOne({ _id: user._id }, { lastActive: new Date() }).exec();
  return user;
}

export async function requireAuth(req: NextRequest) {
  const user = await authenticateUser(req);
  if (!user) {
    return { user: null, error: errorResponse('Unauthorized', 'Please log in', 401) };
  }
  if (!user.isApproved) {
    return { user: null, error: errorResponse('Not approved', 'Your application is still pending review', 403) };
  }
  return { user, error: null };
}

export async function requireAdmin(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return { user: null, error };
  if (user!.role !== 'admin') {
    return { user: null, error: errorResponse('Forbidden', 'Admin access required', 403) };
  }
  return { user, error: null };
}

export async function authenticateAgent(req: NextRequest): Promise<IAgent | null> {
  const apiKey = extractApiKey(req.headers.get('authorization'));
  if (!apiKey) return null;

  await connectDB();
  const agent = await Agent.findOne({ apiKey });
  if (!agent) return null;

  Agent.updateOne({ _id: agent._id }, { lastActive: new Date() }).exec();
  return agent;
}

export async function authenticateUserOrAgent(req: NextRequest) {
  const user = await authenticateUser(req);
  if (user) return { user, agent: null };

  const agent = await authenticateAgent(req);
  if (agent) return { user: null, agent };

  return { user: null, agent: null };
}
