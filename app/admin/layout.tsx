'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (!data.success || data.data.role !== 'admin') {
          router.push('/sign-in');
          return;
        }
        setLoading(false);
      })
      .catch(() => router.push('/sign-in'));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin">
              <h1 className="text-lg font-bold text-gold font-display">Founders Club Admin</h1>
            </Link>
            <nav className="flex gap-1">
              <Link
                href="/admin"
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  pathname === '/admin' ? 'bg-gold/10 text-gold' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Metrics
              </Link>
              <Link
                href="/admin/applications"
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  pathname === '/admin/applications' ? 'bg-gold/10 text-gold' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Applications
              </Link>
            </nav>
          </div>
          <Link href="/home" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            Back to app
          </Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-6">{children}</main>
    </div>
  );
}
