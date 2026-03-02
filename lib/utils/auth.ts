import { NextRequest } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db/mongodb';
import User, { IUser } from '@/lib/models/User';
import Agent, { IAgent } from '@/lib/models/Agent';
import { errorResponse, extractApiKey } from './api-helpers';

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function authenticateUser(_req?: NextRequest): Promise<IUser | null> {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return null;

    await connectDB();
    let user = await User.findOne({ clerkUserId });

    if (!user) {
      user = await provisionUserFromClerk(clerkUserId);
      if (!user) return null;
    }

    User.updateOne({ _id: user._id }, { lastActive: new Date() }).exec();
    return user;
  } catch {
    return null;
  }
}

async function provisionUserFromClerk(clerkUserId: string): Promise<IUser | null> {
  try {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkUserId);
    const primaryEmail = clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId
    );
    if (!primaryEmail) return null;

    const email = primaryEmail.emailAddress.toLowerCase();
    const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || email.split('@')[0];
    const { valid, school } = validateEmail(email);

    if (!valid) return null;

    await connectDB();

    const avatarUrl = clerkUser.imageUrl || undefined;

    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
    const isAdmin = adminEmails.includes(email);

    const existing = await User.findOne({ email });
    if (existing) {
      existing.clerkUserId = clerkUserId;
      existing.name = name;
      if (isAdmin) {
        existing.role = 'admin';
        existing.isApproved = true;
      }
      if (avatarUrl && !existing.profile?.avatarUrl) {
        existing.profile = { ...existing.profile, avatarUrl };
      }
      await existing.save();
      return existing;
    }

    return await User.create({
      clerkUserId,
      email,
      name,
      school,
      isApproved: isAdmin,
      role: isAdmin ? 'admin' : 'user',
      profile: avatarUrl ? { avatarUrl } : undefined,
    });
  } catch (err) {
    console.error('JIT user provisioning failed:', err);
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function requireAuth(_req?: NextRequest) {
  const user = await authenticateUser();
  if (!user) {
    return { user: null, error: errorResponse('Unauthorized', 'Please log in', 401) };
  }
  if (!user.isApproved) {
    return { user: null, error: errorResponse('Not approved', 'Your application is still pending review', 403) };
  }
  return { user, error: null };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function requireAdmin(_req?: NextRequest) {
  const user = await authenticateUser();
  if (!user) {
    return { user: null, error: errorResponse('Unauthorized', 'Please log in', 401) };
  }
  if (user.role !== 'admin') {
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
  const user = await authenticateUser();
  if (user) return { user, agent: null };

  const agent = await authenticateAgent(req);
  if (agent) return { user: null, agent };

  return { user: null, agent: null };
}

/**
 * Authenticate as human user OR as an agent acting on behalf of its claimed human.
 * Returns { user, agent, error } where user is always the human user performing the action.
 * Agents must be claimed and linked to a user to pass this check.
 */
export async function requireAuthOrAgent(req: NextRequest) {
  const user = await authenticateUser();
  if (user) {
    if (!user.isApproved) {
      return { user: null, agent: null, error: errorResponse('Not approved', 'Your application is still pending review', 403) };
    }
    return { user, agent: null, error: null };
  }

  const agent = await authenticateAgent(req);
  if (!agent) {
    return { user: null, agent: null, error: errorResponse('Unauthorized', 'Provide a valid session or agent API key', 401) };
  }

  if (agent.claimStatus !== 'claimed' || !agent.linkedUserId) {
    return { user: null, agent, error: errorResponse('Agent not claimed', 'This agent must be claimed by a human first. Send the claim_url to your human.', 403) };
  }

  await connectDB();
  const linkedUser = await User.findById(agent.linkedUserId);
  if (!linkedUser || !linkedUser.isApproved) {
    return { user: null, agent, error: errorResponse('Linked user unavailable', 'The linked human account is not approved or no longer exists', 403) };
  }

  return { user: linkedUser, agent, error: null };
}
