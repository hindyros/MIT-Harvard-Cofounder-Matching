import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import { errorResponse } from '@/lib/utils/api-helpers';
import { comparePassword, signToken } from '@/lib/utils/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return errorResponse('Missing fields', 'Provide email and password', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return errorResponse('Invalid credentials', 'Email or password is incorrect', 401);
    }

    if (!user.isVerified) {
      return errorResponse('Email not verified', 'Check your email for the verification link', 403);
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      return errorResponse('Invalid credentials', 'Email or password is incorrect', 401);
    }

    const token = signToken(user._id.toString());

    const response = NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          school: user.school,
          isApproved: user.isApproved,
          role: user.role,
        },
      },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return errorResponse('Server error', 'Something went wrong', 500);
  }
}
