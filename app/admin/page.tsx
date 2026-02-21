'use client';

import { useEffect, useState } from 'react';

interface Metrics {
  users: { total: number; approved: number; mit: number; harvard: number; newThisWeek: number; newThisMonth: number };
  applications: { total: number; pending: number };
  conversations: { total: number; activeThisWeek: number };
  coffeeChats: { total: number; scheduled: number; completed: number };
  matches: { total: number; connected: number };
  events: { total: number; upcoming: number };
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/metrics')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setMetrics(data.data);
        setLoading(false);
      });
  }, []);

  if (loading || !metrics) {
    return (
      <div className="animate-pulse grid grid-cols-4 gap-4">
        {[...Array(12)].map((_, i) => <div key={i} className="h-28 bg-surface-elevated rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">Platform Metrics</h1>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-4">Users</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Total Users" value={metrics.users.total} />
          <MetricCard label="Approved" value={metrics.users.approved} accent />
          <MetricCard label="MIT" value={metrics.users.mit} color="text-mit" />
          <MetricCard label="Harvard" value={metrics.users.harvard} color="text-harvard" />
          <MetricCard label="New This Week" value={metrics.users.newThisWeek} />
          <MetricCard label="New This Month" value={metrics.users.newThisMonth} />
          <MetricCard label="Pending Apps" value={metrics.applications.pending} alert={metrics.applications.pending > 0} />
          <MetricCard label="Total Apps" value={metrics.applications.total} />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-4">Engagement</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Total Conversations" value={metrics.conversations.total} />
          <MetricCard label="Active This Week" value={metrics.conversations.activeThisWeek} accent />
          <MetricCard label="Coffee Chats Scheduled" value={metrics.coffeeChats.scheduled} accent />
          <MetricCard label="Coffee Chats Completed" value={metrics.coffeeChats.completed} />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-4">Matching & Events</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Total Matches" value={metrics.matches.total} />
          <MetricCard label="Connected" value={metrics.matches.connected} accent />
          <MetricCard label="Upcoming Events" value={metrics.events.upcoming} />
          <MetricCard label="Total Events" value={metrics.events.total} />
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value, accent, alert, color }: { label: string; value: number; accent?: boolean; alert?: boolean; color?: string }) {
  return (
    <div className={`glass rounded-xl p-5 ${alert ? 'border-gold/30' : ''}`}>
      <p className="text-text-secondary text-sm mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color || (accent ? 'text-gold' : alert ? 'text-error' : 'text-text-primary')}`}>
        {value}
      </p>
    </div>
  );
}
