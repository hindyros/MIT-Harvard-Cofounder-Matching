import { NextRequest } from 'next/server';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db/mongodb';
import Agent from '@/lib/models/Agent';
import User from '@/lib/models/User';
import { successResponse, errorResponse, extractApiKey } from '@/lib/utils/api-helpers';
import { validateEmail } from '@/lib/utils/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const apiKey = extractApiKey(req.headers.get('authorization'));
    if (!apiKey) {
      return errorResponse('Missing API key', 'Include Authorization: Bearer YOUR_API_KEY', 401);
    }

    const agent = await Agent.findOne({ apiKey });
    if (!agent) {
      return errorResponse('Invalid API key', 'Agent not found', 401);
    }

    if (agent.claimStatus === 'claimed' && agent.linkedUserId) {
      return errorResponse(
        'Already linked',
        'This agent is already linked to a user account. Use your API key to act on their behalf.',
        409
      );
    }

    let reqBody: Record<string, unknown>;
    try {
      reqBody = await req.json();
    } catch {
      return errorResponse('Invalid request body', 'Expected a JSON object with "email" and "name"', 400);
    }

    const { email, name } = reqBody as { email?: string; name?: string };
    if (!email || !name) {
      return errorResponse('Missing fields', 'Both "email" and "name" are required', 400);
    }

    const { valid, school } = validateEmail(email);
    if (!valid) {
      return errorResponse(
        'Invalid email',
        'Only @mit.edu and @harvard.edu emails are accepted',
        400
      );
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      const existingAgent = await Agent.findOne({
        linkedUserId: user._id,
        _id: { $ne: agent._id },
      });
      if (existingAgent) {
        return errorResponse(
          'User already linked',
          'This user account is already linked to another agent',
          409
        );
      }

      if (!user.isApproved) user.isApproved = true;
      await user.save();
    } else {
      const randomHash = await bcrypt.hash(nanoid(32), 12);
      user = await User.create({
        email: email.toLowerCase(),
        passwordHash: randomHash,
        name,
        school,
        isApproved: true,
      });
    }

    agent.claimStatus = 'claimed';
    agent.linkedUserId = user._id;
    agent.ownerEmail = user.email;
    await agent.save();

    return successResponse(
      {
        message: 'Account created and agent linked successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          school: user.school,
          isApproved: user.isApproved,
        },
        agent: {
          name: agent.name,
          claimStatus: agent.claimStatus,
        },
      },
      201
    );
  } catch (err) {
    console.error('Agent create-account error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return errorResponse('Server error', `Account creation failed: ${message}`, 500);
  }
}
