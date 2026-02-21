import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { requireAdmin } from '@/lib/utils/auth';
import { generateWeeklyMatches } from '@/lib/utils/matching';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';
import User from '@/lib/models/User';
import Match from '@/lib/models/Match';
import { sendWeeklyMatchEmail } from '@/lib/utils/email';

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  try {
    await connectDB();
    const { sendEmails } = await req.json().catch(() => ({ sendEmails: false }));

    const result = await generateWeeklyMatches();

    if (sendEmails && result.matched > 0) {
      const now = new Date();
      const weekOf = new Date(now);
      weekOf.setDate(weekOf.getDate() - weekOf.getDay() + 1);
      weekOf.setHours(0, 0, 0, 0);

      const matches = await Match.find({ weekOf })
        .populate('user1', 'name email school profile')
        .populate('user2', 'name email school profile');

      const userMatches = new Map<string, { email: string; name: string; matches: { name: string; headline: string; school: string; id: string }[] }>();

      for (const m of matches) {
        const u1 = m.user1 as unknown as { _id: string; name: string; email: string; school: string; profile?: { headline?: string } };
        const u2 = m.user2 as unknown as { _id: string; name: string; email: string; school: string; profile?: { headline?: string } };

        if (!userMatches.has(u1._id.toString())) {
          userMatches.set(u1._id.toString(), { email: u1.email, name: u1.name, matches: [] });
        }
        userMatches.get(u1._id.toString())!.matches.push({
          name: u2.name,
          headline: u2.profile?.headline || u2.school,
          school: u2.school,
          id: u2._id.toString(),
        });

        if (!userMatches.has(u2._id.toString())) {
          userMatches.set(u2._id.toString(), { email: u2.email, name: u2.name, matches: [] });
        }
        userMatches.get(u2._id.toString())!.matches.push({
          name: u1.name,
          headline: u1.profile?.headline || u1.school,
          school: u1.school,
          id: u1._id.toString(),
        });
      }

      let emailsSent = 0;
      for (const [, userData] of userMatches) {
        try {
          await sendWeeklyMatchEmail(userData.email, userData.name, userData.matches);
          emailsSent++;
        } catch {
          // continue on email failure
        }
      }

      return successResponse({ ...result, emailsSent });
    }

    void User; // ensure model registration
    return successResponse(result);
  } catch (err) {
    console.error('Match generation error:', err);
    return errorResponse('Server error', 'Something went wrong', 500);
  }
}
