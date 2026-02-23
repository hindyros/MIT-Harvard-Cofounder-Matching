import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import { errorResponse } from '@/lib/utils/api-helpers';
import { validateEmail, hashPassword, signToken } from '@/lib/utils/auth';
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

    const skipEmailVerification = process.env.SKIP_EMAIL_VERIFY === 'true';

    await User.create({
      email: email.toLowerCase(),
      passwordHash,
      name,
      school,
      isVerified: skipEmailVerification,
      verificationToken: skipEmailVerification ? undefined : verificationToken,
      verificationExpires: skipEmailVerification
        ? undefined
        : new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    if (!skipEmailVerification) {
      try {
        await sendVerificationEmail(email, verificationToken);
      } catch (emailErr) {
        console.error('Verification email failed:', emailErr);
      }
    }

    if (skipEmailVerification) {
      const user = await User.findOne({ email: email.toLowerCase() });
      const token = signToken(user!._id.toString());
      const response = NextResponse.json(
        {
          success: true,
          data: {
            message: 'Account created. You can now continue your application.',
            school,
            skipVerification: true,
          },
        },
        { status: 201 }
      );
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });
      return response;
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          message: 'Check your email for a verification link',
          school,
          skipVerification: false,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Registration error:', err);
    return errorResponse('Server error', 'Something went wrong', 500);
  }
}
