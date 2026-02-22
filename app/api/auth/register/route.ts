import { NextRequest } from 'next/server';
import { nanoid } from 'nanoid';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';
import { validateEmail, hashPassword } from '@/lib/utils/auth';
import { sendVerificationEmail } from '@/lib/utils/email';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return errorResponse('Missing fields', 'Provide email, password, and name', 400);
    }

    const { valid, school } = validateEmail(email);
    if (!valid) {
      return errorResponse(
        'Invalid email',
        'Only @mit.edu and @harvard.edu emails are accepted',
        400
      );
    }

    if (password.length < 8) {
      return errorResponse('Weak password', 'Password must be at least 8 characters', 400);
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return errorResponse('Email taken', 'An account with this email already exists', 409);
    }

    const passwordHash = await hashPassword(password);
    const verificationToken = nanoid(32);

    await User.create({
      email: email.toLowerCase(),
      passwordHash,
      name,
      school,
      verificationToken,
      verificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailErr) {
      // Log so you can see the error in Vercel logs (Functions → select deployment → Logs)
      console.error('Verification email failed:', emailErr);
      // Still allow registration; user can request a new link later if we add that
    }

    return successResponse(
      {
        message: 'Check your email for a verification link',
        school,
      },
      201
    );
  } catch (err) {
    console.error('Registration error:', err);
    return errorResponse('Server error', 'Something went wrong', 500);
  }
}
