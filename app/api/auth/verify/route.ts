import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import { signToken } from '@/lib/utils/auth';
import { getBaseUrl } from '@/lib/utils/api-helpers';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const token = req.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(`${getBaseUrl()}/login?error=invalid-token`);
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.redirect(`${getBaseUrl()}/login?error=expired-token`);
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    const jwt = signToken(user._id.toString());
    const response = NextResponse.redirect(`${getBaseUrl()}/apply?step=application`);
    response.cookies.set('token', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Verification error:', err);
    return NextResponse.redirect(`${getBaseUrl()}/login?error=server-error`);
  }
}
