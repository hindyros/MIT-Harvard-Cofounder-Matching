import { auth } from '@clerk/nextjs/server';
import { authenticateUser } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function GET() {
  const user = await authenticateUser();
  if (!user) {
    const { userId } = await auth().catch(() => ({ userId: null }));
    if (userId) {
      return errorResponse(
        'Ineligible email',
        'Only @mit.edu and @harvard.edu email addresses are accepted.',
        403
      );
    }
    return errorResponse('Unauthorized', 'Please log in', 401);
  }

  return successResponse({
    id: user._id,
    name: user.name,
    email: user.email,
    school: user.school,
    isApproved: user.isApproved,
    role: user.role,
    profile: user.profile,
    createdAt: user.createdAt,
  });
}
