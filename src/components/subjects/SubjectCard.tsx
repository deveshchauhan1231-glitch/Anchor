'use client';

import React from 'react';
import Link from 'next/link';
import { Subject } from '@/lib/types';
import {
  BookOpen,
  Video,
  CheckSquare,
  Trash2,
  Edit,
} from 'lucide-react';

interface SubjectCardProps {
  subject: Subject;
  tag?: string;
  onEdit?: (subject: Subject) => void;
  onDelete?: (subject: Subject) => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  tag,
  onEdit,
  onDelete,
}) => {
  // Use the stored category or fall back to GENERAL
  const categoryTag = tag || subject.category || 'GENERAL';

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-surface-border bg-surface p-5 transition-colors duration-300 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-950/20">
      {/* Background subtle ambient glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-brand-500/10 blur-2xl opacity-50 transition-opacity group-hover:opacity-100" />

      <div>
        {/* Top Tag & Actions */}
        <div className="flex items-center justify-between">
          <span className="rounded-md border border-surface-border bg-surface-light px-2.5 py-1 text-[11px] font-bold tracking-wider text-foreground/70 uppercase">
            {categoryTag}
          </span>

          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit(subject);
                }}
                title="Edit Subject"
                className="rounded-lg p-1 text-foreground/50 transition-colors hover:bg-surface-light hover:text-foreground"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}

            {onDelete && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(subject);
                }}
                title="Delete Subject"
                className="rounded-lg p-1 text-foreground/50 transition-colors hover:bg-rose-500/10 hover:text-rose-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <Link
          href={`/dashboard/subjects/${subject.id}`}
          className="block mt-4"
        >
          <h3 className="text-xl font-bold text-foreground transition-colors group-hover:text-brand-500">
            {subject.title}
          </h3>

          <p className="mt-2 line-clamp-2 text-sm text-foreground/60 leading-relaxed">
            {subject.description ||
              'Master the key concepts, lectures, and markdown notes.'}
          </p>
        </Link>
      </div>

      {/* Footer stats */}
      <div className="mt-6">
        <div className="mb-3 flex items-center gap-4 text-xs font-medium text-foreground/60">
          <span className="flex items-center gap-1.5">
            <Video className="h-3.5 w-3.5 text-brand-400" />
            {subject._count?.videos || subject.videos?.length || 0} Lectures
          </span>

          <span className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
            {subject._count?.notes || subject.notes?.length || 0} Notes
          </span>

          <span className="flex items-center gap-1.5">
            <CheckSquare className="h-3.5 w-3.5 text-emerald-400" />
            {subject._count?.todos || subject.todos?.length || 0} Tasks
          </span>
        </div>


      </div>
    </div>
  );
};