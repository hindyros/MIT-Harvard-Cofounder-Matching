'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface MessageItem {
  _id: string;
  content: string;
  senderId: { _id: string; name: string } | string;
  createdAt: string;
}

interface Participant {
  _id: string;
  name: string;
  school: string;
  profile?: { headline?: string };
}

export default function ConversationPage() {
  const { id } = useParams();
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [myId, setMyId] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/conversations/${id}`).then((r) => r.json()),
      fetch('/api/auth/me').then((r) => r.json()),
    ]).then(([convData, userData]) => {
      if (convData.success) {
        setMessages(convData.data.messages);
        setParticipants(convData.data.conversation.participants);
      }
      if (userData.success) setMyId(userData.data.id);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/conversations/${id}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.data.messages);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [id]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const content = newMessage.trim();
    setNewMessage('');

    setMessages((prev) => [
      ...prev,
      { _id: `temp-${Date.now()}`, content, senderId: myId, createdAt: new Date().toISOString() },
    ]);

    await fetch(`/api/conversations/${id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    setSending(false);
  }

  const other = participants.find((p) => p._id !== myId);

  if (loading) {
    return <div className="animate-pulse h-96 bg-surface-elevated rounded-xl" />;
  }

  return (
    <div className="animate-fade-in flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-4 pb-4 border-b border-border mb-4">
        <Link href="/messages" className="text-text-secondary hover:text-text-primary transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        {other && (
          <Link href={`/profile/${other._id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold text-sm font-semibold">
              {other.name.charAt(0)}
            </div>
            <div>
              <p className="font-medium">{other.name}</p>
              <p className="text-xs text-text-tertiary">{other.school}{other.profile?.headline ? ` · ${other.profile.headline}` : ''}</p>
            </div>
          </Link>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {messages.map((msg) => {
          const senderId = typeof msg.senderId === 'string' ? msg.senderId : msg.senderId._id;
          const isMe = senderId === myId;

          return (
            <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${isMe ? 'bg-gold text-background' : 'glass'}`}>
                <p className="text-sm">{msg.content}</p>
                <p className={`text-xs mt-1 ${isMe ? 'text-background/60' : 'text-text-tertiary'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-3 pt-4 border-t border-border">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-surface border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-gold/50 transition-colors"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="bg-gold text-background px-6 py-3 rounded-lg font-semibold hover:bg-gold-light transition-colors disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
