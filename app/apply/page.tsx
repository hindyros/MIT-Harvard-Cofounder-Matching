'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';

type Step = 'loading' | 'ineligible' | 'application' | 'profile' | 'pending';

export default function ApplyPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const [step, setStep] = useState<Step>('loading');

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push('/sign-up');
      return;
    }

    let cancelled = false;

    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();

        if (cancelled) return;

        if (!data.success) {
          if (res.status === 403) {
            setStep('ineligible');
            return;
          }
          const retryRes = await new Promise<Response>((resolve) =>
            setTimeout(() => resolve(fetch('/api/auth/me')), 2000)
          );
          const retryData = await retryRes.json();
          if (cancelled) return;
          if (!retryData.success) {
            setStep(retryRes.status === 403 ? 'ineligible' : 'application');
            return;
          }
          routeUser(retryData.data);
          return;
        }

        routeUser(data.data);
      } catch {
        if (!cancelled) setStep('application');
      }
    }

    async function routeUser(user: { isApproved: boolean }) {
      if (user.isApproved) {
        router.push('/home');
        return;
      }
      try {
        const appRes = await fetch('/api/applications').then((r) => r.json());
        if (appRes.success && appRes.data.status !== 'not_submitted') {
          setStep('pending');
        } else {
          setStep('application');
        }
      } catch {
        setStep('application');
      }
    }

    checkAuth();
    return () => { cancelled = true; };
  }, [isLoaded, isSignedIn, router]);

  if (step === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (step === 'ineligible') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md animate-fade-in">
          <PageHeader />
          <div className="glass rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Email not eligible</h2>
            <p className="text-text-secondary text-sm mb-6">
              William x John is exclusively for MIT and Harvard students.
              Only <span className="text-text-primary">@mit.edu</span> and <span className="text-text-primary">@harvard.edu</span> emails are accepted.
            </p>
            <button
              onClick={() => signOut().then(() => router.push('/sign-up'))}
              className="w-full bg-gold text-background font-semibold py-3 rounded-lg hover:bg-gold-light transition-colors"
            >
              Sign out and try a different email
            </button>
            <Link href="/" className="block text-text-tertiary hover:text-text-secondary text-sm mt-4 transition-colors">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg animate-fade-in">
        <PageHeader />

        <StepIndicator current={step} />

        {step === 'application' && <ApplicationStep onNext={() => setStep('profile')} onAlreadyApplied={() => setStep('pending')} />}
        {step === 'profile' && <ProfileStep onNext={() => setStep('pending')} />}
        {step === 'pending' && <PendingStep />}
      </div>
    </div>
  );
}

function PageHeader() {
  return (
    <div className="text-center mb-10">
      <Link href="/" className="inline-block">
        <h1 className="text-2xl font-bold text-gold font-display">William x John</h1>
        <p className="text-text-tertiary text-sm mt-1">MIT × Harvard Cofounder Matching</p>
      </Link>
    </div>
  );
}

function StepIndicator({ current }: { current: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: 'application', label: 'Application' },
    { key: 'profile', label: 'Profile' },
    { key: 'pending', label: 'Review' },
  ];

  const currentIdx = steps.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
              i <= currentIdx
                ? 'bg-gold text-background'
                : 'bg-surface border border-border text-text-tertiary'
            }`}
          >
            {i + 1}
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-8 h-px ${i < currentIdx ? 'bg-gold' : 'bg-border'}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function ApplicationStep({ onNext, onAlreadyApplied }: { onNext: () => void; onAlreadyApplied: () => void }) {
  const [answers, setAnswers] = useState({
    whyFounder: '',
    currentProject: '',
    commitment: '',
    previousExperience: '',
    whatLookingFor: '',
  });
  const [error, setError] = useState('');
  const [showSignIn, setShowSignIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const questions = [
    { key: 'whyFounder' as const, label: 'Why do you want to be a founder?', placeholder: 'What drives you to build a company...' },
    { key: 'currentProject' as const, label: 'What are you currently working on?', placeholder: 'Describe your current project or idea...' },
    { key: 'commitment' as const, label: 'What is your commitment level?', placeholder: 'Full-time after graduation, part-time while studying, etc.' },
    { key: 'previousExperience' as const, label: 'Relevant experience', placeholder: 'Previous startups, internships, research, hackathons...' },
    { key: 'whatLookingFor' as const, label: 'What are you looking for in a cofounder?', placeholder: 'Skills, personality, commitment level...' },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setShowSignIn(false);
    setLoading(true);

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      });

      const data = await res.json();
      setLoading(false);

      if (!data.success) {
        if (res.status === 401) {
          setError('Your session has expired.');
          setShowSignIn(true);
          return;
        }
        if (res.status === 409) {
          onAlreadyApplied();
          return;
        }
        setError(data.hint || data.error);
        return;
      }

      onNext();
    } catch {
      setLoading(false);
      setError('Something went wrong. Please try again.');
    }
  }

  return (
    <div className="glass rounded-2xl p-8">
      <h2 className="text-xl font-semibold mb-2">Tell us about yourself</h2>
      <p className="text-text-secondary text-sm mb-6">
        We keep our community small and high-quality. Short, honest answers are best.
      </p>

      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg px-4 py-3 mb-6 text-sm text-error">
          <p>{error}</p>
          {showSignIn && (
            <Link href="/sign-in" className="underline hover:text-error/80 mt-1 inline-block">
              Sign in again
            </Link>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {questions.map((q) => (
          <div key={q.key}>
            <label className="block text-sm text-text-secondary mb-2">{q.label}</label>
            <textarea
              value={answers[q.key]}
              onChange={(e) => setAnswers({ ...answers, [q.key]: e.target.value })}
              placeholder={q.placeholder}
              rows={3}
              className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-gold/50 transition-colors resize-none"
              required
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gold text-background font-semibold py-3 rounded-lg hover:bg-gold-light transition-colors disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}

function ProfileStep({ onNext }: { onNext: () => void }) {
  const [profile, setProfile] = useState({
    headline: '',
    bio: '',
    skills: '',
    interests: '',
    lookingFor: '',
    linkedIn: '',
    yearOfStudy: '',
    program: '',
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await fetch('/api/profiles/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        headline: profile.headline,
        bio: profile.bio,
        skills: profile.skills.split(',').map((s) => s.trim()).filter(Boolean),
        interests: profile.interests.split(',').map((s) => s.trim()).filter(Boolean),
        lookingFor: profile.lookingFor.split(',').map((s) => s.trim()).filter(Boolean),
        linkedIn: profile.linkedIn,
        yearOfStudy: profile.yearOfStudy,
        program: profile.program,
      }),
    });

    setLoading(false);
    onNext();
  }

  return (
    <div className="glass rounded-2xl p-8">
      <h2 className="text-xl font-semibold mb-2">Build your profile</h2>
      <p className="text-text-secondary text-sm mb-6">
        This is what other members will see. You can always update it later.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm text-text-secondary mb-2">Headline</label>
          <input
            type="text"
            value={profile.headline}
            onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
            placeholder="e.g. Building AI tools for healthcare"
            className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-gold/50 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-2">Bio</label>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            placeholder="Tell others about yourself..."
            rows={3}
            className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-gold/50 transition-colors resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Program</label>
            <input
              type="text"
              value={profile.program}
              onChange={(e) => setProfile({ ...profile, program: e.target.value })}
              placeholder="e.g. CS PhD, MBA"
              className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-2">Year</label>
            <input
              type="text"
              value={profile.yearOfStudy}
              onChange={(e) => setProfile({ ...profile, yearOfStudy: e.target.value })}
              placeholder="e.g. 2nd year, Alumni"
              className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-2">Skills (comma-separated)</label>
          <input
            type="text"
            value={profile.skills}
            onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
            placeholder="e.g. Python, Product Design, Sales"
            className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-gold/50 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-2">Interests (comma-separated)</label>
          <input
            type="text"
            value={profile.interests}
            onChange={(e) => setProfile({ ...profile, interests: e.target.value })}
            placeholder="e.g. Fintech, AI, Climate Tech"
            className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-gold/50 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-2">Looking for (comma-separated)</label>
          <input
            type="text"
            value={profile.lookingFor}
            onChange={(e) => setProfile({ ...profile, lookingFor: e.target.value })}
            placeholder="e.g. Technical cofounder, Business lead"
            className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-gold/50 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-2">LinkedIn (optional)</label>
          <input
            type="url"
            value={profile.linkedIn}
            onChange={(e) => setProfile({ ...profile, linkedIn: e.target.value })}
            placeholder="https://linkedin.com/in/..."
            className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-gold/50 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gold text-background font-semibold py-3 rounded-lg hover:bg-gold-light transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Complete Profile'}
        </button>
      </form>
    </div>
  );
}

function PendingStep() {
  return (
    <div className="glass rounded-2xl p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold mb-2">Application under review</h2>
      <p className="text-text-secondary text-sm mb-6">
        We review every application personally. You&apos;ll hear from us within 48 hours.
      </p>
      <Link
        href="/"
        className="text-gold hover:text-gold-light text-sm transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}
