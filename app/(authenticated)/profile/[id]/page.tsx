'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Profile {
  id: string;
  name: string;
  email: string;
  school: string;
  profile: {
    headline?: string;
    bio?: string;
    skills: string[];
    interests: string[];
    lookingFor: string[];
    linkedIn?: string;
    website?: string;
    avatarUrl?: string;
    yearOfStudy?: string;
    program?: string;
  };
  memberSince: string;
}

interface MutualConnection {
  id: string;
  name: string;
  school: string;
  avatarUrl?: string;
}

export default function ProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mutuals, setMutuals] = useState<MutualConnection[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`/api/profiles/${id}`).then((r) => r.json()),
      fetch(`/api/profiles/${id}/mutual`).then((r) => r.json()),
    ]).then(([profileData, mutualData]) => {
      if (profileData.success) setProfile(profileData.data);
      if (mutualData.success) setMutuals(mutualData.data.mutualConnections);
      setLoading(false);
    });
  }, [id]);

  async function startConversation() {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientId: id }),
    });
    const data = await res.json();
    if (data.success) {
      router.push(`/messages/${data.data.id}`);
    }
  }

  if (loading) {
    return <div className="animate-pulse h-96 bg-surface-elevated rounded-xl" />;
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <p className="text-text-secondary">Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-3xl">
      <Link href="/directory" className="text-text-secondary hover:text-text-primary text-sm mb-6 inline-flex items-center gap-1 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg>
        Back to directory
      </Link>

      <div className="glass rounded-2xl p-8 mt-4">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {profile.profile.avatarUrl ? (
              <img src={profile.profile.avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center text-gold text-2xl font-bold">
                {profile.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold font-display">{profile.name}</h1>
              <p className={`text-sm ${profile.school === 'MIT' ? 'text-mit' : 'text-harvard'}`}>
                {profile.school}
                {profile.profile.program && ` · ${profile.profile.program}`}
                {profile.profile.yearOfStudy && ` · ${profile.profile.yearOfStudy}`}
              </p>
            </div>
          </div>
          <button
            onClick={startConversation}
            className="bg-gold text-background px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gold-light transition-colors"
          >
            Message
          </button>
        </div>

        {mutuals.length > 0 && (
          <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-gold/5 border border-gold/10">
            <div className="flex -space-x-2">
              {mutuals.slice(0, 3).map((m) =>
                m.avatarUrl ? (
                  <img key={m.id} src={m.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover border-2 border-background" />
                ) : (
                  <div key={m.id} className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center text-gold text-[10px] font-semibold border-2 border-background">
                    {m.name.charAt(0)}
                  </div>
                )
              )}
            </div>
            <span className="text-sm text-text-secondary">
              {mutuals.length} mutual connection{mutuals.length !== 1 ? 's' : ''}
              {mutuals.length <= 3 && ` — ${mutuals.map((m) => m.name.split(' ')[0]).join(', ')}`}
            </span>
          </div>
        )}

        {profile.profile.headline && (
          <p className="text-lg text-text-secondary mb-4">{profile.profile.headline}</p>
        )}

        {profile.profile.bio && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-2">About</h3>
            <p className="text-text-secondary leading-relaxed">{profile.profile.bio}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {profile.profile.skills.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.profile.skills.map((s) => (
                  <span key={s} className="text-sm px-3 py-1 rounded-full bg-gold/10 text-gold-light">{s}</span>
                ))}
              </div>
            </div>
          )}
          {profile.profile.interests.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile.profile.interests.map((i) => (
                  <span key={i} className="text-sm px-3 py-1 rounded-full bg-surface-elevated text-text-secondary">{i}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {profile.profile.lookingFor.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-2">Looking for</h3>
            <div className="flex flex-wrap gap-2">
              {profile.profile.lookingFor.map((l) => (
                <span key={l} className="text-sm px-3 py-1 rounded-full border border-gold/30 text-gold-light">{l}</span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 pt-4 border-t border-border">
          {profile.profile.linkedIn && (
            <a href={profile.profile.linkedIn} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-gold text-sm transition-colors">
              LinkedIn
            </a>
          )}
          {profile.profile.website && (
            <a href={profile.profile.website} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-gold text-sm transition-colors">
              Website
            </a>
          )}
          <span className="text-text-tertiary text-xs ml-auto">
            Member since {new Date(profile.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  );
}
