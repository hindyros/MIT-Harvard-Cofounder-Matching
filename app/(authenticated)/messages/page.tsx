'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Participant {
  _id: string;
  name: string;
  school: string;
  profile?: { headline?: string; avatarUrl?: string };
}

interface ConversationItem {
  id: string;
  participants: Participant[];
  lastMessage?: string;
  lastActivity: string;
  unreadCount: number;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState<string>('');

  useEffect(() => {
    Promise.all([
      fetch('/api/conversations').then((r) => r.json()),
      fetch('/api/auth/me').then((r) => r.json()),
    ]).then(([convData, userData]) => {
      if (convData.success) setConversations(convData.data.conversations);
      if (userData.success) setMyId(userData.data.id);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-surface-elevated rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 font-display">Messages</h1>
        <p className="text-text-secondary">Your conversations with other founders.</p>
      </div>

      {conversations.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <p className="text-text-secondary mb-4">No conversations yet.</p>
          <Link href="/directory" className="text-gold hover:text-gold-light text-sm transition-colors">
            Find someone to message in the directory
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const other = conv.participants.find((p) => p._id !== myId);
            if (!other) return null;

            return (
              <Link key={conv.id} href={`/messages/${conv.id}`}>
                <div className="glass glass-hover rounded-xl p-4 cursor-pointer transition-all flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold text-sm font-semibold shrink-0">
                    {other.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{other.name}</p>
                      <span className="text-xs text-text-tertiary">
                        {formatTime(conv.lastActivity)}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary truncate mt-0.5">
                      {conv.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="w-5 h-5 rounded-full bg-gold flex items-center justify-center shrink-0">
                      <span className="text-xs text-background font-bold">{conv.unreadCount}</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (days === 1) return 'Yesterday';
  if (days < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
