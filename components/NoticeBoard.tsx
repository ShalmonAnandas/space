"use client";

import { useCallback, useEffect, useState } from 'react';
import { CalendarClock, PencilLine, CheckCircle2, Eye, AlertCircle, Check, History } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

interface Notice {
  id: string;
  message: string;
  postedBy: string;
  postedByUsername?: string;
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
  const [historicalNotices, setHistoricalNotices] = useState<Notice[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
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

  const loadHistoricalNotices = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch(`/api/spaces/${spaceId}/notice?history=true`);
      const data = await response.json();

      if (data.notices) {
        setHistoricalNotices(data.notices);
        setShowHistory(true);
      }
    } catch (err) {
      console.error('Failed to load historical notices:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

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
      <div className="surface-panel animate-fade-in flex items-center gap-3">
        <Spinner size={20} />
        <p className="text-neutral-300">Loading today&apos;s vibes...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="surface-panel animate-fade-in space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <span className="badge-neutral">Today&apos;s Vibes</span>
            <h2 className="text-2xl font-semibold tracking-tight">Pinned updates</h2>
            <p className="text-sm text-neutral-400 max-w-xl">
              Keep one high-signal note active. Edit once if needed, and mark theirs as seen when you have read it.
            </p>
          </div>
          <CalendarClock size={24} className="text-accent-soft" />
        </div>

        {notice ? (
          <div className="space-y-4">
            <div className="surface-soft surface-glow p-5 space-y-3">
              <p className="text-lg leading-relaxed whitespace-pre-wrap text-neutral-100">
                {notice.message}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                <span className="badge-neutral">
                  Posted by {notice.postedBy === userId ? 'you' : 'partner'}
                </span>
                {notice.editedAt && (
                  <span className="badge-modern badge-neutral flex items-center gap-1">
                    <PencilLine size={14} />
                    Edited once
                  </span>
                )}
                {notice.seenAt && notice.postedBy !== userId && (
                  <span className="badge-positive flex items-center gap-1">
                    <CheckCircle2 size={14} />
                    Seen
                  </span>
                )}
              </div>
            </div>

            {notice.postedBy !== userId && !notice.seenAt && (
              <button onClick={markAsSeen} className="btn-success">
                <Check size={16} />
                <span>Mark as seen</span>
              </button>
            )}

            {canEdit && !editing && (
              <button onClick={startEditing} className="btn-secondary">
                <PencilLine size={16} />
                <span>Edit once</span>
              </button>
            )}

            {!canPost && !editing && notice.postedBy === userId && !notice.seenAt && (
              <p className="text-sm text-neutral-400 flex items-center gap-2">
                <Eye size={14} /> Waiting for them to mark it as seen before you can post again.
              </p>
            )}

            {notice.editedAt && (
              <div className="text-xs text-neutral-500 flex items-center gap-2">
                <AlertCircle size={14} />
                This message already consumed its one-time edit.
              </div>
            )}

            <button
              onClick={loadHistoricalNotices}
              disabled={loadingHistory}
              className="btn-tertiary"
            >
              {loadingHistory ? (
                <>
                  <Spinner size={16} />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <History size={16} />
                  <span>View previous 5 notices</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="surface-soft surface-glow p-6 text-sm text-neutral-400">
            Nothing posted yet. Drop a note below to start the conversation.
          </div>
        )}
      </section>

      {showHistory && historicalNotices.length > 0 && (
        <section className="surface-panel animate-fade-in space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <History size={18} className="text-accent-soft" />
              Previous notices
            </h3>
            <button
              onClick={() => setShowHistory(false)}
              className="text-xs text-neutral-400 hover:text-neutral-200"
            >
              Hide
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {historicalNotices.map((histNotice) => (
              <div
                key={histNotice.id}
                className="surface-soft p-4 border border-[rgba(118,132,168,0.12)] space-y-2"
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-neutral-200">
                  {histNotice.message}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                  <span>
                    {histNotice.postedBy === userId ? 'You' : histNotice.postedByUsername || 'Partner'}
                  </span>
                  <span>•</span>
                  <span>{new Date(histNotice.createdAt).toLocaleString()}</span>
                  {histNotice.editedAt && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <PencilLine size={12} />
                        Edited
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {(canPost || editing) && (
        <section className="surface-panel animate-fade-in space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">
                {editing ? 'Edit notice' : 'Post new notice'}
              </h3>
              <p className="text-xs text-neutral-500">Share a focused update. You get one notice at a time.</p>
            </div>
            {getCooldownMessage() && (
              <span className="badge-neutral flex items-center gap-1">
                <CalendarClock size={14} />
                {getCooldownMessage()}
              </span>
            )}
          </div>

          <form onSubmit={editing ? handleEdit : handlePost} className="space-y-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your notice..."
              className="input-modern min-h-[140px] resize-none"
              maxLength={500}
              disabled={posting}
            />

            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>{message.length}/500</span>
              {error && (
                <span className="text-danger flex items-center gap-1">
                  <AlertCircle size={12} />
                  {error}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={posting || !message.trim()}
                className="btn-primary"
              >
                {posting ? (
                  <>
                    <Spinner size={18} />
                    <span>Saving</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>{editing ? 'Save edit' : 'Post notice'}</span>
                  </>
                )}
              </button>

              {editing && (
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="btn-tertiary"
                  disabled={posting}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
