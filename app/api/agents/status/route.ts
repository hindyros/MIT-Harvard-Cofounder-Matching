import { NextRequest } from 'next/server';
import { authenticateAgent } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function GET(req: NextRequest) {
  const agent = await authenticateAgent(req);
  if (!agent) {
    return errorResponse('Unauthorized', 'Invalid or missing API key', 401);
  }

  return successResponse({
    name: agent.name,
    description: agent.description,
    claimStatus: agent.claimStatus,
    linkedUserId: agent.linkedUserId,
    lastActive: agent.lastActive,
  });
}
