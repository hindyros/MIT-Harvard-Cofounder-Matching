import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import Application from '@/lib/models/Application';
import Conversation from '@/lib/models/Conversation';
import CoffeeChat from '@/lib/models/CoffeeChat';
import Match from '@/lib/models/Match';
import Event from '@/lib/models/Event';
import { requireAdmin } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  try {
    await connectDB();

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      approvedUsers,
      pendingApplications,
      totalApplications,
      newUsersThisWeek,
      newUsersThisMonth,
      totalConversations,
      activeConversations,
      totalCoffeeChats,
      scheduledCoffeeChats,
      completedCoffeeChats,
      totalMatches,
      connectedMatches,
      totalEvents,
      upcomingEvents,
      mitUsers,
      harvardUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isApproved: true }),
      Application.countDocuments({ status: 'pending' }),
      Application.countDocuments(),
      User.countDocuments({ createdAt: { $gte: weekAgo } }),
      User.countDocuments({ createdAt: { $gte: monthAgo } }),
      Conversation.countDocuments(),
      Conversation.countDocuments({ lastActivity: { $gte: weekAgo } }),
      CoffeeChat.countDocuments(),
      CoffeeChat.countDocuments({ status: 'scheduled' }),
      CoffeeChat.countDocuments({ status: 'completed' }),
      Match.countDocuments(),
      Match.countDocuments({ status: 'connected' }),
      Event.countDocuments(),
      Event.countDocuments({ date: { $gte: now } }),
      User.countDocuments({ school: 'MIT', isApproved: true }),
      User.countDocuments({ school: 'Harvard', isApproved: true }),
    ]);

    return successResponse({
      users: {
        total: totalUsers,
        approved: approvedUsers,
        mit: mitUsers,
        harvard: harvardUsers,
        newThisWeek: newUsersThisWeek,
        newThisMonth: newUsersThisMonth,
      },
      applications: {
        total: totalApplications,
        pending: pendingApplications,
      },
      conversations: {
        total: totalConversations,
        activeThisWeek: activeConversations,
      },
      coffeeChats: {
        total: totalCoffeeChats,
        scheduled: scheduledCoffeeChats,
        completed: completedCoffeeChats,
      },
      matches: {
        total: totalMatches,
        connected: connectedMatches,
      },
      events: {
        total: totalEvents,
        upcoming: upcomingEvents,
      },
    });
  } catch (err) {
    console.error('Metrics error:', err);
    return errorResponse('Server error', 'Something went wrong', 500);
  }
}
