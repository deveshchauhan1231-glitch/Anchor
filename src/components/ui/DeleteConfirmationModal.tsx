'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  itemLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export function DeleteConfirmationModal({
  isOpen,
  itemLabel,
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDeleting) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-confirmation-title"
        className="w-full max-w-md rounded-2xl border border-surface-border bg-surface p-6 shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 id="delete-confirmation-title" className="text-lg font-bold text-foreground">
                Delete {itemLabel}?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                Are you sure you want to delete this {itemLabel.toLowerCase()}? This action cannot be undone.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            aria-label="Close delete confirmation"
            className="rounded-lg p-1 text-foreground/50 hover:bg-surface-light hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-xl border border-surface-border px-4 py-2 text-sm font-semibold text-foreground/70 hover:bg-surface-light hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            No, keep it
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Yes, delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
