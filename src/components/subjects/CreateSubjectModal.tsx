'use client';

import React, { useState } from 'react';
import { X, Plus, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@clerk/nextjs';
import { Subject } from '@/lib/types';
import { apiClient } from '@/lib/api';

interface CreateSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newSubject: Subject) => void;
}

const COLOR_OPTIONS = [
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Violet', hex: '#8b5cf6' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Rose', hex: '#f43f5e' },
];

const CATEGORIES = [
  { label: 'General', value: 'GENERAL' },
  { label: 'Sciences', value: 'SCIENCES' },
  { label: 'Mathematics', value: 'MATHEMATICS' },
  { label: 'Engineering', value: 'ENGINEERING' },


];

export const CreateSubjectModal: React.FC<CreateSubjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { getToken } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [colorCode, setColorCode] = useState('#a855f7');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Subject title is required');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Creating your subject workspace...');

    try {
      const token = await getToken();

      const createdSubject = await apiClient<Subject>('/subjects', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          colorCode,
        }),
      }, token);

      // Only reached if the backend actually created the subject
      toast.success(`Subject "${title}" created successfully!`, {
        id: toastId,
      });

      onSuccess(createdSubject);
      setTitle('');
      setDescription('');
      setCategory('GENERAL');
      onClose();
    } catch (err: any) {
      // Real failure — no fake subject, no success toast, nothing added to state
      toast.error(
        err?.message || 'Unable to create subject. Please try again.',
        { id: toastId }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg rounded-2xl border border-surface-border bg-surface p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-surface-border pb-4">
          <div className="flex items-center gap-2 text-brand-500">
            <BookOpen className="h-5 w-5 text-brand-500" />
            <h3 className="text-lg font-bold text-foreground">
              Create New Subject
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
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/70">
              Subject Title <span className="text-rose-500">*</span>
            </label>

            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Quantum Physics, Organic Chemistry"
              className="mt-1.5 w-full rounded-xl border border-surface-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/70">
              Description
            </label>

            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of academic scope and objectives..."
              className="mt-1.5 w-full resize-none rounded-xl border border-surface-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/70">
              Category
            </label>

            <div className="mt-2 flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${category === cat.value
                    ? 'bg-brand-600 !text-white ring-1 ring-brand-400 shadow-md shadow-brand-600/30'
                    : 'border border-surface-border bg-surface-light text-foreground/60 hover:border-brand-500/30 hover:text-foreground'
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Accent Color */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/70">
              Accent Color
            </label>

            <div className="mt-2 flex gap-3">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColorCode(c.hex)}
                  className={`h-8 w-8 rounded-full border-2 transition-transform ${colorCode === c.hex
                    ? 'border-foreground scale-110 shadow-lg'
                    : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
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
              {loading ? 'Creating...' : 'Create Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};