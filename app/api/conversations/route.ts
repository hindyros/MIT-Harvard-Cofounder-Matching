import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Conversation from '@/lib/models/Conversation';
import Message from '@/lib/models/Message';
import { requireAuthOrAgent } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';
import User from '@/lib/models/User';

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuthOrAgent(req);
  if (error) return error;

  try {
    await connectDB();
    const conversations = await Conversation.find({
      participants: user!._id,
    })
      .sort({ lastActivity: -1 })
      .populate('participants', 'name school profile.headline profile.avatarUrl')
      .lean();

    return successResponse({
      conversations: conversations.map((c) => ({
        id: c._id,
        participants: c.participants,
        lastMessage: c.lastMessage,
        lastActivity: c.lastActivity,
        unreadCount: c.unreadCount?.get?.(user!._id.toString()) || 0,
      })),
    });
  } catch (err) {
    console.error('Conversations error:', err);
    return errorResponse('Server error', 'Something went wrong', 500);
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuthOrAgent(req);
  if (error) return error;

  try {
    await connectDB();
    const { recipientId, message } = await req.json();

    if (!recipientId) {
      return errorResponse('Missing recipientId', 'Provide the user ID to message', 400);
    }

    const recipient = await User.findById(recipientId);
    if (!recipient || !recipient.isApproved) {
      return errorResponse('User not found', 'Recipient not found or not approved', 404);
    }

    const existing = await Conversation.findOne({
      participants: { $all: [user!._id, recipientId], $size: 2 },
    });

    if (existing) {
      return successResponse({ id: existing._id, existing: true });
    }

    const conversation = await Conversation.create({
      participants: [user!._id, recipientId],
      lastMessage: message || '',
      lastActivity: new Date(),
    });

    if (message) {
      await Message.create({
        conversationId: conversation._id,
        senderId: user!._id,
        content: message,
      });
    }

    return successResponse({ id: conversation._id, existing: false }, 201);
  } catch (err) {
    console.error('Create conversation error:', err);
    return errorResponse('Server error', 'Something went wrong', 500);
  }
}
