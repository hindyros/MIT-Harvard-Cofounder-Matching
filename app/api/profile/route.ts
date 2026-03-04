import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import { requireAuthOrAgent } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';

const MAX_AVATAR_SIZE = 500 * 1024; // 500KB after base64
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function PUT(req: NextRequest) {
  try {
    const { user, error } = await requireAuthOrAgent(req);
    if (error) return error;
    if (!user) return errorResponse('Unauthorized', 'Authentication failed', 401);

    await connectDB();

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return errorResponse('Invalid request body', 'Expected a JSON object with profile fields', 400);
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return errorResponse('Invalid request body', 'Expected a JSON object with profile fields', 400);
    }

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
      const trimmed = typeof name === 'string' ? name.trim() : '';
      if (trimmed.length < 1) {
        return errorResponse('Invalid name', 'Name cannot be empty', 400);
      }
      update.name = trimmed;
    }

    if (headline !== undefined) update['profile.headline'] = typeof headline === 'string' ? headline : String(headline ?? '');
    if (bio !== undefined) update['profile.bio'] = typeof bio === 'string' ? bio : String(bio ?? '');
    if (skills !== undefined) update['profile.skills'] = Array.isArray(skills) ? skills.map(String).slice(0, 15) : [];
    if (interests !== undefined) update['profile.interests'] = Array.isArray(interests) ? interests.map(String).slice(0, 15) : [];
    if (lookingFor !== undefined) update['profile.lookingFor'] = Array.isArray(lookingFor) ? lookingFor.map(String).slice(0, 10) : [];
    if (linkedIn !== undefined) update['profile.linkedIn'] = typeof linkedIn === 'string' ? linkedIn : '';
    if (website !== undefined) update['profile.website'] = typeof website === 'string' ? website : '';
    if (yearOfStudy !== undefined) update['profile.yearOfStudy'] = typeof yearOfStudy === 'string' ? yearOfStudy : String(yearOfStudy ?? '');
    if (program !== undefined) update['profile.program'] = typeof program === 'string' ? program : String(program ?? '');

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

    if (!updated) {
      return errorResponse('User not found', 'Could not find user to update', 404);
    }

    return successResponse({
      id: updated._id,
      name: updated.name,
      email: updated.email,
      school: updated.school,
      profile: updated.profile,
    });
  } catch (err) {
    console.error('Profile update error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return errorResponse('Server error', `Profile update failed: ${message}`, 500);
  }
}
