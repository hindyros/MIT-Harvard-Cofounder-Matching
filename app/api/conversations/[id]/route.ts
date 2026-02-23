import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Conversation from '@/lib/models/Conversation';
import Message from '@/lib/models/Message';
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
    const { id } = await params;

    const conversation = await Conversation.findOne({
      _id: id,
      participants: user!._id,
    }).populate('participants', 'name school profile.headline profile.avatarUrl');

    if (!conversation) {
      return errorResponse('Not found', 'Conversation not found', 404);
    }

    const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50');

    const messages = await Message.find({ conversationId: id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('senderId', 'name')
      .lean();

    await Message.updateMany(
      { conversationId: id, senderId: { $ne: user!._id }, readAt: null },
      { readAt: new Date() }
    );

    const unreadCount = conversation.unreadCount as Map<string, number> | undefined;
    if (unreadCount) {
      unreadCount.set(user!._id.toString(), 0);
      await conversation.save();
    }

    return successResponse({
      conversation: {
        id: conversation._id,
        participants: conversation.participants,
      },
      messages: messages.reverse(),
      pagination: { page, limit },
    });
  } catch (err) {
    console.error('Get conversation error:', err);
    return errorResponse('Server error', 'Something went wrong', 500);
  }
}
