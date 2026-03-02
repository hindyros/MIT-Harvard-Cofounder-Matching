import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Project from '@/lib/models/Project';
import { requireAuthOrAgent } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function GET(req: NextRequest) {
  const { error } = await requireAuthOrAgent(req);
  if (error) return error;

  try {
    await connectDB();
    const q = req.nextUrl.searchParams.get('q') || '';
    const school = req.nextUrl.searchParams.get('school');
    const status = req.nextUrl.searchParams.get('status') || 'seeking';
    const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');

    const filter: Record<string, unknown> = {};
    if (status && status !== 'all') filter.status = status;
    if (school && school !== 'all') filter.school = school;
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ];
    }

    const total = await Project.countDocuments(filter);
    const projects = await Project.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('createdBy', 'name school profile.avatarUrl profile.headline')
      .lean();

    return successResponse({
      projects: projects.map((p) => ({
        id: p._id,
        title: p.title,
        description: p.description,
        rolesNeeded: p.rolesNeeded,
        tags: p.tags,
        status: p.status,
        school: p.school,
        createdBy: p.createdBy,
        interestedCount: p.interestedUsers?.length || 0,
        createdAt: p.createdAt,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Projects error:', err);
    return errorResponse('Server error', 'Something went wrong', 500);
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuthOrAgent(req);
  if (error) return error;

  try {
    await connectDB();
    const { title, description, rolesNeeded, tags, school } = await req.json();

    if (!title || !description || !school) {
      return errorResponse('Missing fields', 'Title, description, and school are required', 400);
    }

    const project = await Project.create({
      title,
      description,
      rolesNeeded: rolesNeeded || [],
      tags: tags || [],
      school,
      createdBy: user!._id,
      interestedUsers: [user!._id],
    });

    return successResponse({ id: project._id, title: project.title }, 201);
  } catch (err) {
    console.error('Create project error:', err);
    return errorResponse('Server error', 'Something went wrong', 500);
  }
}
