import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Application from '@/lib/models/Application';
import User from '@/lib/models/User';
import { requireAdmin } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';
import { sendApprovalEmail } from '@/lib/utils/email';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdmin(req);
  if (error) return error;

  try {
    await connectDB();
    const { id } = await params;
    const { decision, note } = await req.json();

    if (!['approved', 'rejected'].includes(decision)) {
      return errorResponse('Invalid decision', 'Must be "approved" or "rejected"', 400);
    }

    const application = await Application.findById(id).populate('userId');
    if (!application) {
      return errorResponse('Not found', 'Application not found', 404);
    }

    application.status = decision;
    application.reviewedBy = user!._id;
    application.reviewedAt = new Date();
    if (note) application.reviewNote = note;
    await application.save();

    if (decision === 'approved') {
      await User.updateOne({ _id: application.userId._id }, { isApproved: true });
      const appUser = await User.findById(application.userId._id);
      if (appUser) {
        try {
          await sendApprovalEmail(appUser.email, appUser.name);
        } catch {
          // Email may fail silently
        }
      }
    }

    return successResponse({
      id: application._id,
      status: application.status,
      reviewedAt: application.reviewedAt,
    });
  } catch (err) {
    console.error('Review error:', err);
    return errorResponse('Server error', 'Something went wrong', 500);
  }
}
