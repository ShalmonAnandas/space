'use client';

import { useEffect, useState } from 'react';

interface GossipMessage {
  id: string;
  message: string;
  postedBy: string;
  rereadAt: string | null;
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

  const handleReread = async (messageId: string) => {
    try {
      await fetch(`/api/spaces/${spaceId}/gossip/reread`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId }),
      });
      await loadMessages();
    } catch (err) {
      console.error('Failed to mark as reread:', err);
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
      <div className="card-retro bg-pastel-yellow/20 border-2 border-pastel-yellow">
        <p className="text-sm text-retro-dark">
          <strong>Gossip Zone:</strong> Messages disappear after being read. This is NOT
          real-time chat - refresh to see new messages. For urgent matters, use the Notice Board or
          Sutta button!
        </p>
      </div>

      {/* Post Form */}
      <div className="card-retro">
        <h3 className="text-xl font-bold text-retro-dark mb-3">Write Gossip</h3>

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
            <span className="text-sm text-retro-medium">{message.length}/300</span>
          </div>

          {error && (
            <div className="bg-red-100 border-2 border-red-300 rounded-retro p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={posting || !message.trim()}
            className="btn-retro bg-pastel-pink disabled:opacity-50"
          >
            {posting ? 'Posting...' : 'Post Gossip'}
          </button>
        </form>
      </div>

      {/* Messages List */}
      <div className="card-retro">
        <h3 className="text-xl font-bold text-retro-dark mb-3">Recent Gossip</h3>

        {messages.length === 0 ? (
          <p className="text-retro-medium">No gossip yet. Be the first to share!</p>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isOwnMessage = msg.postedBy === userId;
              const canReread = !isOwnMessage && !msg.rereadAt;

              return (
                <div
                  key={msg.id}
                  className={`p-4 rounded-retro border-2 ${
                    isOwnMessage
                      ? 'bg-pastel-purple/20 border-pastel-purple/30'
                      : 'bg-white/50 border-pastel-pink/30'
                  }`}
                >
                  <p className="text-retro-dark whitespace-pre-wrap mb-2">{msg.message}</p>

                  <div className="flex justify-between items-center text-xs text-retro-medium">
                    <span>{isOwnMessage ? 'You' : 'Partner'}</span>
                    <span>{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>

                  {canReread && (
                    <button
                      onClick={() => handleReread(msg.id)}
                      className="btn-retro bg-pastel-green text-xs mt-2"
                    >
                      Mark as Re-read
                    </button>
                  )}

                  {msg.rereadAt && !isOwnMessage && (
                    <p className="text-xs text-green-600 mt-2">Re-read</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Last Message Re-read */}
      {lastMessage && lastMessage.postedBy !== userId && !lastMessage.rereadAt && (
        <div className="card-retro bg-pastel-blue/20 border-2 border-pastel-blue">
          <p className="text-sm text-retro-dark mb-3">
            You can re-read the last message to let your partner know you saw it:
          </p>
          <div className="bg-white/50 p-3 rounded-retro border-2 border-pastel-blue/30 mb-3">
            <p className="text-retro-dark text-sm">{lastMessage.message}</p>
          </div>
          <button
            onClick={() => handleReread(lastMessage.id)}
            className="btn-retro bg-pastel-blue"
          >
            👀 Mark as Re-read
          </button>
        </div>
      )}
    </div>
  );
}
