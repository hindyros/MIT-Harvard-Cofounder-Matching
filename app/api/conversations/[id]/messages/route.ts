import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Conversation from '@/lib/models/Conversation';
import Message from '@/lib/models/Message';
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
    const { content } = await req.json();

    if (!content?.trim()) {
      return errorResponse('Empty message', 'Message content is required', 400);
    }

    const conversation = await Conversation.findOne({
      _id: id,
      participants: user!._id,
    });

    if (!conversation) {
      return errorResponse('Not found', 'Conversation not found', 404);
    }

    const message = await Message.create({
      conversationId: id,
      senderId: user!._id,
      content: content.trim(),
    });

    conversation.lastMessage = content.trim().slice(0, 100);
    conversation.lastActivity = new Date();

    const otherParticipant = conversation.participants.find(
      (p: { toString(): string }) => p.toString() !== user!._id.toString()
    );
    if (otherParticipant) {
      const unreadCount = conversation.unreadCount as Map<string, number>;
      const current = unreadCount?.get?.(otherParticipant.toString()) || 0;
      if (unreadCount) {
        unreadCount.set(otherParticipant.toString(), current + 1);
      }
    }
    await conversation.save();

    return successResponse(
      {
        id: message._id,
        content: message.content,
        senderId: message.senderId,
        createdAt: message.createdAt,
      },
      201
    );
  } catch (err) {
    console.error('Send message error:', err);
    return errorResponse('Server error', 'Something went wrong', 500);
  }
}
