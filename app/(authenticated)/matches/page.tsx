'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface MatchedUser {
  _id: string;
  name: string;
  school: string;
  profile?: { headline?: string; skills?: string[]; avatarUrl?: string };
}

interface MatchData {
  id: string;
  matchedWith: MatchedUser;
  score: number;
  status: string;
  weekOf: string;
}

interface WeekGroup {
  label: string;
  weekOf: string;
  matches: MatchData[];
}

function getWeekLabel(weekOf: string): string {
  const date = new Date(weekOf);
  const now = new Date();
  const thisMonday = new Date(now);
  thisMonday.setDate(thisMonday.getDate() - thisMonday.getDay() + 1);
  thisMonday.setHours(0, 0, 0, 0);

  const diff = thisMonday.getTime() - date.getTime();
  const daysDiff = Math.round(diff / (1000 * 60 * 60 * 24));

  if (daysDiff === 0) return 'This Week';
  if (daysDiff === 7) return 'Last Week';
  return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

function groupByWeek(matches: MatchData[]): WeekGroup[] {
  const groups = new Map<string, MatchData[]>();
  for (const m of matches) {
    const key = m.weekOf;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(m);
  }
  return Array.from(groups.entries())
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
    .map(([weekOf, matches]) => ({ label: getWeekLabel(weekOf), weekOf, matches }));
}

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/matches')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setMatches(data.data.matches);
        setLoading(false);
      });
  }, []);

  const handleAction = useCallback(async (matchId: string, action: 'connect' | 'pass') => {
    setActionLoading(matchId);
    const res = await fetch(`/api/matches/${matchId}/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (data.success) {
      setMatches((prev) =>
        prev.map((m) => (m.id === matchId ? { ...m, status: data.data.status } : m))
      );
    }
    setActionLoading(null);
  }, []);

  const handleMessage = useCallback(async (recipientId: string) => {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientId }),
    });
    const data = await res.json();
    if (data.success) {
      router.push(`/messages/${data.data.id}`);
    }
  }, [router]);

  if (loading) return <LoadingSkeleton />;

  const weeks = groupByWeek(matches);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 font-display">Your Matches</h1>
        <p className="text-text-secondary">
          Every week you&apos;re matched with two people. Connect and start a conversation.
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <svg className="w-12 h-12 text-text-tertiary mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <p className="text-text-secondary mb-2">No matches yet</p>
          <p className="text-text-tertiary text-sm">Your first matches will appear here on Monday.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {weeks.map((week) => (
            <section key={week.weekOf}>
              <h2 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-3">
                {week.label}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {week.matches.map((m) => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    onConnect={() => handleAction(m.id, 'connect')}
                    onPass={() => handleAction(m.id, 'pass')}
                    onMessage={() => handleMessage(m.matchedWith._id)}
                    loading={actionLoading === m.id}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function MatchCard({
  match,
  onConnect,
  onPass,
  onMessage,
  loading,
}: {
  match: MatchData;
  onConnect: () => void;
  onPass: () => void;
  onMessage: () => void;
  loading: boolean;
}) {
  const { matchedWith, score, status } = match;

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center gap-4 mb-4">
        <Link href={`/profile/${matchedWith._id}`}>
          {matchedWith.profile?.avatarUrl ? (
            <img
              src={matchedWith.profile.avatarUrl}
              alt=""
              className="w-12 h-12 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center text-gold text-lg font-semibold shrink-0">
              {matchedWith.name.charAt(0)}
            </div>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${matchedWith._id}`} className="hover:text-gold transition-colors">
            <p className="font-medium truncate">{matchedWith.name}</p>
          </Link>
          <p className={`text-sm ${matchedWith.school === 'MIT' ? 'text-mit' : 'text-harvard'}`}>
            {matchedWith.school}
          </p>
          {matchedWith.profile?.headline && (
            <p className="text-sm text-text-secondary truncate mt-0.5">{matchedWith.profile.headline}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="text-lg font-bold text-gold">{score}%</div>
          <div className="text-xs text-text-tertiary">match</div>
        </div>
      </div>

      {matchedWith.profile?.skills && matchedWith.profile.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {matchedWith.profile.skills.slice(0, 4).map((s) => (
            <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-gold/10 text-gold-light">
              {s}
            </span>
          ))}
          {matchedWith.profile.skills.length > 4 && (
            <span className="text-xs text-text-tertiary">+{matchedWith.profile.skills.length - 4}</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 pt-3 border-t border-border">
        {status === 'connected' && (
          <>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full">
              Connected
            </span>
            <button
              onClick={onMessage}
              className="ml-auto bg-gold text-background px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gold-light transition-colors"
            >
              Message
            </button>
          </>
        )}
        {status === 'passed' && (
          <span className="text-xs font-medium text-text-tertiary bg-surface-elevated px-2.5 py-1 rounded-full">
            Passed
          </span>
        )}
        {(status === 'sent' || status === 'viewed') && (
          <>
            <button
              onClick={onConnect}
              disabled={loading}
              className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
            >
              Connect
            </button>
            <button
              onClick={onPass}
              disabled={loading}
              className="bg-surface-elevated text-text-secondary px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-surface-elevated/80 transition-colors disabled:opacity-50"
            >
              Pass
            </button>
            <button
              onClick={onMessage}
              className="ml-auto text-gold hover:text-gold-light text-sm font-medium transition-colors"
            >
              Message
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-surface-elevated rounded w-48" />
      <div className="h-4 bg-surface-elevated rounded w-80" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 bg-surface-elevated rounded-xl" />
        ))}
      </div>
    </div>
  );
}
