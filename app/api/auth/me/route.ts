import { NextRequest } from 'next/server';
import { authenticateUser } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function GET(req: NextRequest) {
  const user = await authenticateUser(req);
  if (!user) {
    return errorResponse('Unauthorized', 'Please log in', 401);
  }

  return successResponse({
    id: user._id,
    name: user.name,
    email: user.email,
    school: user.school,
    isVerified: user.isVerified,
    isApproved: user.isApproved,
    role: user.role,
    profile: user.profile,
    createdAt: user.createdAt,
  });
}
