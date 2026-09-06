'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Note } from '@/lib/types';
import { aiBotClient, apiClient } from '@/lib/api';
import { MarkdownEditorViewer } from '@/components/notes/MarkdownEditorViewer';
import { FileText, Plus, ArrowLeft, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { DeleteConfirmationModal } from '@/components/ui/DeleteConfirmationModal';

interface NotesPanelProps {
    subjectId: string;
    subjectTitle: string;
}

export function NotesPanel({ subjectId, subjectTitle }: NotesPanelProps) {
    const { getToken, userId } = useAuth();
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [activeNote, setActiveNote] = useState<Note | null>(null); // null = creating a new note
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [pendingNoteDelete, setPendingNoteDelete] = useState<string | null>(null);

    useEffect(() => {
        if (!subjectId) return;

        async function loadNotes() {
            try {
                setLoading(true);
                const token = await getToken();
                const data = await apiClient<Note[]>(`/notes?subjectId=${subjectId}`, {}, token);
                setNotes(data);
            } catch (err: any) {
                toast.error(err?.message || 'Could not load notes.');
            } finally {
                setLoading(false);
            }
        }

        loadNotes();
    }, [subjectId]);

    const handleOpenNote = (note: Note) => {
        setActiveNote(note);
        setView('editor');
    };

    const handleAddNew = () => {
        setActiveNote(null);
        setView('editor');
    };

    const handleBackToList = () => {
        setView('list');
        setActiveNote(null);
    };

    const handleNoteSaved = async (content: string): Promise<void> => {
        try {
            const token = await getToken();
            const savedNote = await apiClient<Note>('/notes', {
                method: 'POST',
                body: JSON.stringify({
                    subjectId,
                    title: activeNote?.title || `${subjectTitle} Notes`,
                    content,
                }),
            }, token);

            setNotes((prev) => {
                const exists = prev.some((n) => n.id === savedNote.id);

                if (exists) {
                    return prev.map((n) =>
                        n.id === savedNote.id ? savedNote : n
                    );
                }

                return [savedNote, ...prev];
            });

            setActiveNote(savedNote);
            toast.success('Note saved');
            void aiBotClient('/postnotes', {
                text: content,
                user_id: userId || '',
                notes_id: savedNote.id,
                subject: subjectTitle,
                lecture_id: subjectId,
            }).catch(() => undefined);
        } catch (err: any) {
            toast.error(err?.message || 'Could not save note');
        }
    };

    const handleNoteDeleted = (noteId: string) => {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
        setView('list');
        setActiveNote(null);
    };

    const handleDeleteClick = (e: React.MouseEvent, noteId: string) => {
        e.stopPropagation(); // don't trigger handleOpenNote
        setPendingNoteDelete(noteId);
    };

    const performDelete = async (noteId: string) => {
        setDeletingId(noteId);
        toast.info('Deleting requested notes');
        try {
            const token = await getToken();
            await apiClient(`/notes/${noteId}`, { method: 'DELETE' }, token);
            setNotes((prev) => prev.filter((n) => n.id !== noteId));
            toast.success('Note deleted');
        } catch (err: any) {
            toast.error(err?.message || 'Could not delete note');
        } finally {
            setDeletingId(null);
        }
    };

    if (view === 'editor') {
        return (
            <div className="space-y-3">
                <button
                    onClick={handleBackToList}
                    className="flex items-center gap-1.5 text-xs font-semibold text-foreground/60 hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back to notes</span>
                </button>

                <MarkdownEditorViewer
                    noteTitle={activeNote ? activeNote.title : `${subjectTitle} Notes`}
                    initialContent={activeNote?.content || ''}

                    onSave={handleNoteSaved}

                />
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-surface-border bg-surface p-4 sm:p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-foreground font-sans">Notes</h2>
                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-1.5 rounded-xl border border-brand-500/30 bg-brand-500/10 px-3 py-1.5 text-xs font-semibold text-brand-500 transition-colors hover:bg-brand-500/15 hover:text-brand-600"
                >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Note</span>
                </button>
            </div>

            {loading ? (
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-14 rounded-xl border border-surface-border bg-surface-light animate-pulse" />
                    ))}
                </div>
            ) : notes.length === 0 ? (
                <div className="text-center py-8">
                    <FileText className="h-7 w-7 mx-auto text-foreground/30" />
                    <p className="mt-3 text-xs text-foreground/60">
                        No notes yet for this subject.
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {notes.map((note) => {
                        const isDeleting = deletingId === note.id;

                        return (
                            <div
                                key={note.id}
                                onClick={() => handleOpenNote(note)}
                                className="group w-full flex items-center justify-between gap-2 rounded-xl border border-surface-border bg-surface-light px-4 py-3 text-left transition-colors hover:border-brand-500/40 hover:bg-surface-lighter cursor-pointer"
                            >
                                <div className="flex flex-col items-start gap-1 min-w-0">
                                    <span className="text-sm font-semibold text-foreground truncate w-full">
                                        {note.title}
                                    </span>
                                    <span className="text-[11px] text-foreground/50">
                                        Updated {new Date(note.updatedAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <button
                                    onClick={(e) => handleDeleteClick(e, note.id)}
                                    disabled={isDeleting}
                                    title="Delete note"
                                    className={`flex items-center justify-center rounded-lg p-1.5 shrink-0 transition-colors text-foreground/40 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            <DeleteConfirmationModal
                isOpen={pendingNoteDelete !== null}
                itemLabel="note"
                onCancel={() => setPendingNoteDelete(null)}
                onConfirm={async () => {
                    if (!pendingNoteDelete) return;
                    const noteId = pendingNoteDelete;
                    setPendingNoteDelete(null);
                    await performDelete(noteId);
                }}
                isDeleting={deletingId !== null}
            />
        </div>
    );
}
