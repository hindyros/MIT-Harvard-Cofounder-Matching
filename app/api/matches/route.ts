import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Match from '@/lib/models/Match';
import { requireAuthOrAgent } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuthOrAgent(req);
  if (error) return error;

  try {
    await connectDB();
    const includeMutual = req.nextUrl.searchParams.get('includeMutual') === 'true';

    const matches = await Match.find({
      $or: [{ user1: user!._id }, { user2: user!._id }],
    })
      .sort({ weekOf: -1 })
      .limit(20)
      .populate('user1', 'name school profile.headline profile.skills profile.avatarUrl')
      .populate('user2', 'name school profile.headline profile.skills profile.avatarUrl')
      .lean();

    let myConnectedPartners: Set<string> | null = null;
    if (includeMutual) {
      const connectedMatches = await Match.find({
        $or: [{ user1: user!._id }, { user2: user!._id }],
        status: 'connected',
      }).lean();
      myConnectedPartners = new Set(
        connectedMatches.map((m) =>
          m.user1.toString() === user!._id.toString() ? m.user2.toString() : m.user1.toString()
        )
      );
    }

    const matchResults = await Promise.all(
      matches.map(async (m) => {
        const otherUser =
          m.user1._id.toString() === user!._id.toString() ? m.user2 : m.user1;

        let mutualCount: number | undefined;
        if (includeMutual && myConnectedPartners) {
          const otherId = otherUser._id.toString();
          const theirConnections = await Match.find({
            $or: [{ user1: otherId }, { user2: otherId }],
            status: 'connected',
          }).lean();
          const theirPartners = new Set(
            theirConnections.map((tm) =>
              tm.user1.toString() === otherId ? tm.user2.toString() : tm.user1.toString()
            )
          );
          mutualCount = [...myConnectedPartners].filter(
            (id) => theirPartners.has(id) && id !== otherId
          ).length;
        }

        return {
          id: m._id,
          matchedWith: otherUser,
          weekOf: m.weekOf,
          score: m.score,
          scoreBreakdown: m.scoreBreakdown,
          status: m.status,
          ...(mutualCount !== undefined && { mutualCount }),
        };
      })
    );

    return successResponse({ matches: matchResults });
  } catch (err) {
    console.error('Matches error:', err);
    return errorResponse('Server error', 'Something went wrong', 500);
  }
}
