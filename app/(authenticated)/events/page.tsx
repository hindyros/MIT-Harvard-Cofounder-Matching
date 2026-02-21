'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  school: string;
  category: string;
  attendeeCount: number;
  maxAttendees?: number;
  attendees: { _id: string; name: string; school: string }[];
}

const CATEGORIES = ['all', 'networking', 'workshop', 'social', 'talk', 'hackathon', 'other'];

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [school, setSchool] = useState('all');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState('');

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => {
      if (d.success) setMyId(d.data.id);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (school !== 'all') params.set('school', school);
    if (category !== 'all') params.set('category', category);
    params.set('limit', '50');

    fetch(`/api/events?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setEvents(data.data.events);
        setLoading(false);
      });
  }, [school, category]);

  async function toggleRSVP(eventId: string) {
    const res = await fetch(`/api/events/${eventId}/rsvp`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      setEvents((prev) =>
        prev.map((e) => {
          if (e.id !== eventId) return e;
          if (data.data.attending) {
            return { ...e, attendeeCount: data.data.attendeeCount, attendees: [...e.attendees, { _id: myId, name: '', school: '' }] };
          }
          return { ...e, attendeeCount: data.data.attendeeCount, attendees: e.attendees.filter((a) => a._id !== myId) };
        })
      );
    }
  }

  const grouped = groupByMonth(events);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Events</h1>
          <p className="text-text-secondary">Upcoming events from the MIT × Harvard community.</p>
        </div>
        <Link
          href="/events/new"
          className="bg-gold text-background px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gold-light transition-colors"
        >
          Create Event
        </Link>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <select
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-gold/50 transition-colors"
        >
          <option value="all">All Schools</option>
          <option value="MIT">MIT</option>
          <option value="Harvard">Harvard</option>
          <option value="Both">Joint</option>
        </select>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              category === c
                ? 'bg-gold/20 text-gold border border-gold/30'
                : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-surface-elevated rounded-xl animate-pulse" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <p className="text-text-secondary">No upcoming events found.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([month, monthEvents]) => (
            <div key={month}>
              <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-3">{month}</h3>
              <div className="space-y-3">
                {monthEvents.map((e) => {
                  const isAttending = e.attendees.some((a) => a._id === myId);
                  return (
                    <div key={e.id} className="glass rounded-xl p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-4">
                          <div className="text-center shrink-0 w-12">
                            <div className="text-2xl font-bold text-gold">{new Date(e.date).getDate()}</div>
                            <div className="text-xs text-text-tertiary uppercase">{new Date(e.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1">{e.title}</h4>
                            <p className="text-sm text-text-secondary mb-2 line-clamp-2">{e.description}</p>
                            <div className="flex items-center gap-3 text-xs text-text-tertiary">
                              <span>{new Date(e.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                              <span>{e.location}</span>
                              <span className={`px-2 py-0.5 rounded-full ${e.school === 'MIT' ? 'bg-mit/20 text-mit' : e.school === 'Harvard' ? 'bg-harvard/20 text-harvard' : 'bg-gold/20 text-gold'}`}>
                                {e.school}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-surface-elevated">{e.category}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <button
                            onClick={() => toggleRSVP(e.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                              isAttending
                                ? 'bg-gold text-background hover:bg-gold-light'
                                : 'border border-gold/30 text-gold hover:bg-gold/10'
                            }`}
                          >
                            {isAttending ? 'Going' : 'RSVP'}
                          </button>
                          <p className="text-xs text-text-tertiary mt-1">
                            {e.attendeeCount} attending{e.maxAttendees ? ` / ${e.maxAttendees}` : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function groupByMonth(events: EventItem[]) {
  const groups: Record<string, EventItem[]> = {};
  for (const e of events) {
    const month = new Date(e.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!groups[month]) groups[month] = [];
    groups[month].push(e);
  }
  return groups;
}
