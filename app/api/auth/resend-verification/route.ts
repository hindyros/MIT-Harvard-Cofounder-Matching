import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';
import { sendVerificationEmail } from '@/lib/utils/email';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return errorResponse('Missing email', 'Provide email', 400);
    }

    await connectDB();
    const user = await User.findOne({
      email: email.toLowerCase(),
      isVerified: false,
      verificationToken: { $exists: true },
      verificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return errorResponse(
        'Not found',
        'No pending verification for this email, or link expired. Please sign up again.',
        404
      );
    }

    try {
      await sendVerificationEmail(user.email, user.verificationToken!);
      return successResponse({ message: 'Verification email sent.' });
    } catch (emailErr) {
      const message = emailErr instanceof Error ? emailErr.message : String(emailErr);
      console.error('Resend verification failed:', message);
      return errorResponse(
        'Email failed',
        message,
        500
      );
    }
  } catch (err) {
    console.error('Resend verification error:', err);
    return errorResponse('Server error', 'Something went wrong', 500);
  }
}
