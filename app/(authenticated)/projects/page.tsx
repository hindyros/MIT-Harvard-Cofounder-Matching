'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface Creator {
  _id: string;
  name: string;
  school: string;
  profile?: { avatarUrl?: string; headline?: string };
}

interface ProjectData {
  id: string;
  title: string;
  description: string;
  rolesNeeded: string[];
  tags: string[];
  status: string;
  school: string;
  createdBy: Creator;
  interestedCount: number;
  createdAt: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [search, setSearch] = useState('');
  const [school, setSchool] = useState('all');
  const [status, setStatus] = useState('seeking');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', rolesNeeded: '', tags: '', school: 'Both' });

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (school !== 'all') params.set('school', school);
    if (status !== 'all') params.set('status', status);
    params.set('limit', '50');

    const res = await fetch(`/api/projects?${params}`);
    const data = await res.json();
    if (data.success) setProjects(data.data.projects);
    setLoading(false);
  }, [search, school, status]);

  useEffect(() => {
    const timer = setTimeout(fetchProjects, 300);
    return () => clearTimeout(timer);
  }, [fetchProjects]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        rolesNeeded: form.rolesNeeded.split(',').map((s) => s.trim()).filter(Boolean),
        tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
        school: form.school,
      }),
    });
    if (res.ok) {
      setForm({ title: '', description: '', rolesNeeded: '', tags: '', school: 'Both' });
      setShowCreate(false);
      fetchProjects();
    }
    setCreating(false);
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 font-display">Project Board</h1>
          <p className="text-text-secondary">Post ideas and find collaborators.</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-gold text-background px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gold-light transition-colors"
        >
          {showCreate ? 'Cancel' : 'Post a Project'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="glass rounded-xl p-6 mb-6 space-y-4">
          <input
            type="text"
            placeholder="Project title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-gold/50 transition-colors"
          />
          <textarea
            placeholder="Describe your project or idea..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            rows={3}
            className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-gold/50 transition-colors resize-none"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Roles needed (comma-separated)"
              value={form.rolesNeeded}
              onChange={(e) => setForm({ ...form, rolesNeeded: e.target.value })}
              className="bg-surface border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-gold/50 transition-colors"
            />
            <input
              type="text"
              placeholder="Tags (comma-separated)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="bg-surface border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-gold/50 transition-colors"
            />
            <select
              value={form.school}
              onChange={(e) => setForm({ ...form, school: e.target.value })}
              className="bg-surface border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-gold/50 transition-colors"
            >
              <option value="Both">Both Schools</option>
              <option value="MIT">MIT</option>
              <option value="Harvard">Harvard</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="bg-gold text-background px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gold-light transition-colors disabled:opacity-50"
          >
            {creating ? 'Posting...' : 'Post Project'}
          </button>
        </form>
      )}

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-gold/50 transition-colors"
          />
        </div>
        <select
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          className="bg-surface border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-gold/50 transition-colors"
        >
          <option value="all">All Schools</option>
          <option value="MIT">MIT</option>
          <option value="Harvard">Harvard</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-surface border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-gold/50 transition-colors"
        >
          <option value="seeking">Seeking</option>
          <option value="in_progress">In Progress</option>
          <option value="closed">Closed</option>
          <option value="all">All</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-52 bg-surface-elevated rounded-xl animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <p className="text-text-secondary">No projects found. Be the first to post one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <Link key={p.id} href={`/projects/${p.id}`}>
              <div className="glass glass-hover rounded-xl p-5 cursor-pointer transition-all h-full">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.school === 'MIT' ? 'bg-mit/20 text-mit' : p.school === 'Harvard' ? 'bg-harvard/20 text-harvard' : 'bg-gold/20 text-gold'}`}>
                    {p.school}
                  </span>
                  <span className="text-xs text-text-tertiary">{p.interestedCount} interested</span>
                </div>
                <h3 className="font-semibold mb-1 line-clamp-1">{p.title}</h3>
                <p className="text-sm text-text-secondary mb-3 line-clamp-2">{p.description}</p>
                {p.rolesNeeded.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {p.rolesNeeded.slice(0, 3).map((r) => (
                      <span key={r} className="text-xs px-2 py-0.5 rounded-full border border-gold/30 text-gold-light">{r}</span>
                    ))}
                    {p.rolesNeeded.length > 3 && (
                      <span className="text-xs text-text-tertiary">+{p.rolesNeeded.length - 3}</span>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  {p.createdBy?.profile?.avatarUrl ? (
                    <img src={p.createdBy.profile.avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center text-gold text-[10px] font-semibold">
                      {p.createdBy?.name?.charAt(0)}
                    </div>
                  )}
                  <span className="text-xs text-text-secondary">{p.createdBy?.name}</span>
                  <span className="text-xs text-text-tertiary ml-auto">
                    {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
