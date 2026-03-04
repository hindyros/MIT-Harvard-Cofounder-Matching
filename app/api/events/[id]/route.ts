import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Event from '@/lib/models/Event';
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
    const event = await Event.findById(id)
      .populate('createdBy', 'name school')
      .populate('attendees', 'name school profile.headline')
      .lean();

    if (!event) return errorResponse('Not found', 'Event not found', 404);

    return successResponse(event);
  } catch (err) {
    console.error('Event detail error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return errorResponse('Server error', `Failed to load event: ${message}`, 500);
  }
}
