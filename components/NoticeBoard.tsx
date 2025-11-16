"use client";

import { useCallback, useEffect, useState } from 'react';

interface Notice {
  id: string;
  message: string;
  postedBy: string;
  seenAt: string | null;
  editedAt: string | null;
  canEditUntil: string | null;
  createdAt: string;
}

interface NoticeBoardProps {
  spaceId: string;
  userId: string;
}

export function NoticeBoard({ spaceId, userId }: NoticeBoardProps) {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [cooldownEnds, setCooldownEnds] = useState<Date | null>(null);

  const loadNotice = useCallback(async () => {
    try {
      const response = await fetch(`/api/spaces/${spaceId}/notice`);
      const data = await response.json();

      if (data.notice) {
        setNotice(data.notice);
      } else {
        setNotice(null);
      }

      if (data.cooldownEnds) {
        setCooldownEnds(new Date(data.cooldownEnds));
      } else {
        setCooldownEnds(null);
      }
    } catch (err) {
      console.error('Failed to load notice:', err);
    } finally {
      setLoading(false);
    }
  }, [spaceId]);

  useEffect(() => {
    loadNotice();
    const interval = setInterval(loadNotice, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [loadNotice]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setPosting(true);
    setError('');

    try {
      const response = await fetch(`/api/spaces/${spaceId}/notice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to post notice');
      }

      setMessage('');
      await loadNotice();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPosting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setPosting(true);
    setError('');

    try {
      const response = await fetch(`/api/spaces/${spaceId}/notice`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to edit notice');
      }

      setMessage('');
      setEditing(false);
      await loadNotice();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPosting(false);
    }
  };

  const markAsSeen = async () => {
    if (!notice || notice.postedBy === userId) return;

    try {
      await fetch(`/api/spaces/${spaceId}/notice/seen`, {
        method: 'POST',
      });
      await loadNotice();
    } catch (err) {
      console.error('Failed to mark as seen:', err);
    }
  };

  const startEditing = () => {
    if (notice) {
      setMessage(notice.message);
      setEditing(true);
    }
  };

  const cancelEditing = () => {
    setMessage('');
    setEditing(false);
  };

  const canPost = !notice || (notice.postedBy !== userId && notice.seenAt);
  const canEdit =
    notice &&
    notice.postedBy === userId &&
    notice.canEditUntil &&
    new Date(notice.canEditUntil) > new Date() &&
    !notice.editedAt;

  const getCooldownMessage = () => {
    if (!cooldownEnds) return null;

    const now = new Date();
    if (cooldownEnds <= now) return null;

    const diff = cooldownEnds.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `Cooldown: ${hours}h ${minutes}m remaining`;
  };

  if (loading) {
    return (
      <div className="card-retro">
        <p className="text-retro-medium">Loading notice board...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Notice */}
      <div className="card-retro">
        <h2 className="text-2xl font-semibold mb-4">Notice Board</h2>

        {notice ? (
          <div className="space-y-4">
            <div className="bg-md-surface-container-high p-4 rounded border border-md-outline-variant">
              <p className="text-lg whitespace-pre-wrap mb-2">{notice.message}</p>
              <div className="flex justify-between items-center text-sm opacity-70">
                <span>Posted by: {notice.postedBy === userId ? 'You' : 'Partner'}</span>
                {notice.editedAt && (
                  <span className="badge-retro bg-md-secondary-container text-md-on-secondary-container">Edited</span>
                )}
              </div>
            </div>

            {notice.postedBy !== userId && !notice.seenAt && (
              <button onClick={markAsSeen} className="btn-success">
                Mark as Seen
              </button>
            )}

            {notice.postedBy !== userId && notice.seenAt && (
              <p className="text-sm opacity-70">Seen</p>
            )}

            {canEdit && !editing && (
              <button onClick={startEditing} className="btn-secondary">
                Edit (one-time only)
              </button>
            )}

            {notice.editedAt && (
              <p className="text-sm opacity-70">
                Note: This message has already been edited once.
              </p>
            )}
          </div>
        ) : (
          <p className="opacity-70">No notice posted yet.</p>
        )}
      </div>

      {/* Post/Edit Form */}
      {(canPost || editing) && (
        <div className="card-retro">
          <h3 className="text-xl font-semibold mb-3">
            {editing ? 'Edit Notice' : 'Post New Notice'}
          </h3>

          <form onSubmit={editing ? handleEdit : handlePost} className="space-y-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your notice..."
              className="input-retro min-h-[120px] resize-none"
              maxLength={500}
              disabled={posting}
            />

            <div className="flex justify-between items-center">
              <span className="text-sm opacity-70">{message.length}/500</span>
            </div>

            {error && (
              <div className="bg-md-error-container text-md-on-error-container border border-md-outline-variant rounded p-3">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {getCooldownMessage() && (
              <div className="bg-md-secondary-container text-md-on-secondary-container border border-md-outline-variant rounded p-3">
                <p className="text-sm">⏳ {getCooldownMessage()}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={posting || !message.trim()}
                className="btn-retro disabled:opacity-50"
              >
                {posting ? 'Posting...' : editing ? 'Save Edit' : 'Post Notice'}
              </button>

              {editing && (
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="btn-secondary"
                  disabled={posting}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {!canPost && !editing && notice && (
        <div className="card-retro border-l-4 border-md-error">
          <p>
            You can post a new notice once your partner has seen your current message.
          </p>
        </div>
      )}
    </div>
  );
}
