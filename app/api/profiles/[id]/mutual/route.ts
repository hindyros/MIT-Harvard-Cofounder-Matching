import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Match from '@/lib/models/Match';
import User from '@/lib/models/User';
import { requireAuthOrAgent } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuthOrAgent(req);
  if (error) return error;

  try {
    await connectDB();
    const { id: targetId } = await params;

    if (targetId === user!._id.toString()) {
      return successResponse({ mutualConnections: [], count: 0 });
    }

    const [myMatches, theirMatches] = await Promise.all([
      Match.find({
        $or: [{ user1: user!._id }, { user2: user!._id }],
        status: 'connected',
      }).lean(),
      Match.find({
        $or: [{ user1: targetId }, { user2: targetId }],
        status: 'connected',
      }).lean(),
    ]);

    const getPartnerId = (match: Record<string, unknown>, userId: string) => {
      const u1 = String(match.user1);
      const u2 = String(match.user2);
      return u1 === userId ? u2 : u1;
    };

    const myPartners = new Set(myMatches.map((m) => getPartnerId(m, user!._id.toString())));
    const theirPartners = new Set(theirMatches.map((m) => getPartnerId(m, targetId)));

    const mutualIds = [...myPartners].filter((id) => theirPartners.has(id) && id !== targetId && id !== user!._id.toString());

    if (mutualIds.length === 0) {
      return successResponse({ mutualConnections: [], count: 0 });
    }

    const mutualUsers = await User.find(
      { _id: { $in: mutualIds } },
      'name school profile.avatarUrl'
    ).lean();

    return successResponse({
      mutualConnections: mutualUsers.map((u) => ({
        id: u._id,
        name: u.name,
        school: u.school,
        avatarUrl: u.profile?.avatarUrl,
      })),
      count: mutualUsers.length,
    });
  } catch (err) {
    console.error('Mutual connections error:', err);
    return errorResponse('Server error', 'Something went wrong', 500);
  }
}
