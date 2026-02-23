import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Match from '@/lib/models/Match';
import { requireAuthOrAgent } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuthOrAgent(req);
  if (error) return error;

  try {
    await connectDB();
    const { id } = await params;

    const match = await Match.findOne({
      _id: id,
      $or: [{ user1: user!._id }, { user2: user!._id }],
    });

    if (!match) return errorResponse('Not found', 'Match not found', 404);

    const { action } = await req.json();
    match.status = action === 'connect' ? 'connected' : 'passed';
    await match.save();

    return successResponse({ id: match._id, status: match.status });
  } catch (err) {
    console.error('Connect error:', err);
    return errorResponse('Server error', 'Something went wrong', 500);
  }
}
