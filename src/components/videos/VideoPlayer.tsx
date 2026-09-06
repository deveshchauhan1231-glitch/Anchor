'use client';

import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { Video } from '@/lib/types';
import { Play } from 'lucide-react';

export interface VideoPlayerRef {
  seekTo: (seconds: number) => void;
  getCurrentTime: () => Promise<number>;
}

interface VideoPlayerProps {
  video?: Video;
  onTimeUpdate?: (currentTime: number) => void;
}

export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  ({ video }, ref) => {
    const playerRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      seekTo: (seconds: number) => {
        if (playerRef.current) {
          playerRef.current.seekTo(seconds, true);
          playerRef.current.playVideo();
        }
      },

      getCurrentTime: async () => {
        if (playerRef.current) {
          return playerRef.current.getCurrentTime();
        }

        return 0;
      },
    }));

    if (!video) {
      return (
        <div className="relative flex aspect-video w-full flex-col items-center justify-center rounded-2xl border border-surface-border bg-surface p-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/10 text-brand-500">
            <Play className="ml-1 h-8 w-8" />
          </div>

          <h4 className="mt-4 text-base font-semibold text-foreground">
            No Lecture Video Selected
          </h4>

          <p className="mt-1 text-xs text-foreground/60">
            Add a YouTube lecture URL to embed playback and take timestamped
            notes.
          </p>
        </div>
      );
    }

    const opts: YouTubeProps['opts'] = {
      height: '100%',
      width: '100%',
      playerVars: {
        autoplay: 0,
        modestbranding: 1,
        rel: 0,
      },
    };

    const onReady: YouTubeProps['onReady'] = (event) => {
      playerRef.current = event.target;
    };

    return (
      <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-black shadow-2xl">
        <div className="aspect-video w-full">
          <YouTube
            videoId={video.youtubeId}
            opts={opts}
            onReady={onReady}
            className="h-full w-full"
            iframeClassName="h-full w-full rounded-2xl"
          />
        </div>
      </div>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';