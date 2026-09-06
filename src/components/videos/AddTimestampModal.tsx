'use client';

import React, { useState, useEffect } from 'react';
import { X, Bookmark, Plus, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@clerk/nextjs';
import { TimestampNote } from '@/lib/types';
import { apiClient } from '@/lib/api';

interface AddTimestampModalProps {
  videoId: string;
  currentSeconds: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newTimestamp: TimestampNote) => void;
}

export const AddTimestampModal: React.FC<AddTimestampModalProps> = ({
  videoId,
  currentSeconds,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { getToken } = useAuth();
  const [seconds, setSeconds] = useState(currentSeconds);
  const [noteText, setNoteText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSeconds(Math.floor(currentSeconds));
  }, [currentSeconds, isOpen]);

  if (!isOpen) return null;

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  const formattedLabel = `${mins.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!noteText.trim()) {
      toast.error('Note description is required for this timestamp');
      return;
    }

    setLoading(true);

    const toastId = toast.loading(
      `Saving timestamp at ${formattedLabel}...`
    );

    try {
      const token = await getToken();

      const createdTs = await apiClient<TimestampNote>('/timestamps', {
        method: 'POST',
        body: JSON.stringify({
          videoId,
          timeSeconds: seconds,
          timeLabel: formattedLabel,
          noteText: noteText.trim(),
        }),
      }, token);

      // Only reached if the backend actually saved the timestamp
      toast.success(`Timestamp saved at ${formattedLabel}!`, {
        id: toastId,
      });

      onSuccess(createdTs);
      setNoteText('');
      onClose();
    } catch (err: any) {
      toast.error(
        err?.message || 'Unable to save timestamp. Please try again.',
        { id: toastId }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md rounded-2xl border border-surface-border bg-surface p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-surface-border pb-4">
          <div className="flex items-center gap-2 text-brand-500">
            <Bookmark className="h-5 w-5 text-brand-500" />
            <h3 className="text-lg font-bold text-foreground">
              Save Video Timestamp
            </h3>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-foreground/60 transition-colors hover:bg-surface-light hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-brand-500/20 bg-brand-500/10 p-3">
            <div className="flex items-center gap-2 text-brand-500">
              <Clock className="h-4 w-4 text-brand-500" />
              <span className="text-xs font-semibold">
                Video Playback Mark
              </span>
            </div>

            <span className="font-mono text-base font-bold text-foreground">
              {formattedLabel}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/70">
              Timestamp Title / Key Concept{' '}
              <span className="text-rose-500">*</span>
            </label>

            <input
              type="text"
              required
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. Wave-Particle Duality explanation begins"
              className="mt-1.5 w-full rounded-xl border border-surface-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-surface-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-surface-border px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-surface-light hover:text-foreground"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2 text-sm font-semibold !text-white shadow-lg shadow-brand-600/30 transition-colors hover:bg-brand-500 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {loading ? 'Saving...' : 'Save Anchor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};