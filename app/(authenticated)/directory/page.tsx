'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface Member {
  id: string;
  name: string;
  school: string;
  headline?: string;
  skills: string[];
  interests: string[];
  program?: string;
  yearOfStudy?: string;
  avatarUrl?: string | null;
}

export default function DirectoryPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [school, setSchool] = useState('all');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (school !== 'all') params.set('school', school);
    params.set('limit', '50');

    const res = await fetch(`/api/directory?${params}`);
    const data = await res.json();
    if (data.success) {
      setMembers(data.data.members);
      setTotal(data.data.pagination.total);
    }
    setLoading(false);
  }, [search, school]);

  useEffect(() => {
    const timer = setTimeout(fetchMembers, 300);
    return () => clearTimeout(timer);
  }, [fetchMembers]);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 font-display">Directory</h1>
        <p className="text-text-secondary">
          {total} members in the community
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, skills, or interests..."
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
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-surface-elevated rounded-xl animate-pulse" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <p className="text-text-secondary">No members found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m) => (
            <Link key={m.id} href={`/profile/${m.id}`}>
              <div className="glass glass-hover rounded-xl p-5 cursor-pointer transition-all h-full">
                <div className="flex items-center gap-3 mb-3">
                  {m.avatarUrl ? (
                    <img src={m.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold text-sm font-semibold shrink-0">
                      {m.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium truncate">{m.name}</p>
                    <p className={`text-xs ${m.school === 'MIT' ? 'text-mit' : 'text-harvard'}`}>
                      {m.school} {m.program && `· ${m.program}`}
                    </p>
                  </div>
                </div>
                {m.headline && (
                  <p className="text-sm text-text-secondary mb-3 line-clamp-2">{m.headline}</p>
                )}
                {m.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {m.skills.slice(0, 4).map((s) => (
                      <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-gold/10 text-gold-light">
                        {s}
                      </span>
                    ))}
                    {m.skills.length > 4 && (
                      <span className="text-xs text-text-tertiary">+{m.skills.length - 4}</span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
