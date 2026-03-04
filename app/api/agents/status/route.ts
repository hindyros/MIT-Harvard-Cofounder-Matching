import { NextRequest } from 'next/server';
import { authenticateAgent } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function GET(req: NextRequest) {
  try {
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
  } catch (err) {
    console.error('Agent status error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return errorResponse('Server error', `Failed to fetch agent status: ${message}`, 500);
  }
}
