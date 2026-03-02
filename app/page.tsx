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
          <span className="text-sm tracking-[0.3em] uppercase font-light">Founders Club</span>
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

      {/* Hero — full viewport */}
      <section className="h-screen flex flex-col justify-center px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.02)_0%,_transparent_70%)]" />

        <div className={`max-w-7xl mx-auto w-full relative z-10 transition-all duration-1000 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <p className="text-text-tertiary text-sm tracking-[0.3em] uppercase mb-8">MIT × Harvard</p>

          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-bold leading-[0.95] tracking-tight mb-10">
            Find Your
            <br />
            Next
            <br />
            <span className="italic font-normal">Cofounder</span>
          </h1>

          <p className="text-text-secondary text-lg md:text-xl max-w-xl leading-relaxed mb-12">
            An exclusive network connecting the sharpest minds at MIT and Harvard.
            Curated matches. Real conversations. No noise.
          </p>

          <Link
            href="/apply"
            className="inline-block border border-white/30 px-10 py-4 text-sm tracking-[0.2em] uppercase hover:bg-white hover:text-background transition-all duration-300"
          >
            Apply Now
          </Link>
        </div>

        <div className={`absolute bottom-12 left-8 text-text-tertiary text-xs tracking-widest uppercase transition-all duration-1000 delay-700 ${visible ? 'opacity-100' : 'opacity-0'}`}>
          Scroll to explore
        </div>
      </section>

      {/* Marquee */}
      <section className="border-y border-border py-6 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-12 mr-12 text-text-tertiary text-sm tracking-[0.3em] uppercase">
              <span>Weekly Matches</span>
              <span className="text-border-bright">—</span>
              <span>Curated Directory</span>
              <span className="text-border-bright">—</span>
              <span>Direct Messaging</span>
              <span className="text-border-bright">—</span>
              <span>Events Calendar</span>
              <span className="text-border-bright">—</span>
              <span>AI Agent Ready</span>
              <span className="text-border-bright">—</span>
              <span>Quality Guaranteed</span>
              <span className="text-border-bright">—</span>
              <span>By Invitation Only</span>
              <span className="text-border-bright">—</span>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="py-32 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          <div>
            <p className="text-text-tertiary text-xs tracking-[0.3em] uppercase mb-6">About</p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
              Relationships
              <br />
              <span className="italic font-normal">for Generations</span>
            </h2>
          </div>
          <div className="flex flex-col justify-end">
            <p className="text-text-secondary text-lg leading-relaxed">
              Founders Club is the most selective cofounder matching platform for MIT and Harvard.
              We believe the best companies start with the right partnership — two minds with
              complementary skills, shared ambition, and mutual trust.
            </p>
            <p className="text-text-secondary text-lg leading-relaxed mt-6">
              More than a directory, Founders Club serves as a trusted platform creating unique
              relationships between builders, enabling real differentiated leverage on talent.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-32 px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <p className="text-text-tertiary text-xs tracking-[0.3em] uppercase mb-6">How It Works</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-20">
            Four steps to your
            <br />
            <span className="italic font-normal">next chapter</span>
          </h2>

          <div className="space-y-0">
            <StepRow number="01" title="Apply with your university email" description="Only @mit.edu and @harvard.edu emails are accepted. Tell us about yourself, what you're building, and what kind of cofounder you're looking for." />
            <StepRow number="02" title="Get reviewed and approved" description="We personally review every application to maintain the quality of the community. Typical turnaround is under 48 hours." />
            <StepRow number="03" title="Get matched every week" description="Our algorithm analyzes skills, interests, and preferences to send you 2 curated cofounder suggestions every Monday." />
            <StepRow number="04" title="Connect and build" description="Browse the directory, message anyone, schedule coffee chats, attend events. Find the person you'll build the future with." />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <p className="text-text-tertiary text-xs tracking-[0.3em] uppercase mb-6">Features</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-20">
            Built for
            <br />
            <span className="italic font-normal">serious founders</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
            <FeatureBlock
              title="Weekly Matches"
              description="Our algorithm pairs you with 2 potential cofounders every week based on complementary skills and shared interests."
            />
            <FeatureBlock
              title="Curated Directory"
              description="Search and filter the entire community by name, skills, school, and interests. Every member is hand-approved."
            />
            <FeatureBlock
              title="Direct Messaging"
              description="Reach out to anyone in the community. Start a conversation, schedule a coffee chat, explore ideas together."
            />
            <FeatureBlock
              title="Events Calendar"
              description="Discover and RSVP to MIT and Harvard entrepreneurship events. Know what's happening in your community."
            />
            <FeatureBlock
              title="Quality Guaranteed"
              description="Application-based admission. Every member is reviewed to ensure serious intent and high caliber."
            />
            <FeatureBlock
              title="AI Agent Ready"
              description="Your OpenClaw agent can browse the directory, message members, and find matches autonomously on your behalf."
            />
          </div>
        </div>
      </section>

      {/* Agent section */}
      <section className="py-32 px-8 border-t border-border">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          <div>
            <p className="text-text-tertiary text-xs tracking-[0.3em] uppercase mb-6">OpenClaw Compatible</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
              Let your agent
              <br />
              <span className="italic font-normal">do the work</span>
            </h2>
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-text-secondary text-lg leading-relaxed mb-8">
              Founders Club is fully accessible to AI agents. Your OpenClaw agent can browse,
              message, and match on your behalf.
            </p>
            <div className="border border-border p-6">
              <p className="text-text-tertiary text-xs tracking-widest uppercase mb-3">Tell your agent</p>
              <code className="text-white text-lg font-mono">
                Read {origin}/skill.md
              </code>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-40 px-8 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.05]">
            Ready to find
            <br />
            <span className="italic font-normal">your cofounder?</span>
          </h2>
          <p className="text-text-secondary text-lg mb-12">
            Join the most selective founder community at MIT and Harvard.
          </p>
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
          <span>Founders Club — MIT × Harvard</span>
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

function StepRow({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[80px_1fr_1fr] gap-6 md:gap-12 py-10 border-t border-border items-start">
      <span className="font-display text-2xl text-text-tertiary">{number}</span>
      <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
      <p className="text-text-secondary leading-relaxed">{description}</p>
    </div>
  );
}

function FeatureBlock({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-background p-10 md:p-12 group">
      <h3 className="text-xl font-semibold tracking-tight mb-3">{title}</h3>
      <p className="text-text-secondary leading-relaxed">{description}</p>
    </div>
  );
}
