'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface MatchData {
  id: string;
  matchedWith: {
    _id: string;
    name: string;
    school: string;
    profile: { headline?: string; skills?: string[] };
  };
  score: number;
  status: string;
  weekOf: string;
}

interface EventData {
  id: string;
  title: string;
  date: string;
  location: string;
  school: string;
  attendeeCount: number;
}

export default function HomePage() {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/matches').then((r) => r.json()),
      fetch('/api/events?limit=5').then((r) => r.json()),
    ]).then(([matchData, eventData]) => {
      if (matchData.success) setMatches(matchData.data.matches);
      if (eventData.success) setEvents(eventData.data.events);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 font-display">Welcome back</h1>
        <p className="text-text-secondary">Here&apos;s what&apos;s happening in your network.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <StatCard label="Your Matches" value={matches.length} subtitle="all time" />
        <StatCard label="Connected" value={matches.filter((m) => m.status === 'connected').length} subtitle="cofounders met" />
        <StatCard label="Upcoming Events" value={events.length} subtitle="in the community" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Weekly Matches</h2>
            <Link href="/directory" className="text-sm text-gold hover:text-gold-light transition-colors">
              Browse directory
            </Link>
          </div>
          {matches.length === 0 ? (
            <div className="glass rounded-xl p-8 text-center">
              <p className="text-text-secondary text-sm">Your first matches will appear here soon.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {matches.slice(0, 4).map((m) => (
                <Link key={m.id} href={`/profile/${m.matchedWith._id}`}>
                  <div className="glass glass-hover rounded-xl p-4 cursor-pointer transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold text-sm font-semibold shrink-0">
                        {m.matchedWith.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{m.matchedWith.name}</p>
                        <p className="text-sm text-text-secondary truncate">
                          {m.matchedWith.profile?.headline || m.matchedWith.school}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-semibold text-gold">{m.score}%</div>
                        <div className="text-xs text-text-tertiary">match</div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Upcoming Events</h2>
            <Link href="/events" className="text-sm text-gold hover:text-gold-light transition-colors">
              View all
            </Link>
          </div>
          {events.length === 0 ? (
            <div className="glass rounded-xl p-8 text-center">
              <p className="text-text-secondary text-sm">No upcoming events yet.</p>
              <Link href="/events/new" className="text-gold text-sm hover:text-gold-light mt-2 inline-block">
                Create the first one
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((e) => (
                <Link key={e.id} href={`/events`}>
                  <div className="glass glass-hover rounded-xl p-4 cursor-pointer transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium">{e.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${e.school === 'MIT' ? 'bg-mit/20 text-mit' : e.school === 'Harvard' ? 'bg-harvard/20 text-harvard' : 'bg-gold/20 text-gold'}`}>
                        {e.school}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary">
                      {new Date(e.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-text-tertiary mt-1">{e.location} · {e.attendeeCount} attending</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, subtitle }: { label: string; value: number; subtitle: string }) {
  return (
    <div className="glass rounded-xl p-6">
      <p className="text-text-secondary text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold text-gold">{value}</p>
      <p className="text-text-tertiary text-xs mt-1">{subtitle}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-surface-elevated rounded w-48" />
      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-surface-elevated rounded-xl" />)}
      </div>
    </div>
  );
}
