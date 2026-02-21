import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import { authenticateUser } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function GET(req: NextRequest) {
  const user = await authenticateUser(req);
  if (!user) return errorResponse('Unauthorized', 'Please log in', 401);

  return successResponse({
    id: user._id,
    name: user.name,
    email: user.email,
    school: user.school,
    profile: user.profile,
  });
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    if (!user) return errorResponse('Unauthorized', 'Please log in', 401);

    await connectDB();
    const updates = await req.json();

    const allowedFields = [
      'headline', 'bio', 'skills', 'interests', 'lookingFor',
      'linkedIn', 'website', 'avatarUrl', 'yearOfStudy', 'program',
    ];

    const profileUpdate: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        profileUpdate[`profile.${key}`] = updates[key];
      }
    }

    if (updates.name) {
      await User.updateOne({ _id: user._id }, { name: updates.name, ...profileUpdate });
    } else {
      await User.updateOne({ _id: user._id }, profileUpdate);
    }

    const updated = await User.findById(user._id);
    return successResponse({
      id: updated!._id,
      name: updated!.name,
      profile: updated!.profile,
    });
  } catch (err) {
    console.error('Profile update error:', err);
    return errorResponse('Server error', 'Something went wrong', 500);
  }
}
