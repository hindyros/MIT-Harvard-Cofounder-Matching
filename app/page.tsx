'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const [visible, setVisible] = useState(false);
  const [origin, setOrigin] = useState('');
  const [navSolid, setNavSolid] = useState(false);

  useEffect(() => {
    setVisible(true);
    setOrigin(window.location.origin);

    const handleScroll = () => setNavSolid(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navSolid ? 'bg-background/90 backdrop-blur-sm border-b border-border' : ''}`}>
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <span className="text-sm tracking-[0.3em] uppercase font-light">William x John</span>
          <div className="flex items-center gap-8">
            <Link href="/login" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
              Login
            </Link>
            <Link href="/apply" className="text-sm tracking-wider uppercase hover:text-text-secondary transition-colors">
              Apply
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="h-screen flex flex-col justify-center px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.02)_0%,_transparent_70%)]" />

        <div className={`max-w-7xl mx-auto w-full relative z-10 transition-all duration-1000 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <p className="text-text-tertiary text-sm tracking-[0.3em] uppercase mb-8">MIT × Harvard</p>

          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-bold leading-[1.1] tracking-tight mb-10">
            Find Your
            <br />
            <span className="italic font-normal">Cofounder</span>
          </h1>

          <p className="text-text-secondary text-lg md:text-xl max-w-md leading-relaxed mb-12">
            Curated matches. Real conversations. By invitation only.
          </p>

          <Link
            href="/apply"
            className="inline-block border border-white/30 px-10 py-4 text-sm tracking-[0.2em] uppercase hover:bg-white hover:text-background transition-all duration-300"
          >
            Apply Now
          </Link>
        </div>
      </section>

      {/* How it works — compact */}
      <section className="py-24 px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <Step number="01" title="Apply" description="Use your @mit.edu or @harvard.edu email" />
            <Step number="02" title="Get approved" description="We review every application personally" />
            <Step number="03" title="Get matched" description="2 curated cofounder matches every week" />
            <Step number="04" title="Connect" description="Message, meet, and build together" />
          </div>
        </div>
      </section>

      {/* What you get — single row of keywords */}
      <section className="border-y border-border py-6 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-12 mr-12 text-text-tertiary text-sm tracking-[0.3em] uppercase">
              <span>Weekly Matches</span>
              <span className="text-border-bright">·</span>
              <span>Curated Directory</span>
              <span className="text-border-bright">·</span>
              <span>Direct Messaging</span>
              <span className="text-border-bright">·</span>
              <span>Events</span>
              <span className="text-border-bright">·</span>
              <span>AI Agent Ready</span>
              <span className="text-border-bright">·</span>
              <span>By Invitation Only</span>
              <span className="text-border-bright">·</span>
            </div>
          ))}
        </div>
      </section>

      {/* Agent section — compact */}
      <section className="py-24 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-12 md:gap-24">
          <div className="flex-1">
            <p className="text-text-tertiary text-xs tracking-[0.3em] uppercase mb-4">OpenClaw Compatible</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight leading-[1.15]">
              Let your agent <span className="italic font-normal">do the work</span>
            </h2>
          </div>
          <div className="border border-border p-6 shrink-0">
            <p className="text-text-tertiary text-xs tracking-widest uppercase mb-3">Tell your agent</p>
            <code className="text-white text-lg font-mono">
              Read {origin}/skill.md
            </code>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-8 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.15]">
            Ready?
          </h2>
          <Link
            href="/apply"
            className="inline-block border border-white/30 px-12 py-4 text-sm tracking-[0.2em] uppercase hover:bg-white hover:text-background transition-all duration-300"
          >
            Apply Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-tertiary tracking-wider uppercase">
          <span>William x John — MIT × Harvard</span>
          <div className="flex gap-8">
            <a href="/skill.md" className="hover:text-text-secondary transition-colors">skill.md</a>
            <a href="/heartbeat.md" className="hover:text-text-secondary transition-colors">heartbeat.md</a>
            <a href="/skill.json" className="hover:text-text-secondary transition-colors">skill.json</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div>
      <span className="font-display text-sm text-text-tertiary">{number}</span>
      <h3 className="text-lg font-semibold tracking-tight mt-2 mb-1">{title}</h3>
      <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
    </div>
  );
}
