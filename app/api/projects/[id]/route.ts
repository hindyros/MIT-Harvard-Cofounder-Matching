import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Project from '@/lib/models/Project';
import { requireAuthOrAgent } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuthOrAgent(req);
  if (error) return error;

  try {
    await connectDB();
    const { id } = await params;
    const project = await Project.findById(id)
      .populate('createdBy', 'name school profile.avatarUrl profile.headline')
      .populate('interestedUsers', 'name school profile.avatarUrl profile.headline')
      .lean();

    if (!project) return errorResponse('Not found', 'Project not found', 404);

    return successResponse(project);
  } catch (err) {
    console.error('Project detail error:', err);
    return errorResponse('Server error', 'Something went wrong', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuthOrAgent(req);
  if (error) return error;

  try {
    await connectDB();
    const { id } = await params;
    const project = await Project.findById(id);

    if (!project) return errorResponse('Not found', 'Project not found', 404);
    if (project.createdBy.toString() !== user!._id.toString()) {
      return errorResponse('Forbidden', 'Only the creator can delete this project', 403);
    }

    await Project.deleteOne({ _id: id });
    return successResponse({ deleted: true });
  } catch (err) {
    console.error('Delete project error:', err);
    return errorResponse('Server error', 'Something went wrong', 500);
  }
}
