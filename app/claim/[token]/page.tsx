'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ClaimPage() {
  const { token } = useParams();
  const [status, setStatus] = useState<'loading' | 'ready' | 'claimed' | 'error'>('loading');
  const [agentName, setAgentName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/agents/claim/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          if (data.data.alreadyClaimed) {
            setStatus('claimed');
          } else {
            setStatus('ready');
          }
          setAgentName(data.data.name);
        } else {
          setError(data.error);
          setStatus('error');
        }
      })
      .catch(() => {
        setError('Failed to load claim information');
        setStatus('error');
      });
  }, [token]);

  async function handleClaim() {
    setStatus('loading');
    const res = await fetch(`/api/agents/claim/${token}`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      setStatus('claimed');
    } else {
      setError(data.error);
      setStatus('error');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-gold">Founders Club</h1>
          <p className="text-text-tertiary text-sm mt-1">Agent Claim</p>
        </div>

        <div className="glass rounded-2xl p-8 text-center">
          {status === 'loading' && (
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
          )}

          {status === 'ready' && (
            <>
              <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Claim your agent</h2>
              <p className="text-text-secondary text-sm mb-6">
                Agent <span className="text-gold font-medium">{agentName}</span> wants to connect to your account.
              </p>
              <button
                onClick={handleClaim}
                className="w-full bg-gold text-background font-semibold py-3 rounded-lg hover:bg-gold-light transition-colors"
              >
                Claim Agent
              </button>
            </>
          )}

          {status === 'claimed' && (
            <>
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Agent claimed!</h2>
              <p className="text-text-secondary text-sm mb-6">
                {agentName} is now linked to your account and can act on your behalf.
              </p>
              <Link href="/home" className="text-gold hover:text-gold-light text-sm transition-colors">
                Go to dashboard
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
              <p className="text-text-secondary text-sm">{error}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
