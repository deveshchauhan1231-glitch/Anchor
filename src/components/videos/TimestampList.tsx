'use client';

import React from 'react';
import { TimestampNote } from '@/lib/types';
import { ListOrdered, Plus, Play, Trash2 } from 'lucide-react';

interface TimestampListProps {
  timestamps: TimestampNote[];
  activeTimestampId?: string;
  onSeek: (seconds: number, id: string) => void;
  onAddTimestamp: () => void;
  onDeleteTimestamp?: (id: string) => void;
}

export const TimestampList: React.FC<TimestampListProps> = ({
  timestamps,
  activeTimestampId,
  onSeek,
  onAddTimestamp,
  onDeleteTimestamp,
}) => {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface p-5 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2.5 text-brand-500">
          <ListOrdered className="h-5 w-5 text-brand-500" />
          <h3 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
            Video Timestamps
          </h3>
        </div>

        <button
          onClick={onAddTimestamp}
          className="flex items-center gap-1.5 rounded-lg border border-brand-500/30 bg-brand-500/10 px-2.5 py-1 text-xs font-semibold text-brand-500 transition-colors hover:bg-brand-500/15 hover:text-brand-600"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Timestamp</span>
        </button>
      </div>

      {/* Timestamp List */}
      <div className="mt-2 space-y-2">
        {timestamps.length === 0 ? (
          <div className="py-6 text-center text-xs text-foreground/50">
            No timestamp anchors yet. Click "Add Timestamp" while watching to
            bookmark key moments!
          </div>
        ) : (
          timestamps.map((ts) => {
            const isActive = activeTimestampId === ts.id;

            return (
              <div
                key={ts.id}
                onClick={() => onSeek(ts.timeSeconds, ts.id)}
                className={`group flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 transition-colors ${isActive
                    ? 'border border-brand-500/40 bg-brand-500/10 shadow-md ring-1 ring-brand-500/20'
                    : 'border border-transparent bg-surface-light hover:border-surface-border hover:bg-surface-lighter'
                  }`}
              >
                <div className="flex items-center gap-3">
                  {/* Formatted Time Label */}
                  <div className="flex items-center gap-2">
                    {isActive && (
                      <div className="h-3.5 w-1 rounded-full bg-brand-500" />
                    )}

                    <span className="font-mono text-xs font-bold text-brand-500">
                      {ts.timeLabel}
                    </span>
                  </div>

                  {/* Note text / title */}
                  <span
                    className={`text-xs sm:text-sm font-medium ${isActive
                        ? 'text-foreground'
                        : 'text-foreground/70'
                      }`}
                  >
                    {ts.noteText}
                  </span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="flex items-center gap-1 pr-1 text-[10px] text-foreground/50">
                    <Play className="h-3 w-3 fill-brand-500 text-brand-500" />
                    Jump
                  </span>

                  {onDeleteTimestamp && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTimestamp(ts.id);
                      }}
                      className="rounded p-1 text-foreground/40 transition-colors hover:text-rose-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};