import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import { requireAuthOrAgent } from '@/lib/utils/auth';
import { successResponse, errorResponse, escapeRegex } from '@/lib/utils/api-helpers';

export async function GET(req: NextRequest) {
  const { error } = await requireAuthOrAgent(req);
  if (error) return error;

  try {
    await connectDB();
    const q = req.nextUrl.searchParams.get('q') || '';
    const school = req.nextUrl.searchParams.get('school');
    const skills = req.nextUrl.searchParams.get('skills');
    const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');

    const filter: Record<string, unknown> = { isApproved: true };

    if (q) {
      const escaped = escapeRegex(q);
      filter.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { 'profile.headline': { $regex: escaped, $options: 'i' } },
        { 'profile.bio': { $regex: escaped, $options: 'i' } },
        { 'profile.skills': { $regex: escaped, $options: 'i' } },
      ];
    }

    if (school && school !== 'all') {
      filter.school = school;
    }

    if (skills) {
      const skillList = skills.split(',').map((s) => s.trim()).filter(Boolean);
      filter['profile.skills'] = { $in: skillList.map((s) => new RegExp(escapeRegex(s), 'i')) };
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('name school profile lastActive')
      .sort({ lastActive: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return successResponse({
      members: users.map((u) => ({
        id: u._id,
        name: u.name,
        school: u.school,
        headline: u.profile?.headline,
        skills: u.profile?.skills || [],
        interests: u.profile?.interests || [],
        program: u.profile?.program,
        yearOfStudy: u.profile?.yearOfStudy,
        avatarUrl: u.profile?.avatarUrl || null,
        lastActive: u.lastActive,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Directory error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return errorResponse('Server error', `Failed to search directory: ${message}`, 500);
  }
}
