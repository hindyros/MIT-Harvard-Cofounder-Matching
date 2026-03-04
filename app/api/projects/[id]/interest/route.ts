import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Project from '@/lib/models/Project';
import { requireAuthOrAgent } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function POST(
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

    const isInterested = project.interestedUsers.some(
      (u: { toString(): string }) => u.toString() === user!._id.toString()
    );

    if (isInterested) {
      project.interestedUsers = project.interestedUsers.filter(
        (u: { toString(): string }) => u.toString() !== user!._id.toString()
      );
      await project.save();
      return successResponse({ interested: false, interestedCount: project.interestedUsers.length });
    }

    project.interestedUsers.push(user!._id);
    await project.save();
    return successResponse({ interested: true, interestedCount: project.interestedUsers.length });
  } catch (err) {
    console.error('Interest toggle error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return errorResponse('Server error', `Failed to toggle interest: ${message}`, 500);
  }
}
