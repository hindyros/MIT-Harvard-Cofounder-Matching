import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Event from '@/lib/models/Event';
import { requireAuth } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  try {
    await connectDB();
    const { id } = await params;
    const event = await Event.findById(id);

    if (!event) return errorResponse('Not found', 'Event not found', 404);

    const isAttending = event.attendees.some(
      (a: { toString(): string }) => a.toString() === user!._id.toString()
    );

    if (isAttending) {
      event.attendees = event.attendees.filter(
        (a: { toString(): string }) => a.toString() !== user!._id.toString()
      );
      await event.save();
      return successResponse({ attending: false, attendeeCount: event.attendees.length });
    }

    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      return errorResponse('Event full', 'This event has reached maximum capacity', 409);
    }

    event.attendees.push(user!._id);
    await event.save();
    return successResponse({ attending: true, attendeeCount: event.attendees.length });
  } catch (err) {
    console.error('RSVP error:', err);
    return errorResponse('Server error', 'Something went wrong', 500);
  }
}
