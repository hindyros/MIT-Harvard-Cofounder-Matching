import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Application from '@/lib/models/Application';
import { requireAdmin } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  try {
    await connectDB();
    const status = req.nextUrl.searchParams.get('status') || 'pending';
    const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');

    const query = status === 'all' ? {} : { status };
    const total = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'name email school profile')
      .lean();

    return successResponse({
      applications,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Admin applications error:', err);
    return errorResponse('Server error', 'Something went wrong', 500);
  }
}
