"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser, useAuth } from '@clerk/nextjs';
import {
    Bot,
    ArrowRight,
    Plus,
    Sparkles,
    BookOpen,
    CheckCircle2,
    Flame,
    Compass,
} from 'lucide-react';
import { toast } from 'sonner';
import { Subject, Todo } from '@/lib/types';
import { apiClient } from '@/lib/api';
import { CreateSubjectModal } from '@/components/subjects/CreateSubjectModal';
import { SubjectCard } from '@/components/subjects/SubjectCard';
import { TodoCardList } from '@/components/todos/TodoCardList';
import { DeleteConfirmationModal } from '@/components/ui/DeleteConfirmationModal';

export default function DashboardClient() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<
        { type: 'subject'; subject: Subject } | { type: 'todo'; id: string; title: string } | null
    >(null);

    const userName = user?.firstName || 'there';

    // Load real data from backend — no mock fallback
    useEffect(() => {
        async function loadDashboardData() {
            try {
                setLoading(true);

                const token = await getToken();

                const [fetchedSubjects, fetchedTodos] = await Promise.allSettled([
                    apiClient<Subject[]>('/subjects', {}, token),
                    apiClient<Todo[]>('/todos', {}, token),
                ]);

                if (fetchedSubjects.status === 'fulfilled') {
                    setSubjects(fetchedSubjects.value);
                } else {
                    console.error('Failed to load subjects:', fetchedSubjects.reason);
                }

                if (fetchedTodos.status === 'fulfilled') {
                    setTodos(fetchedTodos.value);
                } else {
                    console.error('Failed to load todos:', fetchedTodos.reason);
                }

                if (
                    fetchedSubjects.status === 'rejected' &&
                    fetchedTodos.status === 'rejected'
                ) {
                    toast.error('Could not load your dashboard. Please try again.');
                }
            } catch (err: any) {
                toast.error('Could not load your dashboard. Please try again.');
            } finally {
                setLoading(false);
            }
        }

        loadDashboardData();
    }, []);

    const handleToggleTodo = async (id: string, isCompleted: boolean) => {
        const prevTodos = todos;
        setTodos((prev) =>
            prev.map((t) => (t.id === id ? { ...t, isCompleted } : t))
        );

        try {
            const token = await getToken();
            await apiClient(`/todos/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ isCompleted }),
            }, token);
            toast.success(
                isCompleted ? 'Task marked as completed!' : 'Task reopened'
            );
        } catch (err: any) {
            setTodos(prevTodos); // revert on failure
            toast.error(err?.message || 'Could not update task. Please try again.');
        }
    };

    const handleAddTodo = async (title: string, dueDate?: string) => {
        try {
            const token = await getToken();
            const created = await apiClient<Todo>('/todos', {
                method: 'POST',
                body: JSON.stringify({ title, dueDate }),
            }, token);
            setTodos((prev) => [created, ...prev]);
            toast.success('New task added!');
        } catch (err: any) {
            toast.error(err?.message || 'Could not add task. Please try again.');
        }
    };

    const handleSubjectCreated = (newSub: Subject) => {
        setSubjects((prev) => [newSub, ...prev]);
    };

    const handleDeleteSubject = async (sub: Subject) => {
        const toastId = toast.loading(`Deleting ${sub.title}...`);
        const prevSubjects = subjects;

        setSubjects((prev) => prev.filter((s) => s.id !== sub.id));

        try {
            const token = await getToken();
            await apiClient(`/subjects/${sub.id}`, { method: 'DELETE' }, token);
            toast.success(`Subject "${sub.title}" deleted`, { id: toastId });
        } catch (err: any) {
            setSubjects(prevSubjects); // revert on failure
            toast.error(err?.message || 'Unable to delete subject', { id: toastId });
        }
    };

    const handleDeleteTodo = async (id: string) => {
        const previousTodos = todos;
        setTodos((prev) => prev.filter((todo) => todo.id !== id));

        try {
            const token = await getToken();
            await apiClient(`/todos/${id}`, { method: 'DELETE' }, token);
            toast.success('Task deleted');
        } catch (err: any) {
            setTodos(previousTodos);
            toast.error(err?.message || 'Could not delete task');
        }
    };

    const confirmPendingDelete = async () => {
        if (!pendingDelete) return;

        const deleteRequest = pendingDelete;
        setPendingDelete(null);

        if (deleteRequest.type === 'subject') {
            await handleDeleteSubject(deleteRequest.subject);
        } else {
            await handleDeleteTodo(deleteRequest.id);
        }
    };

    const pendingCount = todos.filter((t) => !t.isCompleted).length;
    const completedCount = todos.filter((t) => t.isCompleted).length;

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
            {/* Top Welcome Header & Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-surface-border pb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground font-sans">
                        Welcome back, <span className="text-brand-400">{userName}</span>
                    </h1>

                    <p className="mt-1 text-sm sm:text-base text-foreground/60 font-normal">
                        You have{' '}
                        <span className="text-foreground font-semibold">
                            {pendingCount} pending tasks
                        </span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-brand-600/30  hover:from-brand-500 hover:to-purple-500 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Plus className="h-4 w-4" />
                        <span>New Subject</span>
                    </button>

                    <Link
                        href="/dashboard/subjects"
                        className="flex items-center gap-1.5 rounded-xl border border-surface-border bg-surface-light px-4 py-2.5 text-xs sm:text-sm font-semibold text-foreground/70 hover:border-brand-500/40 hover:bg-surface hover:text-brand-500 transition-colors"
                    >
                        <Compass className="h-4 w-4 text-brand-400" />
                        <span>Explore All</span>
                    </Link>
                </div>
            </div>

            {/* 3-Card Overview Metric Bar (Study Streak removed — not real data yet) */}
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
                {/* Metric 1 */}
                <div className="rounded-2xl border border-surface-border bg-surface p-4 sm:p-5 shadow-lg relative overflow-hidden group hover:border-brand-500/40 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-foreground/60">
                            Active Subjects
                        </span>

                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500/15 text-brand-400 border border-brand-500/30">
                            <BookOpen className="h-4 w-4" />
                        </div>
                    </div>

                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-extrabold text-foreground font-sans">
                            {loading ? '—' : subjects.length}
                        </span>

                        <span className="text-xs font-medium text-brand-500">
                            Active Subjects
                        </span>
                    </div>
                </div>

                {/* Metric 2 */}
                <div className="rounded-2xl border border-surface-border bg-surface p-4 sm:p-5 shadow-lg relative overflow-hidden group hover:border-brand-500/40 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-foreground/60">
                            Tasks Completed
                        </span>

                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500/15 text-brand-400 border border-brand-500/30">
                            <CheckCircle2 className="h-4 w-4" />
                        </div>
                    </div>

                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-extrabold text-foreground font-sans">
                            {loading ? '—' : completedCount}
                        </span>

                        <span className="text-xs font-medium text-foreground/60">
                            / {todos.length} total
                        </span>
                    </div>

                    <div className="mt-2 text-xs text-foreground/60">
                        {loading
                            ? 'Loading...'
                            : pendingCount === 0
                                ? 'All caught up!'
                                : `${pendingCount} remaining`}
                    </div>
                </div>

                
            </div>

            {/* Main Responsive Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left / Primary Column */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Current Subjects Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-foreground font-sans">
                                    Enrolled Subjects
                                </h2>

                                <p className="text-xs text-foreground/60">
                                    Select a subject to open your synchronized video & notes
                                    workspace
                                </p>
                            </div>

                            
                        </div>

                        {/* Grid of Subject Cards / Loading / Empty state */}
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="h-40 rounded-2xl border border-surface-border bg-surface-light animate-pulse"
                                    />
                                ))}
                            </div>
                        ) : subjects.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-surface-border bg-surface p-8 text-center">
                                <BookOpen className="h-8 w-8 mx-auto text-foreground/30" />
                                <p className="mt-3 text-sm text-foreground/60">
                                    No subjects yet — create your first one to get started.
                                </p>
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-500"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>New Subject</span>
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                {subjects.map((sub) => (
                                    <SubjectCard
                                        key={sub.id}
                                        subject={sub}
                                        onDelete={(subject) => setPendingDelete({ type: 'subject', subject })}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Pending Tasks Section */}
                    <TodoCardList
                        todos={todos}
                        onToggleTodo={handleToggleTodo}
                        onAddTodo={handleAddTodo}
                        onDeleteTodo={(id) => {
                            const todo = todos.find((item) => item.id === id);
                            if (todo) setPendingDelete({ type: 'todo', id, title: todo.title });
                        }}
                    />

                    {/* Anchor AI Tutor Copilot Card */}
                    <div className="relative overflow-hidden rounded-2xl border border-brand-500/30 bg-surface p-6 text-center shadow-xl">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-500/40 bg-brand-500/15 text-brand-400 shadow-lg shadow-brand-500/20">
                            <Bot className="h-7 w-7 text-brand-400" />
                        </div>

                        <div className="mt-3 flex items-center justify-center gap-1 text-[11px] font-bold uppercase tracking-wider text-brand-500">
                            <Sparkles className="h-3.5 w-3.5 " />
                            <span>Anchor AI</span>
                        </div>

                        <h3 className="mt-2 text-lg font-bold text-foreground font-sans">
                            Need lecture clarity?
                        </h3>

                        <p className="mt-1 text-xs text-foreground/70 leading-relaxed max-w-xs mx-auto">
                            Ask Anchor AI for instant formula breakdowns, timestamp-linked
                            explanations, or detailed explanations.
                        </p>

                        <div className="mt-4 flex flex-col gap-2">
                            <Link
                                href="/dashboard/subjects"
                                className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-brand-600/30  hover:bg-brand-500 hover:scale-[1.02]"
                            >
                                <span>Launch Chat</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <CreateSubjectModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleSubjectCreated}
            />

            <DeleteConfirmationModal
                isOpen={pendingDelete !== null}
                itemLabel={pendingDelete?.type === 'todo' ? `task "${pendingDelete.title}"` : 'subject'}
                onCancel={() => setPendingDelete(null)}
                onConfirm={confirmPendingDelete}
            />
        </div>
    );
}