import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import { signToken } from '@/lib/utils/auth';
import { getBaseUrl } from '@/lib/utils/api-helpers';

export async function GET(req: NextRequest) {
  const baseUrl = getBaseUrl();

  try {
    await connectDB();
    const token = req.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent('Invalid verification link.')}`);
    }

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent('This verification link is invalid or has already been used.')}`);
    }

    if (user.isVerified) {
      const jwt = signToken(user._id.toString());
      const response = NextResponse.redirect(`${baseUrl}/apply?step=application`);
      response.cookies.set('token', jwt, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });
      return response;
    }

    if (user.verificationExpires && user.verificationExpires < new Date()) {
      return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent('This verification link has expired. Please register again.')}`);
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    const jwt = signToken(user._id.toString());
    const response = NextResponse.redirect(`${baseUrl}/apply?step=application`);
    response.cookies.set('token', jwt, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Verification error:', err);
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent('Something went wrong. Please try again.')}`);
  }
}
