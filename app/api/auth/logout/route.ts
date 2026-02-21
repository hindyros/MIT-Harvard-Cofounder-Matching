import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, data: { message: 'Logged out' } });
  response.cookies.set('token', '', { maxAge: 0, path: '/' });
  return response;
}
