'use client';

import React, { useState } from 'react';
import { X, Video as VideoIcon, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Video } from '@/lib/types';
import { aiBotClient, apiClient } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';

interface AddVideoModalProps {
  subjectId: string;
  subjectTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newVideo: Video) => void;
}

export const AddVideoModal: React.FC<AddVideoModalProps> = ({
  subjectId,
  subjectTitle,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { getToken, userId } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!youtubeUrl.trim()) {
      toast.error('YouTube video URL is required');
      return;
    }

    if (!title.trim()) {
      toast.error('Video lecture title is required');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Saving video lecture...');

    try {
      const token = await getToken();

      const createdVideo = await apiClient<Video>('/videos', {
        method: 'POST',
        body: JSON.stringify({
          subjectId,
          youtubeUrl: youtubeUrl.trim(),
          title: title.trim(),
          description: description.trim() || undefined,
        }),
      }, token);

      // Only reached if the backend actually saved the video
      toast.success(`Lecture "${title}" added successfully!`, {
        id: toastId,
      });
      void aiBotClient('/postvideo', {
        url: youtubeUrl.trim(),
        user_id: userId || '',
        subject: subjectTitle,
        lecture_id: subjectId,
      }).catch(() => undefined);

      onSuccess(createdVideo);
      setYoutubeUrl('');
      setTitle('');
      setDescription('');
      onClose();
    } catch (err: any) {
      toast.error(
        err?.message || 'Unable to save video link. Please try again.',
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

      <div className="relative w-full max-w-lg rounded-2xl border border-surface-border bg-surface p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-surface-border pb-4">
          <div className="flex items-center gap-2 text-brand-500">
            <VideoIcon className="h-5 w-5 text-brand-500" />

            <h3 className="text-lg font-bold text-foreground">
              Add YouTube Lecture
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
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/70">
              YouTube URL <span className="text-rose-500">*</span>
            </label>

            <input
              type="url"
              required
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="mt-1.5 w-full rounded-xl border border-surface-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/70">
              Lecture Title <span className="text-rose-500">*</span>
            </label>

            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lecture 4: Wave-Particle Duality"
              className="mt-1.5 w-full rounded-xl border border-surface-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/70">
              Notes / Subtitle
            </label>

            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Module 3: The Nature of Reality"
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
              {loading ? 'Saving...' : 'Save Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
