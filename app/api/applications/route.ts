import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Application from '@/lib/models/Application';
import { authenticateUser } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    if (!user) return errorResponse('Unauthorized', 'Please log in', 401);
    if (!user.isVerified) return errorResponse('Not verified', 'Verify your email first', 403);

    await connectDB();

    const existing = await Application.findOne({ userId: user._id });
    if (existing) {
      return errorResponse('Already applied', 'You have already submitted an application', 409);
    }

    const { whyFounder, currentProject, commitment, previousExperience, whatLookingFor } =
      await req.json();

    if (!whyFounder || !currentProject || !commitment || !previousExperience || !whatLookingFor) {
      return errorResponse('Missing fields', 'All application questions are required', 400);
    }

    const application = await Application.create({
      userId: user._id,
      answers: { whyFounder, currentProject, commitment, previousExperience, whatLookingFor },
    });

    return successResponse(
      {
        id: application._id,
        status: application.status,
        message: 'Application submitted. We will review it shortly.',
      },
      201
    );
  } catch (err) {
    console.error('Application submission error:', err);
    return errorResponse('Server error', 'Something went wrong', 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    if (!user) return errorResponse('Unauthorized', 'Please log in', 401);

    await connectDB();
    const application = await Application.findOne({ userId: user._id });

    if (!application) {
      return successResponse({ status: 'not_submitted' });
    }

    return successResponse({
      id: application._id,
      status: application.status,
      submittedAt: application.createdAt,
      reviewNote: application.reviewNote,
    });
  } catch (err) {
    console.error('Application status error:', err);
    return errorResponse('Server error', 'Something went wrong', 500);
  }
}
