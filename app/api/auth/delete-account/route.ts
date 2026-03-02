import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db/mongodb';
import { authenticateUser } from '@/lib/utils/auth';
import User from '@/lib/models/User';
import Application from '@/lib/models/Application';
import Conversation from '@/lib/models/Conversation';
import Message from '@/lib/models/Message';
import Match from '@/lib/models/Match';
import CoffeeChat from '@/lib/models/CoffeeChat';
import Event from '@/lib/models/Event';
import { errorResponse } from '@/lib/utils/api-helpers';

export async function DELETE() {
  const user = await authenticateUser();
  if (!user) {
    return errorResponse('Unauthorized', 'Please log in', 401);
  }

  try {
    await connectDB();
    const userId = user._id;

    await Promise.all([
      Application.deleteMany({ userId }),
      Message.deleteMany({ senderId: userId }),
      Match.deleteMany({ $or: [{ userId1: userId }, { userId2: userId }] }),
      CoffeeChat.deleteMany({ $or: [{ requestedBy: userId }, { requestedTo: userId }] }),
      Event.updateMany({ attendees: userId }, { $pull: { attendees: userId } }),
      Conversation.deleteMany({ participants: userId }),
    ]);

    if (user.clerkUserId) {
      try {
        const client = await clerkClient();
        await client.users.deleteUser(user.clerkUserId);
      } catch (err) {
        console.error('Failed to delete Clerk user:', err);
      }
    }

    await User.findByIdAndDelete(userId);

    return NextResponse.json({ success: true, data: { message: 'Account deleted' } });
  } catch (err) {
    console.error('Delete account error:', err);
    return errorResponse('Server error', 'Something went wrong', 500);
  }
}
