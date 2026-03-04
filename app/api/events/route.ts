import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Event from '@/lib/models/Event';
import { requireAuthOrAgent } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function GET(req: NextRequest) {
  const { error } = await requireAuthOrAgent(req);
  if (error) return error;

  try {
    await connectDB();
    const school = req.nextUrl.searchParams.get('school');
    const category = req.nextUrl.searchParams.get('category');
    const upcoming = req.nextUrl.searchParams.get('upcoming') !== 'false';
    const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');

    const filter: Record<string, unknown> = {};
    if (upcoming) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      filter.date = { $gte: startOfDay };
    }
    if (school && school !== 'all') filter.school = school;
    if (category) filter.category = category;

    const total = await Event.countDocuments(filter);
    const events = await Event.find(filter)
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('createdBy', 'name school')
      .populate('attendees', 'name school')
      .lean();

    return successResponse({
      events: events.map((e) => ({
        id: e._id,
        title: e.title,
        description: e.description,
        date: e.date,
        endDate: e.endDate,
        location: e.location,
        school: e.school,
        category: e.category,
        createdBy: e.createdBy,
        attendeeCount: e.attendees?.length || 0,
        maxAttendees: e.maxAttendees,
        attendees: e.attendees,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Events error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return errorResponse('Server error', `Failed to load events: ${message}`, 500);
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuthOrAgent(req);
  if (error) return error;

  try {
    await connectDB();
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return errorResponse('Invalid request body', 'Expected a JSON object with event fields', 400);
    }

    const { title, description, date, endDate, location, school, category, maxAttendees } =
      body as { title?: string; description?: string; date?: string; endDate?: string; location?: string; school?: string; category?: string; maxAttendees?: number };

    if (!title || !description || !date || !location || !school || !category) {
      return errorResponse('Missing fields', 'Title, description, date, location, school, and category are required', 400);
    }

    const event = await Event.create({
      title,
      description,
      date: new Date(date),
      endDate: endDate ? new Date(endDate) : undefined,
      location,
      school,
      category,
      createdBy: user!._id,
      attendees: [user!._id],
      maxAttendees,
    });

    return successResponse({ id: event._id, title: event.title }, 201);
  } catch (err) {
    console.error('Create event error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return errorResponse('Server error', `Failed to create event: ${message}`, 500);
  }
}
