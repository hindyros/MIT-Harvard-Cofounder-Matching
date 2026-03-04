import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { generateWeeklyMatches } from '@/lib/utils/matching';
import Match from '@/lib/models/Match';
import User from '@/lib/models/User';
import { sendWeeklyMatchEmail } from '@/lib/utils/email';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    await connectDB();
    const result = await generateWeeklyMatches();

    if (result.matched === 0) {
      return Response.json({ ok: true, matched: 0 });
    }

    const weekOf = result.weekOf!;
    const matches = await Match.find({ weekOf })
      .populate('user1', 'name email school profile')
      .populate('user2', 'name email school profile');

    type PopulatedUser = {
      _id: string;
      name: string;
      email: string;
      school: string;
      profile?: { headline?: string };
    };

    const userMatches = new Map<
      string,
      { email: string; name: string; matches: { name: string; headline: string; school: string; id: string }[] }
    >();

    for (const m of matches) {
      const u1 = m.user1 as unknown as PopulatedUser;
      const u2 = m.user2 as unknown as PopulatedUser;

      for (const [self, other] of [[u1, u2], [u2, u1]] as [PopulatedUser, PopulatedUser][]) {
        const key = self._id.toString();
        if (!userMatches.has(key)) {
          userMatches.set(key, { email: self.email, name: self.name, matches: [] });
        }
        userMatches.get(key)!.matches.push({
          name: other.name,
          headline: other.profile?.headline || other.school,
          school: other.school,
          id: other._id.toString(),
        });
      }
    }

    let emailsSent = 0;
    for (const [, userData] of userMatches) {
      try {
        await sendWeeklyMatchEmail(userData.email, userData.name, userData.matches);
        emailsSent++;
      } catch (emailErr) {
        console.error(`Failed to send match email to ${userData.email}:`, emailErr);
      }
    }

    void User;
    return Response.json({ ok: true, matched: result.matched, emailsSent });
  } catch (err) {
    console.error('Cron weekly-matches error:', err);
    return Response.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}
