'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Mic, MicOff, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@clerk/nextjs';
import { apiClient } from '@/lib/api';

interface SpeechRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscriptReceived: (transcript: string) => void;
}

export const SpeechRecorderModal: React.FC<SpeechRecorderModalProps> = ({
  isOpen,
  onClose,
  onTranscriptReceived,
}) => {
  const { getToken } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) {
      cleanup();
    }
  }, [isOpen]);

  const cleanup = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsRecording(false);
    setRecordingSeconds(0);
    setIsTranscribing(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm',
        });

        await handleTranscribe(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      toast.error(
        'Microphone access was denied or is not supported in this browser.'
      );
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      mediaRecorderRef.current.stop();

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setIsRecording(false);
    }
  };

  const handleTranscribe = async (audioBlob: Blob) => {
    setIsTranscribing(true);

    const toastId = toast.loading('Transcribing speech...');

    try {
      const token = await getToken();

      const formData = new FormData();
      formData.append('audio', audioBlob, 'lecture_voice_note.webm');

      const res = await apiClient<{ text: string }>('/speech/transcribe', {
        method: 'POST',
        body: formData,
      }, token);

      // Only reached if the backend actually transcribed the audio
      toast.success('Speech transcribed.', {
        id: toastId,
      });

      onTranscriptReceived(res.text);
      onClose();
    } catch (err: any) {
      toast.error(
        err?.message || 'Failed to transcribe audio. Please try again.',
        { id: toastId }
      );
    } finally {
      setIsTranscribing(false);
    }
  };

  if (!isOpen) return null;

  const mins = Math.floor(recordingSeconds / 60);
  const secs = recordingSeconds % 60;

  const timerLabel = `${mins.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md rounded-2xl border border-surface-border bg-surface p-6 text-center shadow-2xl">
        <div className="flex items-center justify-between border-b border-surface-border pb-4">
          <div className="flex items-center gap-2 text-brand-500">
            <Mic className="h-5 w-5 text-brand-500" />

            <h3 className="text-lg font-bold text-foreground">
              Speech-to-Notes
            </h3>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-foreground/60 transition-colors hover:bg-surface-light hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="my-8 flex flex-col items-center justify-center">
          {/* Animated pulsing mic button */}
          <div className="relative flex items-center justify-center">
            {isRecording && (
              <div className="absolute h-28 w-28 animate-ping rounded-full bg-rose-500/20" />
            )}

            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isTranscribing}
              className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-full shadow-2xl transition-colors ${isRecording
                ? 'bg-rose-600 !text-white'
                : 'bg-brand-600 !text-white hover:bg-brand-500'
                }`}
            >
              {isTranscribing ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : isRecording ? (
                <MicOff className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </button>
          </div>

          {/* Status Label */}
          <div className="mt-6 font-mono text-xl font-bold text-foreground">
            {isTranscribing ? (
              <span className="flex items-center gap-2 text-sm text-brand-500">
                <Sparkles className="h-4 w-4 animate-spin text-brand-500" />
                Transcribing speech...
              </span>
            ) : isRecording ? (
              <span className="text-rose-500 animate-pulse">
                {timerLabel} (Recording)
              </span>
            ) : (
              <span className="text-sm font-sans text-foreground/60">
                Click microphone to start voice recording
              </span>
            )}
          </div>

          <p className="mt-2 max-w-xs text-xs text-foreground/60">
            Speak your lecture summary or thought. The text will be added
            directly to your note.
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t border-surface-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-surface-border px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-surface-light hover:text-foreground"
          >
            Cancel
          </button>

          {isRecording && (
            <button
              type="button"
              onClick={stopRecording}
              className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold !text-white shadow-lg shadow-rose-600/30 transition-colors hover:bg-rose-500"
            >
              Stop & Transcribe
            </button>
          )}
        </div>
      </div>
    </div>
  );
};