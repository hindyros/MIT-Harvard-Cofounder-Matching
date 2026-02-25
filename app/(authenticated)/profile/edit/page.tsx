'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
interface ProfileData {
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
}

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [program, setProgram] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [linkedIn, setLinkedIn] = useState('');
  const [website, setWebsite] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [interestsInput, setInterestsInput] = useState('');
  const [lookingForInput, setLookingForInput] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarData, setAvatarData] = useState<string | null | undefined>(undefined);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) {
          router.push('/');
          return;
        }
        const d = data.data as ProfileData;
        setProfileData(d);
        setName(d.name || '');
        setHeadline(d.profile?.headline || '');
        setBio(d.profile?.bio || '');
        setProgram(d.profile?.program || '');
        setYearOfStudy(d.profile?.yearOfStudy || '');
        setLinkedIn(d.profile?.linkedIn || '');
        setWebsite(d.profile?.website || '');
        setSkillsInput((d.profile?.skills || []).join(', '));
        setInterestsInput((d.profile?.interests || []).join(', '));
        setLookingForInput((d.profile?.lookingFor || []).join(', '));
        setAvatarPreview(d.profile?.avatarUrl || '');
        setLoading(false);
      });
  }, [router]);

  const handleAvatarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 400 * 1024) {
      setError('Image must be under 400KB. Try a smaller image or compress it.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      setAvatarData(result);
      setError('');
    };
    reader.readAsDataURL(file);
  }, []);

  const removeAvatar = useCallback(() => {
    setAvatarPreview('');
    setAvatarData(null);
  }, []);

  async function handleSave() {
    setSaving(true);
    setError('');
    setSaved(false);

    const parseTags = (input: string) =>
      input.split(',').map((s) => s.trim()).filter(Boolean);

    const body: Record<string, unknown> = {
      name,
      headline,
      bio,
      program,
      yearOfStudy,
      linkedIn,
      website,
      skills: parseTags(skillsInput),
      interests: parseTags(interestsInput),
      lookingFor: parseTags(lookingForInput),
    };

    if (avatarData !== undefined) {
      body.avatar = avatarData;
    }

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6 max-w-2xl">
        <div className="h-8 bg-surface-elevated rounded w-48" />
        <div className="h-24 bg-surface-elevated rounded-xl" />
        <div className="h-40 bg-surface-elevated rounded-xl" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Profile</h1>
        <p className="text-text-secondary">Update your information visible to other members.</p>
      </div>

      <div className="space-y-8">
        {/* Avatar */}
        <section className="glass rounded-xl p-6">
          <h2 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-4">Profile Picture</h2>
          <div className="flex items-center gap-6">
            <div className="relative group">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gold/30"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center text-gold text-2xl font-semibold border-2 border-gold/30">
                  {name?.charAt(0) || '?'}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-gold/30 text-gold hover:bg-gold/10 transition-colors"
                >
                  Upload photo
                </button>
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-text-secondary hover:text-red-400 hover:border-red-500/30 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-text-tertiary">JPEG, PNG, WebP, or GIF. Max 400KB.</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </section>

        {/* Basic Info */}
        <section className="glass rounded-xl p-6">
          <h2 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface-elevated border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Headline</label>
              <input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. CS @ MIT · Building AI tools for education"
                className="w-full bg-surface-elevated border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Tell other founders about yourself, your background, and what drives you..."
                className="w-full bg-surface-elevated border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50 transition-colors resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Program</label>
                <input
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full bg-surface-elevated border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Year of Study</label>
                <input
                  value={yearOfStudy}
                  onChange={(e) => setYearOfStudy(e.target.value)}
                  placeholder="e.g. Junior, PhD Year 2"
                  className="w-full bg-surface-elevated border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50 transition-colors"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Skills & Interests */}
        <section className="glass rounded-xl p-6">
          <h2 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-4">Skills & Interests</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Skills</label>
              <input
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="e.g. Python, Machine Learning, Product Design (comma-separated)"
                className="w-full bg-surface-elevated border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50 transition-colors"
              />
              <p className="text-xs text-text-tertiary mt-1">Separate with commas. Max 15.</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Interests</label>
              <input
                value={interestsInput}
                onChange={(e) => setInterestsInput(e.target.value)}
                placeholder="e.g. AI, Climate Tech, EdTech (comma-separated)"
                className="w-full bg-surface-elevated border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50 transition-colors"
              />
              <p className="text-xs text-text-tertiary mt-1">Separate with commas. Max 15.</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Looking For</label>
              <input
                value={lookingForInput}
                onChange={(e) => setLookingForInput(e.target.value)}
                placeholder="e.g. Technical cofounder, Designer, Growth hacker (comma-separated)"
                className="w-full bg-surface-elevated border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50 transition-colors"
              />
              <p className="text-xs text-text-tertiary mt-1">Separate with commas. Max 10.</p>
            </div>
          </div>
        </section>

        {/* Links */}
        <section className="glass rounded-xl p-6">
          <h2 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-4">Links</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">LinkedIn</label>
              <input
                value={linkedIn}
                onChange={(e) => setLinkedIn(e.target.value)}
                placeholder="https://linkedin.com/in/yourname"
                className="w-full bg-surface-elevated border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Website</label>
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yoursite.com"
                className="w-full bg-surface-elevated border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Info display */}
        <div className="glass rounded-xl p-4 flex items-center gap-3">
          <svg className="w-4 h-4 text-text-tertiary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p className="text-xs text-text-tertiary">
            School: <span className="text-text-secondary">{profileData?.school}</span> · Email: <span className="text-text-secondary">{profileData?.email}</span> — these cannot be changed.
          </p>
        </div>

        {/* Save */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-gold text-background px-8 py-3 rounded-xl font-semibold hover:bg-gold-light transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 rounded-xl text-sm font-medium border border-border text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
          >
            Cancel
          </button>
          {saved && (
            <span className="text-sm text-green-400 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Saved
            </span>
          )}
          {error && <span className="text-sm text-red-400">{error}</span>}
        </div>
      </div>
    </div>
  );
}
