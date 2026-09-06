'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import {
  Video,
  TimestampNote,
  Subject,
} from '@/lib/types';
import { apiClient } from '@/lib/api';
import {
  VideoPlayer,
  VideoPlayerRef,
} from '@/components/videos/VideoPlayer';
import { TimestampList } from '@/components/videos/TimestampList';
import { NotesPanel } from '@/components/notes/NotesPanel';
import { AddVideoModal } from '@/components/videos/AddVideoModal';
import { AddTimestampModal } from '@/components/videos/AddTimestampModal';
import { DeleteConfirmationModal } from '@/components/ui/DeleteConfirmationModal';
import {
  Plus,
  Video as VideoIcon,
  ArrowLeft,
  Clock,
  Tag,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SubjectWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const { getToken } = useAuth();
  const subjectId = params?.subjectId as string;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [timestamps, setTimestamps] = useState<TimestampNote[]>([]);
  const [activeTimestampId, setActiveTimestampId] = useState<string>('');
  const [isAddVideoOpen, setIsAddVideoOpen] = useState(false);
  const [isAddTimestampOpen, setIsAddTimestampOpen] = useState(false);
  const [currentPlayTime, setCurrentPlayTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<
    { type: 'video'; id: string } | { type: 'timestamp'; id: string } | null
  >(null);

  const playerRef = useRef<VideoPlayerRef>(null);

  useEffect(() => {
    if (!subjectId) return;

    async function loadSubjectData() {
      try {
        setLoading(true);

        const token = await getToken();

        const [fetchedSubject, fetchedVideos] = await Promise.all([
          apiClient<Subject>(`/subjects/${subjectId}`, {}, token),
          apiClient<Video[]>(`/videos?subjectId=${subjectId}`, {}, token),
        ]);

        setSubject(fetchedSubject);
        setVideos(fetchedVideos);

        if (fetchedVideos.length > 0) {
          const firstVid = fetchedVideos[0];
          setSelectedVideo(firstVid);

          const fetchedTimestamps = await apiClient<TimestampNote[]>(
            `/timestamps?videoId=${firstVid.id}`,
            {},
            token
          );
          setTimestamps(fetchedTimestamps);
        } else {
          setSelectedVideo(null);
          setTimestamps([]);
        }
      } catch (err: any) {
        toast.error(err?.message || 'Could not load this subject. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadSubjectData();
  }, [subjectId]);

  const handleSelectVideo = async (vid: Video) => {
    setSelectedVideo(vid);
    setActiveTimestampId('');

    try {
      const token = await getToken();
      const fetchedTimestamps = await apiClient<TimestampNote[]>(
        `/timestamps?videoId=${vid.id}`,
        {},
        token
      );
      setTimestamps(fetchedTimestamps);
    } catch (err: any) {
      setTimestamps([]);
      toast.error(err?.message || 'Could not load timestamps for this lecture.');
    }
  };

  const handleSeek = (seconds: number, tsId: string) => {
    setActiveTimestampId(tsId);
    setCurrentPlayTime(seconds);

    if (playerRef.current) {
      playerRef.current.seekTo(seconds);

      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);

      const label = `${mins.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`;

      toast.info(`Jumped to ${label}`);
    }
  };

  const handleOpenAddTimestamp = async () => {
    if (playerRef.current) {
      const time = await playerRef.current.getCurrentTime();
      setCurrentPlayTime(time || 0);
    }

    setIsAddTimestampOpen(true);
  };

  const handleVideoAdded = (newVid: Video) => {
    setVideos((prev) => [newVid, ...prev]);
    setSelectedVideo(newVid);
    setTimestamps([]);
  };

  const handleTimestampAdded = (newTs: TimestampNote) => {
    setTimestamps((prev) =>
      [...prev, newTs].sort((a, b) => a.timeSeconds - b.timeSeconds)
    );

    setActiveTimestampId(newTs.id);
  };

  const handleDeleteTimestamp = async (tsId: string) => {
    const prevTimestamps = timestamps;
    setTimestamps((prev) => prev.filter((t) => t.id !== tsId));

    try {
      const token = await getToken();
      await apiClient(`/timestamps/${tsId}`, { method: 'DELETE' }, token);
      toast.success('Timestamp removed');
    } catch (err: any) {
      setTimestamps(prevTimestamps);
      toast.error(err?.message || 'Could not remove timestamp. Please try again.');
    }
  };

  const handleDeleteVideo = async (vidId: string) => {
    setDeletingVideoId(vidId);
    toast.loading('Deleting requested lecture');

    try {
      const token = await getToken();
      await apiClient(`/videos/${vidId}`, { method: 'DELETE' }, token);

      const remaining = videos.filter((v) => v.id !== vidId);
      setVideos(remaining);

      if (selectedVideo?.id === vidId) {
        if (remaining.length > 0) {
          await handleSelectVideo(remaining[0]);
        } else {
          setSelectedVideo(null);
          setTimestamps([]);
          setActiveTimestampId('');
        }
      }

      toast.success('Lecture deleted');
    } catch (err: any) {
      toast.error(err?.message || 'Could not delete lecture. Please try again.');
    } finally {
      setDeletingVideoId(null);
    }
  };

  const confirmPendingDelete = async () => {
    if (!pendingDelete) return;

    const deleteRequest = pendingDelete;
    setPendingDelete(null);

    if (deleteRequest.type === 'video') {
      await handleDeleteVideo(deleteRequest.id);
    } else {
      await handleDeleteTimestamp(deleteRequest.id);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="h-10 w-64 rounded-lg border border-surface-border bg-surface-light animate-pulse mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 h-96 rounded-2xl border border-surface-border bg-surface-light animate-pulse" />
          <div className="lg:col-span-5 h-96 rounded-2xl border border-surface-border bg-surface-light animate-pulse" />
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="rounded-2xl border border-dashed border-surface-border bg-surface p-12 max-w-lg mx-auto">
          <h2 className="text-lg font-bold text-foreground mb-2">Subject Not Found</h2>
          <p className="text-xs text-foreground/60 mb-6">
            The subject you are looking for does not exist or you do not have permission to view it.
          </p>
          <button
            onClick={() => router.push('/dashboard/subjects')}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand-500 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Subjects</span>
          </button>
        </div>
      </div>
    );
  }

  const title = subject.title;
  const subtitle = selectedVideo?.title || 'No lecture selected';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/subjects')}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-surface-border bg-surface-light text-foreground/60 transition-colors hover:border-brand-500/40 hover:bg-surface-lighter hover:text-foreground"
            title="Back to subjects"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-500">
                Workspace
              </span>

              <span className="text-foreground/30">•</span>

              <span className="text-xs text-foreground/60">
                {videos.length} Lectures Available
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground font-sans">
              {title}
            </h1>
          </div>
        </div>

        {/* Video Selector & Add Lecture Button */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {videos.map((vid, idx) => {
            const isSelected = selectedVideo?.id === vid.id;

            return (
              <button
                key={vid.id}
                onClick={() => handleSelectVideo(vid)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${isSelected
                  ? 'bg-brand-600 !text-white shadow-md shadow-brand-600/30'
                  : 'border border-surface-border bg-surface-light text-foreground/60 hover:border-brand-500/30 hover:bg-surface-lighter hover:text-foreground'
                  }`}
              >
                <VideoIcon className="h-3.5 w-3.5" />
                <span>Lecture {idx + 1}</span>
              </button>
            );
          })}

          <button
            onClick={() => setIsAddVideoOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-brand-500/30 bg-brand-500/10 px-3.5 py-1.5 text-xs font-semibold text-brand-500 transition-colors hover:bg-brand-500/15 hover:text-brand-600"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Lecture</span>
          </button>
        </div>
      </div>

      {/* Dual-Pane Learning Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Pane */}
        <div className="lg:col-span-7 space-y-6">
          {videos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-surface-border bg-surface p-10 text-center">
              <VideoIcon className="h-8 w-8 mx-auto text-foreground/30" />
              <p className="mt-3 text-sm text-foreground/60">
                No lectures added yet for this subject.
              </p>
              <button
                onClick={() => setIsAddVideoOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-500"
              >
                <Plus className="h-4 w-4" />
                <span>Add Lecture</span>
              </button>
            </div>
          ) : (
            <>
              {/* Video Player */}
              <div className="space-y-3">
                <VideoPlayer
                  ref={playerRef}
                  video={selectedVideo || undefined}
                />

                {/* Video Title & Meta details */}
                <div className="rounded-2xl border border-surface-border bg-surface p-4">
                  <h2 className="text-lg font-bold text-foreground font-sans">
                    {subtitle}
                  </h2>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-foreground/60">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-brand-400" />
                        Recorded Lecture
                      </span>

                      <span className="text-foreground/30">•</span>

                      <span className="flex items-center gap-1">
                        <Tag className="h-3.5 w-3.5 text-purple-500" />
                        {timestamps.length} Anchored Timestamps
                      </span>
                    </div>

                    {selectedVideo && (
                      <button
                        onClick={() => setPendingDelete({ type: 'video', id: selectedVideo.id })}
                        disabled={deletingVideoId === selectedVideo.id}
                        title="Delete lecture"
                        className={`flex items-center justify-center rounded-lg p-1.5 transition-colors text-foreground/40 hover:bg-red-500/10 hover:text-red-400 ${deletingVideoId === selectedVideo.id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Video Timestamps */}
              <TimestampList
                timestamps={timestamps}
                activeTimestampId={activeTimestampId}
                onSeek={handleSeek}
                onAddTimestamp={handleOpenAddTimestamp}
                onDeleteTimestamp={(id) => setPendingDelete({ type: 'timestamp', id })}
              />
            </>
          )}
        </div>

        {/* Right Pane — Notes list <-> editor */}
        <div className="lg:col-span-5 space-y-6">
          <NotesPanel subjectId={subjectId} subjectTitle={title} />
        </div>
      </div>

      {/* Add Video Modal */}
      <AddVideoModal
        subjectId={subjectId}
        subjectTitle={title}
        isOpen={isAddVideoOpen}
        onClose={() => setIsAddVideoOpen(false)}
        onSuccess={handleVideoAdded}
      />

      {/* Add Timestamp Modal */}
      {selectedVideo && (
        <AddTimestampModal
          videoId={selectedVideo.id}
          currentSeconds={currentPlayTime}
          isOpen={isAddTimestampOpen}
          onClose={() => setIsAddTimestampOpen(false)}
          onSuccess={handleTimestampAdded}
        />
      )}

      <DeleteConfirmationModal
        isOpen={pendingDelete !== null}
        itemLabel={pendingDelete?.type === 'video' ? 'lecture' : 'timestamp'}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmPendingDelete}
        isDeleting={pendingDelete?.type === 'video' && deletingVideoId !== null}
      />
    </div>
  );
}
