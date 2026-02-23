import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import CoffeeChat from '@/lib/models/CoffeeChat';
import { requireAuthOrAgent } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuthOrAgent(req);
  if (error) return error;

  try {
    await connectDB();
    const chats = await CoffeeChat.find({
      $or: [{ user1: user!._id }, { user2: user!._id }],
    })
      .sort({ scheduledAt: -1 })
      .populate('user1', 'name school profile.headline')
      .populate('user2', 'name school profile.headline')
      .lean();

    return successResponse({ coffeeChats: chats });
  } catch (err) {
    console.error('Coffee chats error:', err);
    return errorResponse('Server error', 'Something went wrong', 500);
  }
}

export async function POST(req: NextRequest) {
  const { user, error: err2 } = await requireAuthOrAgent(req);
  if (err2) return err2;

  try {
    await connectDB();
    const { matchId, userId, scheduledAt, location } = await req.json();

    if (!userId || !scheduledAt) {
      return errorResponse('Missing fields', 'userId and scheduledAt are required', 400);
    }

    const chat = await CoffeeChat.create({
      matchId,
      user1: user!._id,
      user2: userId,
      scheduledAt: new Date(scheduledAt),
      location,
    });

    return successResponse({ id: chat._id }, 201);
  } catch (err) {
    console.error('Create coffee chat error:', err);
    return errorResponse('Server error', 'Something went wrong', 500);
  }
}
