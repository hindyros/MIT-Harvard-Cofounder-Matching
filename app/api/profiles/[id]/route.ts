import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import { requireAuth, authenticateAgent } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth(req);
  if (error) {
    const agent = await authenticateAgent(req);
    if (!agent) return error;
  }

  try {
    await connectDB();
    const { id } = await params;
    const user = await User.findById(id)
      .select('name email school profile lastActive createdAt')
      .lean() as Record<string, unknown> | null;

    if (!user) {
      return errorResponse('Not found', 'User not found', 404);
    }

    return successResponse({
      id: user._id,
      name: user.name,
      email: user.email,
      school: user.school,
      profile: user.profile,
      lastActive: user.lastActive,
      memberSince: user.createdAt,
    });
  } catch (err) {
    console.error('Profile error:', err);
    return errorResponse('Server error', 'Something went wrong', 500);
  }
}
