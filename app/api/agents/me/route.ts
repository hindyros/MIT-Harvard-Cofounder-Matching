import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { authenticateAgent } from '@/lib/utils/auth';
import User from '@/lib/models/User';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function GET(req: NextRequest) {
  const agent = await authenticateAgent(req);
  if (!agent) {
    return errorResponse('Unauthorized', 'Invalid or missing API key', 401);
  }

  await connectDB();
  let linkedUser = null;
  if (agent.linkedUserId) {
    linkedUser = await User.findById(agent.linkedUserId)
      .select('name email school profile isApproved')
      .lean();
  }

  return successResponse({
    name: agent.name,
    description: agent.description,
    claimStatus: agent.claimStatus,
    linkedUser,
    lastActive: agent.lastActive,
  });
}
