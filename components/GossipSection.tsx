'use client';

import { useEffect, useState } from 'react';

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

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [spaceId]);

  const loadMessages = async () => {
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
  };

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
      <div className="card-retro">
        <p className="text-retro-medium">Loading gossip...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card-retro border-l-4 border-md-tertiary">
        <p className="text-sm">
          <strong>Gossip Zone:</strong> Share messages with your partner. React to their gossip 
          to acknowledge you've seen it. Messages disappear after you react.
        </p>
      </div>

      {/* Post Form */}
      <div className="card-retro">
        <h3 className="text-xl font-semibold mb-3">Write Gossip</h3>

        <form onSubmit={handlePost} className="space-y-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share some gossip..."
            className="input-retro min-h-[100px] resize-none"
            maxLength={300}
            disabled={posting}
          />

          <div className="flex justify-between items-center">
            <span className="text-sm opacity-70">{message.length}/300</span>
          </div>

          {error && (
            <div className="bg-md-error-container text-md-on-error-container border border-md-outline-variant rounded p-3">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={posting || !message.trim()}
            className="btn-retro disabled:opacity-50"
          >
            {posting ? 'Posting...' : 'Post Gossip'}
          </button>
        </form>
      </div>

      {/* Messages List */}
      <div className="card-retro">
        <h3 className="text-xl font-semibold mb-3">Recent Gossip</h3>

        {messages.length === 0 ? (
          <p className="opacity-70">No gossip yet. Be the first to share!</p>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isOwnMessage = msg.postedBy === userId;
              const canReact = !isOwnMessage && !msg.reacted;

              return (
                <div
                  key={msg.id}
                  className={`p-3 rounded border ${
                    isOwnMessage
                      ? 'bg-md-primary-container text-md-on-primary-container border-md-outline-variant'
                      : 'bg-md-surface-container-high border-md-outline-variant'
                  }`}
                >
                  <p className="whitespace-pre-wrap mb-2">{msg.message}</p>

                  <div className="flex justify-between items-center text-xs opacity-70">
                    <span>{isOwnMessage ? 'You' : 'Partner'}</span>
                    <span>{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>

                  {canReact && (
                    <button
                      onClick={() => handleReact(msg.id)}
                      className="btn-success text-xs mt-2 py-1 px-3"
                    >
                      👍 React
                    </button>
                  )}

                  {!isOwnMessage && msg.reacted && (
                    <p className="text-xs text-md-tertiary mt-2">✓ Reacted</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
