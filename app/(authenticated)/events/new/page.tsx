'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewEventPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    endDate: '',
    location: '',
    school: 'Both',
    category: 'networking',
    maxAttendees: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        maxAttendees: form.maxAttendees ? parseInt(form.maxAttendees) : undefined,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!data.success) {
      setError(data.hint || data.error);
      return;
    }

    router.push('/events');
  }

  return (
    <div className="animate-fade-in max-w-2xl">
      <Link href="/events" className="text-text-secondary hover:text-text-primary text-sm mb-6 inline-flex items-center gap-1 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg>
        Back to events
      </Link>

      <h1 className="text-3xl font-bold mb-8 mt-4">Create Event</h1>

      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg px-4 py-3 mb-6 text-sm text-error">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-5">
        <div>
          <label className="block text-sm text-text-secondary mb-2">Event Title</label>
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Founder Fireside Chat" className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-gold/50 transition-colors" required />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-2">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What is this event about?" rows={4} className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-gold/50 transition-colors resize-none" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Start Date & Time</label>
            <input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-gold/50 transition-colors" required />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-2">End Date & Time (optional)</label>
            <input type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-gold/50 transition-colors" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-2">Location</label>
          <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. MIT Media Lab, Room 633" className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-gold/50 transition-colors" required />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">School</label>
            <select value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-gold/50 transition-colors">
              <option value="Both">Both</option>
              <option value="MIT">MIT</option>
              <option value="Harvard">Harvard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-2">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-gold/50 transition-colors">
              <option value="networking">Networking</option>
              <option value="workshop">Workshop</option>
              <option value="social">Social</option>
              <option value="talk">Talk</option>
              <option value="hackathon">Hackathon</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-2">Max Attendees</label>
            <input type="number" value={form.maxAttendees} onChange={(e) => setForm({ ...form, maxAttendees: e.target.value })} placeholder="Unlimited" className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-gold/50 transition-colors" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-gold text-background font-semibold py-3 rounded-lg hover:bg-gold-light transition-colors disabled:opacity-50">
          {loading ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
}
