import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import { requireAuthOrAgent } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';

const MAX_AVATAR_SIZE = 500 * 1024; // 500KB after base64
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function PUT(req: NextRequest) {
  const { user, error } = await requireAuthOrAgent(req);
  if (error) return error;

  try {
    await connectDB();
    const body = await req.json();

    const {
      name,
      headline,
      bio,
      skills,
      interests,
      lookingFor,
      linkedIn,
      website,
      yearOfStudy,
      program,
      avatar,
    } = body;

    const update: Record<string, unknown> = {};

    if (name !== undefined) {
      if (!name || name.trim().length < 1) {
        return errorResponse('Invalid name', 'Name cannot be empty', 400);
      }
      update.name = name.trim();
    }

    if (headline !== undefined) update['profile.headline'] = headline;
    if (bio !== undefined) update['profile.bio'] = bio;
    if (skills !== undefined) update['profile.skills'] = Array.isArray(skills) ? skills.slice(0, 15) : [];
    if (interests !== undefined) update['profile.interests'] = Array.isArray(interests) ? interests.slice(0, 15) : [];
    if (lookingFor !== undefined) update['profile.lookingFor'] = Array.isArray(lookingFor) ? lookingFor.slice(0, 10) : [];
    if (linkedIn !== undefined) update['profile.linkedIn'] = linkedIn;
    if (website !== undefined) update['profile.website'] = website;
    if (yearOfStudy !== undefined) update['profile.yearOfStudy'] = yearOfStudy;
    if (program !== undefined) update['profile.program'] = program;

    if (avatar !== undefined) {
      if (avatar === null) {
        update['profile.avatarUrl'] = '';
      } else if (typeof avatar === 'string' && avatar.startsWith('data:image/')) {
        const mimeMatch = avatar.match(/^data:(image\/\w+);base64,/);
        if (!mimeMatch || !ALLOWED_TYPES.includes(mimeMatch[1])) {
          return errorResponse('Invalid image', 'Only JPEG, PNG, WebP, and GIF are allowed', 400);
        }
        if (avatar.length > MAX_AVATAR_SIZE) {
          return errorResponse('Image too large', 'Avatar must be under 500KB', 400);
        }
        update['profile.avatarUrl'] = avatar;
      }
    }

    if (Object.keys(update).length === 0) {
      return errorResponse('Nothing to update', 'Provide at least one field to update', 400);
    }

    const updated = await User.findByIdAndUpdate(
      user._id,
      { $set: update },
      { new: true }
    );

    return successResponse({
      id: updated!._id,
      name: updated!.name,
      email: updated!.email,
      school: updated!.school,
      profile: updated!.profile,
    });
  } catch (err) {
    console.error('Profile update error:', err);
    return errorResponse('Server error', 'Something went wrong', 500);
  }
}
