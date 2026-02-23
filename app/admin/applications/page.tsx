'use client';

import { useEffect, useState, useCallback } from 'react';

interface ApplicationItem {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    school: string;
    profile?: { headline?: string; skills?: string[] };
  };
  answers: {
    whyFounder: string;
    currentProject: string;
    commitment: string;
    previousExperience: string;
    whatLookingFor: string;
  };
  status: string;
  createdAt: string;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [filter, setFilter] = useState('pending');
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/applications?status=${filter}&limit=50`);
    const data = await res.json();
    if (data.success) {
      setApplications(data.data.applications);
      setSelectedIdx(0);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case 'j':
          setSelectedIdx((i) => Math.min(i + 1, applications.length - 1));
          break;
        case 'k':
          setSelectedIdx((i) => Math.max(i - 1, 0));
          break;
        case 'a':
          if (applications[selectedIdx]) reviewApplication(applications[selectedIdx]._id, 'approved');
          break;
        case 'r':
          if (applications[selectedIdx]) reviewApplication(applications[selectedIdx]._id, 'rejected');
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [applications, selectedIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  async function reviewApplication(id: string, decision: string) {
    setReviewingId(id);
    await fetch(`/api/admin/applications/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision }),
    });
    setApplications((prev) => prev.filter((a) => a._id !== id));
    setReviewingId(null);
    setSelectedIdx((i) => Math.min(i, applications.length - 2));
  }

  const selected = applications[selectedIdx];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Applications</h1>
        <div className="flex items-center gap-2">
          <div className="text-xs text-text-tertiary mr-4">
            <kbd className="px-1.5 py-0.5 bg-surface-elevated rounded text-text-secondary">j</kbd>/<kbd className="px-1.5 py-0.5 bg-surface-elevated rounded text-text-secondary">k</kbd> navigate
            <span className="mx-2">·</span>
            <kbd className="px-1.5 py-0.5 bg-surface-elevated rounded text-text-secondary">a</kbd> approve
            <span className="mx-2">·</span>
            <kbd className="px-1.5 py-0.5 bg-surface-elevated rounded text-text-secondary">r</kbd> reject
          </div>
          {['pending', 'approved', 'rejected', 'all'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filter === f ? 'bg-gold/10 text-gold' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-surface-elevated rounded-xl" />)}
        </div>
      ) : applications.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <p className="text-text-secondary">No {filter === 'all' ? '' : filter} applications.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2 max-h-[70vh] overflow-y-auto">
            {applications.map((app, idx) => (
              <button
                key={app._id}
                onClick={() => setSelectedIdx(idx)}
                className={`w-full text-left glass rounded-xl p-4 transition-all ${
                  idx === selectedIdx ? 'border-gold/40 bg-gold/5' : 'glass-hover'
                } ${reviewingId === app._id ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium">{app.userId.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    app.userId.school === 'MIT' ? 'bg-mit/20 text-mit' : 'bg-harvard/20 text-harvard'
                  }`}>
                    {app.userId.school}
                  </span>
                </div>
                <p className="text-sm text-text-secondary truncate">{app.userId.email}</p>
                <p className="text-xs text-text-tertiary mt-1">
                  Applied {new Date(app.createdAt).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>

          {selected && (
            <div className="glass rounded-xl p-6 sticky top-6 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{selected.userId.name}</h2>
                  <p className="text-sm text-text-secondary">{selected.userId.email} · {selected.userId.school}</p>
                </div>
                {filter === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => reviewApplication(selected._id, 'rejected')}
                      className="px-4 py-2 rounded-lg text-sm border border-error/30 text-error hover:bg-error/10 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => reviewApplication(selected._id, 'approved')}
                      className="px-4 py-2 rounded-lg text-sm bg-gold text-background font-semibold hover:bg-gold-light transition-colors"
                    >
                      Approve
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <QA label="Why do you want to be a founder?" answer={selected.answers.whyFounder} />
                <QA label="Current project" answer={selected.answers.currentProject} />
                <QA label="Commitment level" answer={selected.answers.commitment} />
                <QA label="Previous experience" answer={selected.answers.previousExperience} />
                <QA label="Looking for in a cofounder" answer={selected.answers.whatLookingFor} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function QA({ label, answer }: { label: string; answer: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm text-text-secondary leading-relaxed">{answer}</p>
    </div>
  );
}
