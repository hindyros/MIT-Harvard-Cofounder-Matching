'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center">
              <span className="text-gold font-bold text-sm">FC</span>
            </div>
            <span className="font-semibold text-lg">Founders Club</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
              Sign In
            </Link>
            <Link
              href="/apply"
              className="text-sm bg-gold text-background px-4 py-2 rounded-lg font-semibold hover:bg-gold-light transition-colors"
            >
              Apply
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(201,168,76,0.08)_0%,_transparent_60%)]" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl" />

        <div className={`max-w-4xl mx-auto text-center relative z-10 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/20 bg-gold/5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-gold text-xs font-medium tracking-wider uppercase">By invitation only</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] mb-6 tracking-tight">
            Find your next
            <br />
            <span className="text-gold">cofounder</span>
          </h1>

          <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            An exclusive network connecting the sharpest minds at MIT and Harvard.
            Curated matches. Real conversations. No noise.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/apply"
              className="bg-gold text-background px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-gold-light transition-all hover:shadow-[0_0_32px_rgba(201,168,76,0.3)]"
            >
              Apply Now
            </Link>
            <Link
              href="/login"
              className="border border-border px-8 py-3.5 rounded-xl font-semibold text-lg text-text-secondary hover:text-text-primary hover:border-border-bright transition-colors"
            >
              Sign In
            </Link>
          </div>

          <p className="text-text-tertiary text-sm mt-6">
            Only @mit.edu and @harvard.edu emails accepted
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for serious founders</h2>
            <p className="text-text-secondary text-lg max-w-xl mx-auto">
              Every feature designed to help you find the right person to build with.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<MatchIcon />}
              title="Weekly Matches"
              description="Our algorithm pairs you with 2 potential cofounders every week based on complementary skills and shared interests."
            />
            <FeatureCard
              icon={<DirectoryIcon />}
              title="Curated Directory"
              description="Search and filter the entire community by name, skills, school, and interests. Every member is hand-approved."
            />
            <FeatureCard
              icon={<MessageIcon />}
              title="Direct Messaging"
              description="Reach out to anyone in the community. Start a conversation, schedule a coffee chat, explore ideas together."
            />
            <FeatureCard
              icon={<CalendarIcon />}
              title="Events Calendar"
              description="Discover and RSVP to MIT and Harvard entrepreneurship events. Know what's happening in your community."
            />
            <FeatureCard
              icon={<ShieldIcon />}
              title="Quality Guaranteed"
              description="Application-based admission. Every member is reviewed to ensure serious intent and high caliber."
            />
            <FeatureCard
              icon={<BotIcon />}
              title="AI Agent Ready"
              description="Your OpenClaw agent can browse the directory, message members, and find matches autonomously on your behalf."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">How it works</h2>

          <div className="space-y-12">
            <Step number={1} title="Apply with your university email" description="Only @mit.edu and @harvard.edu emails are accepted. Tell us about yourself, what you're building, and what kind of cofounder you're looking for." />
            <Step number={2} title="Get reviewed and approved" description="We personally review every application to maintain the quality of the community. Typical turnaround is under 48 hours." />
            <Step number={3} title="Get matched every week" description="Our algorithm analyzes skills, interests, and preferences to send you 2 curated cofounder suggestions every Monday." />
            <Step number={4} title="Connect and build" description="Browse the directory, message anyone, schedule coffee chats, attend events. Find the person you'll build the future with." />
          </div>
        </div>
      </section>

      {/* Agent section */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/20 bg-gold/5 mb-6">
            <span className="text-gold text-xs font-medium tracking-wider uppercase">OpenClaw Compatible</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Let your agent do the work</h2>
          <p className="text-text-secondary text-lg max-w-xl mx-auto mb-10">
            Founders Club is fully accessible to AI agents. Your OpenClaw agent can browse, message, and match on your behalf.
          </p>
          <div className="glass rounded-2xl p-8 text-left max-w-lg mx-auto">
            <p className="text-text-secondary text-sm mb-3">Tell your OpenClaw agent:</p>
            <code className="text-gold text-lg font-mono">
              Read {typeof window !== 'undefined' ? window.location.origin : ''}/skill.md
            </code>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to find your cofounder?</h2>
          <p className="text-text-secondary text-lg mb-8">
            Join the most selective founder community at MIT and Harvard.
          </p>
          <Link
            href="/apply"
            className="inline-block bg-gold text-background px-10 py-4 rounded-xl font-semibold text-lg hover:bg-gold-light transition-all hover:shadow-[0_0_32px_rgba(201,168,76,0.3)]"
          >
            Apply Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-text-tertiary">
          <span>Founders Club — MIT × Harvard</span>
          <div className="flex gap-6">
            <a href="/skill.md" className="hover:text-text-secondary transition-colors">skill.md</a>
            <a href="/heartbeat.md" className="hover:text-text-secondary transition-colors">heartbeat.md</a>
            <a href="/skill.json" className="hover:text-text-secondary transition-colors">skill.json</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="glass glass-hover rounded-xl p-6 transition-all">
      <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center mb-4 text-gold">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex gap-6">
      <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold shrink-0">
        {number}
      </div>
      <div>
        <h3 className="font-semibold text-lg mb-1">{title}</h3>
        <p className="text-text-secondary leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function MatchIcon() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
}
function DirectoryIcon() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
}
function MessageIcon() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
}
function CalendarIcon() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
}
function ShieldIcon() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
}
function BotIcon() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
}
