'use client';

import { useEffect, useState, useCallback } from 'react';
import { MessageCircleMore, Sparkles, ThumbsUp, Clock3 } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

interface GossipMessage {
  id: string;
  message: string;
  postedBy: string;
  reacted: boolean;
  createdAt: string;
}

interface GossipSectionProps {
  spaceId: string;
  userId: string;
}

export function GossipSection({ spaceId, userId }: GossipSectionProps) {
  const [messages, setMessages] = useState<GossipMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [lastMessage, setLastMessage] = useState<GossipMessage | null>(null);

  const loadMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/spaces/${spaceId}/gossip`);
      const data = await response.json();

      if (data.messages) {
        setMessages(data.messages);
        if (data.messages.length > 0) {
          setLastMessage(data.messages[data.messages.length - 1]);
        }
      }
    } catch (err) {
      console.error('Failed to load gossip:', err);
    } finally {
      setLoading(false);
    }
  }, [spaceId]);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [loadMessages]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setPosting(true);
    setError('');

    try {
      const response = await fetch(`/api/spaces/${spaceId}/gossip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to post gossip');
      }

      setMessage('');
      await loadMessages();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPosting(false);
    }
  };

  const handleReact = async (messageId: string) => {
    try {
      const response = await fetch(`/api/spaces/${spaceId}/gossip/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId }),
      });
      
      if (response.ok) {
        await loadMessages();
      }
    } catch (err) {
      console.error('Failed to react to gossip:', err);
    }
  };

  if (loading) {
    return (
      <div className="surface-panel animate-fade-in flex items-center gap-3">
        <Spinner size={20} />
        <p className="text-neutral-300">Loading gossip log...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="surface-panel animate-fade-in space-y-3">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-[rgba(124,143,255,0.18)] flex items-center justify-center">
            <Sparkles size={20} className="text-accent-strong" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-semibold">Gossip stream</h3>
            <p className="text-sm text-neutral-400">
              Share a fleeting thought. When your partner reacts, the entry fades away.
            </p>
          </div>
        </div>
      </section>

      <section className="surface-panel animate-fade-in space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircleMore size={18} className="text-accent-soft" />
            Write gossip
          </h4>
          <span className="text-xs text-neutral-500">{message.length}/300</span>
        </div>

        <form onSubmit={handlePost} className="space-y-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Spill the tea..."
            className="input-modern min-h-[120px] resize-none"
            maxLength={300}
            disabled={posting}
          />

          {error && (
            <div className="text-sm text-danger bg-[rgba(241,126,126,0.12)] border border-[rgba(241,126,126,0.28)] rounded-xl p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={posting || !message.trim()}
            className="btn-primary"
          >
            {posting ? (
              <>
                <Spinner size={18} />
                <span>Posting</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Post gossip</span>
              </>
            )}
          </button>
        </form>
      </section>

      <section className="surface-panel animate-fade-in space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold">Recent chatter</h4>
          <span className="badge-neutral">{messages.length} active</span>
        </div>

        {messages.length === 0 ? (
          <p className="text-sm text-neutral-400">
            No gossip yet. Be the first to share something cheeky.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((msg) => {
              const isOwnMessage = msg.postedBy === userId;
              const canReact = !isOwnMessage && !msg.reacted;

              return (
                <div
                  key={msg.id}
                  className={`surface-soft p-4 border ${
                    isOwnMessage
                      ? 'border-[rgba(124,143,255,0.22)]'
                      : 'border-[rgba(118,132,168,0.16)]'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm text-neutral-100 mb-3">{msg.message}</p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                    <span>{isOwnMessage ? 'You' : 'Partner'}</span>
                    <span className="flex items-center gap-1">
                      <Clock3 size={12} />
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                    {!isOwnMessage && msg.reacted && (
                      <span className="badge-positive flex items-center gap-1">
                        <ThumbsUp size={14} /> Reacted
                      </span>
                    )}
                  </div>

                  {canReact && (
                    <button
                      onClick={() => handleReact(msg.id)}
                      className="btn-success mt-3"
                    >
                      <ThumbsUp size={16} />
                      <span>React</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
