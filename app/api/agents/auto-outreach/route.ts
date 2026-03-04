import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { authenticateAgent } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';
import Match from '@/lib/models/Match';
import User from '@/lib/models/User';
import Conversation from '@/lib/models/Conversation';
import Message from '@/lib/models/Message';
import { generateIcebreaker } from '@/lib/utils/icebreaker';

export async function POST(req: NextRequest) {
  const agent = await authenticateAgent(req);
  if (!agent) {
    return errorResponse('Unauthorized', 'Provide a valid agent API key', 401);
  }
  if (agent.claimStatus !== 'claimed' || !agent.linkedUserId) {
    return errorResponse('Agent not claimed', 'Link your agent to a human first', 403);
  }

  try {
    await connectDB();
    const body = await req.json().catch(() => ({}));
    const { matchId } = body as { matchId?: string };

    const linkedUser = await User.findById(agent.linkedUserId);
    if (!linkedUser || !linkedUser.isApproved) {
      return errorResponse('User unavailable', 'Linked user is not approved', 403);
    }

    const matchFilter: Record<string, unknown> = {
      $or: [{ user1: linkedUser._id }, { user2: linkedUser._id }],
      status: { $in: ['sent', 'viewed'] },
    };
    if (matchId) matchFilter._id = matchId;

    const matches = await Match.find(matchFilter)
      .populate('user1', 'name school profile')
      .populate('user2', 'name school profile')
      .limit(10);

    if (matches.length === 0) {
      return successResponse({ processed: 0, conversations: [], message: 'No pending matches to process' });
    }

    type PopulatedUser = {
      _id: { toString(): string };
      name: string;
      school: string;
      profile?: { headline?: string; skills?: string[]; interests?: string[]; lookingFor?: string[] };
    };

    const results: { matchId: string; conversationId: string; recipientName: string }[] = [];

    for (const match of matches) {
      const u1 = match.user1 as unknown as PopulatedUser | null;
      const u2 = match.user2 as unknown as PopulatedUser | null;
      if (!u1?._id || !u2?._id) continue;

      const isUser1 = u1._id.toString() === linkedUser._id.toString();
      const other = isUser1 ? u2 : u1;
      const self = isUser1 ? u1 : u2;

      const icebreaker = generateIcebreaker(
        self.profile as Parameters<typeof generateIcebreaker>[0],
        other.profile as Parameters<typeof generateIcebreaker>[1],
        other.name
      );

      match.status = 'connected';
      await match.save();

      let conversation = await Conversation.findOne({
        participants: { $all: [linkedUser._id, other._id], $size: 2 },
      });

      let conversationId: string;

      if (conversation) {
        conversationId = conversation._id.toString();
        await Message.create({
          conversationId: conversation._id,
          senderId: linkedUser._id,
          content: icebreaker,
        });
        conversation.lastMessage = icebreaker.slice(0, 100);
        conversation.lastActivity = new Date();
        await conversation.save();
      } else {
        conversation = await Conversation.create({
          participants: [linkedUser._id, other._id],
          lastMessage: icebreaker.slice(0, 100),
          lastActivity: new Date(),
        });
        conversationId = conversation._id.toString();
        await Message.create({
          conversationId: conversation._id,
          senderId: linkedUser._id,
          content: icebreaker,
        });
      }

      results.push({
        matchId: match._id.toString(),
        conversationId,
        recipientName: other.name,
      });
    }

    return successResponse({
      processed: results.length,
      conversations: results,
    });
  } catch (err) {
    console.error('Auto-outreach error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return errorResponse('Server error', `Auto-outreach failed: ${message}`, 500);
  }
}
