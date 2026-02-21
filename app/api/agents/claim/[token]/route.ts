import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Agent from '@/lib/models/Agent';
import { authenticateUser } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    await connectDB();
    const { token } = await params;
    const agent = await Agent.findOne({ claimToken: token });

    if (!agent) {
      return errorResponse('Invalid token', 'This claim link is invalid or expired', 404);
    }

    return successResponse({
      name: agent.name,
      description: agent.description,
      alreadyClaimed: agent.claimStatus === 'claimed',
    });
  } catch (err) {
    console.error('Claim check error:', err);
    return errorResponse('Server error', 'Something went wrong', 500);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    await connectDB();
    const { token } = await params;
    const agent = await Agent.findOne({ claimToken: token });

    if (!agent) {
      return errorResponse('Invalid token', 'This claim link is invalid or expired', 404);
    }

    if (agent.claimStatus === 'claimed') {
      return successResponse({ name: agent.name, message: 'Already claimed' });
    }

    const user = await authenticateUser(req);

    agent.claimStatus = 'claimed';
    if (user) {
      agent.linkedUserId = user._id;
      agent.ownerEmail = user.email;
    }
    await agent.save();

    return successResponse({
      name: agent.name,
      message: 'Agent claimed successfully',
      linkedUser: user ? { id: user._id, name: user.name } : null,
    });
  } catch (err) {
    console.error('Claim error:', err);
    return errorResponse('Server error', 'Something went wrong', 500);
  }
}
