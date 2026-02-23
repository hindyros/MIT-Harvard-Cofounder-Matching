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
    const matches = await Match.find({
      $or: [{ user1: user!._id }, { user2: user!._id }],
    })
      .sort({ weekOf: -1 })
      .limit(20)
      .populate('user1', 'name school profile')
      .populate('user2', 'name school profile')
      .lean();

    return successResponse({
      matches: matches.map((m) => {
        const otherUser =
          m.user1._id.toString() === user!._id.toString() ? m.user2 : m.user1;
        return {
          id: m._id,
          matchedWith: otherUser,
          weekOf: m.weekOf,
          score: m.score,
          scoreBreakdown: m.scoreBreakdown,
          status: m.status,
        };
      }),
    });
  } catch (err) {
    console.error('Matches error:', err);
    return errorResponse('Server error', 'Something went wrong', 500);
  }
}
