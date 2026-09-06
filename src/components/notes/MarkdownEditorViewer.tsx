'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Edit3,
  Bold,
  Italic,
  List,
  Code,
  Mic,
  Eye,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';
import { SpeechRecorderModal } from './SpeechRecorderModal';

interface MarkdownEditorViewerProps {
  initialContent?: string;
  noteTitle?: string;
  onSave?: (content: string) => Promise<void>;
}

export const MarkdownEditorViewer: React.FC<MarkdownEditorViewerProps> = ({
  initialContent = '',
  noteTitle = 'Notes',
  onSave,
}) => {
  const [content, setContent] = useState(initialContent);

  const [mode, setMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [isSpeechModalOpen, setIsSpeechModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const insertText = (before: string, after: string = '') => {
    const textarea = document.getElementById(
      'markdown-textarea'
    ) as HTMLTextAreaElement;

    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previousText = textarea.value;
    const selectedText = previousText.substring(start, end);

    const newText =
      previousText.substring(0, start) +
      before +
      (selectedText || 'text') +
      after +
      previousText.substring(end);

    setContent(newText);
    textarea.focus();
  };

  const handleSpeechTranscript = (transcript: string) => {
    setContent((prev) => (prev ? `${prev}\n\n${transcript}\n` : transcript));
  };

  const handleSaveNote = async () => {
    setSaving(true);
    const toastId = toast.loading('Saving markdown notes...');

    try {
      if (onSave) {
        await onSave(content);
      }

      toast.success('Notes saved in Markdown format!', { id: toastId });
    } catch (err: any) {
      toast.error(
        err.message || 'Unable to save notes. Please try again.',
        { id: toastId }
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-surface-border bg-surface p-5 shadow-lg">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border pb-3">
        <div className="flex items-center gap-2.5 text-brand-500">
          <Edit3 className="h-5 w-5 text-brand-500" />
          <h3 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
            {noteTitle}
          </h3>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => insertText('**', '**')}
            title="Bold"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-border bg-surface-light text-foreground/70 transition-colors hover:bg-surface-lighter hover:text-foreground"
          >
            <Bold className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => insertText('*', '*')}
            title="Italic"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-border bg-surface-light text-foreground/70 transition-colors hover:bg-surface-lighter hover:text-foreground"
          >
            <Italic className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => insertText('\n- ')}
            title="Bullet List"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-border bg-surface-light text-foreground/70 transition-colors hover:bg-surface-lighter hover:text-foreground"
          >
            <List className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => insertText('\n```\n', '\n```\n')}
            title="Code Block"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-border bg-surface-light text-foreground/70 transition-colors hover:bg-surface-lighter hover:text-foreground"
          >
            <Code className="h-4 w-4" />
          </button>

          {/* Speech to text */}
          <button
            type="button"
            onClick={() => setIsSpeechModalOpen(true)}
            title="Record speech to notes"
            className="flex items-center gap-1 rounded-lg border border-brand-500/30 bg-brand-500/10 px-2.5 py-1.5 text-xs font-semibold text-brand-500 transition-colors hover:bg-brand-500/15 hover:text-brand-600"
          >
            <Mic className="h-3.5 w-3.5 text-brand-500" />
            <span className="hidden sm:inline">Voice Note</span>
          </button>

          {/* Mode Switcher */}
          <div className="ml-1 flex rounded-lg border border-surface-border bg-background p-0.5">
            <button
              type="button"
              onClick={() => setMode('edit')}
              className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${mode === 'edit'
                ? 'bg-brand-600 !text-white'
                : 'text-foreground/60 hover:text-foreground'
                }`}
            >
              Write
            </button>

            <button
              type="button"
              onClick={() => setMode('preview')}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${mode === 'preview'
                ? 'bg-brand-600 !text-white'
                : 'text-foreground/60 hover:text-foreground'
                }`}
            >
              <Eye className="h-3 w-3" />
              Preview
            </button>
          </div>

          <button
            type="button"
            onClick={handleSaveNote}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold !text-white shadow-md shadow-brand-600/30 transition-colors hover:bg-brand-500 disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Editor & Preview Area */}
      <div className="mt-4 min-h-[300px]">
        {mode === 'edit' && (
          <textarea
            id="markdown-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start typing your markdown notes here..."
            className="h-[320px] w-full resize-y rounded-xl border border-surface-border bg-background p-4 font-mono text-sm text-foreground placeholder:text-foreground/40 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        )}

        {mode === 'preview' && (
          <div className="markdown-body max-h-[400px] overflow-y-auto rounded-xl border border-surface-border bg-background p-5">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Speech-to-Notes Modal */}
      <SpeechRecorderModal
        isOpen={isSpeechModalOpen}
        onClose={() => setIsSpeechModalOpen(false)}
        onTranscriptReceived={handleSpeechTranscript}
      />
    </div>
  );
};
