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

    let updates: Record<string, unknown>;
    try {
      updates = await req.json();
    } catch {
      return errorResponse('Invalid request body', 'Expected a JSON object with profile fields', 400);
    }

    if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
      return errorResponse('Invalid request body', 'Expected a JSON object with profile fields', 400);
    }

    const allowedFields = [
      'headline', 'bio', 'skills', 'interests', 'lookingFor',
      'linkedIn', 'website', 'avatarUrl', 'yearOfStudy', 'program',
    ];

    const setFields: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        setFields[`profile.${key}`] = updates[key];
      }
    }

    if (updates.name && typeof updates.name === 'string') {
      setFields.name = updates.name.trim();
    }

    if (Object.keys(setFields).length === 0) {
      return errorResponse('Nothing to update', 'Provide at least one field to update', 400);
    }

    await User.updateOne({ _id: user._id }, { $set: setFields });

    const updated = await User.findById(user._id);
    if (!updated) {
      return errorResponse('User not found', 'Could not find user after update', 404);
    }

    return successResponse({
      id: updated._id,
      name: updated.name,
      profile: updated.profile,
    });
  } catch (err) {
    console.error('Profile update error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return errorResponse('Server error', `Profile update failed: ${message}`, 500);
  }
}
