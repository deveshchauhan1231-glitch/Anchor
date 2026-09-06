'use client';

import React, { useState } from 'react';
import { Todo } from '@/lib/types';
import { Check, Plus, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface TodoCardListProps {
  todos: Todo[];
  onToggleTodo: (id: string, isCompleted: boolean) => void;
  onAddTodo: (title: string, dueDate?: string) => void;
  onDeleteTodo?: (id: string) => void;
}

export const TodoCardList: React.FC<TodoCardListProps> = ({
  todos,
  onToggleTodo,
  onAddTodo,
  onDeleteTodo,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState(''); // yyyy-mm-dd from <input type="date">
  const [isAdding, setIsAdding] = useState(false);

  const pendingTodos = todos.filter((t) => !t.isCompleted);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTitle.trim()) {
      toast.error('Task title is required');
      return;
    }

    onAddTodo(newTitle.trim(), newDueDate || undefined);
    setNewTitle('');
    setNewDueDate('');
    setIsAdding(false);
  };

  // Formats "2026-09-05" -> "Sep 5, 2026" for display on the task card
  const formatDueDate = (dueDate: string) => {
    const parsed = new Date(`${dueDate}T00:00:00`);
    if (isNaN(parsed.getTime())) return dueDate; // fallback for old free-text values
    return parsed.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="rounded-2xl border border-surface-border bg-surface p-5 shadow-lg">
      <div className="flex items-center justify-between pb-3">
        <h3 className="text-lg font-bold tracking-tight text-foreground">
          Pending Tasks
        </h3>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 rounded-lg border border-brand-500/30 bg-brand-500/10 px-2.5 py-1 text-xs font-semibold text-brand-500 hover:bg-brand-500/15 hover:text-brand-600 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Task</span>
        </button>
      </div>

      {/* Quick Add Form */}
      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="my-3 rounded-xl border border-surface-border bg-background p-3 space-y-3"
        >
          <input
            type="text"
            required
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="What do you need to study or complete?"
            className="w-full rounded-lg border border-surface-border bg-surface px-3 py-2 text-xs text-foreground placeholder:text-foreground/40 focus:border-brand-500 focus:outline-none"
          />

          <div className="flex items-center justify-between gap-2">
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="w-48 rounded-lg border border-surface-border bg-surface px-3 py-1.5 text-xs text-foreground placeholder:text-foreground/40 focus:border-brand-500 focus:outline-none dark:[color-scheme:dark] [color-scheme:light]"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="rounded-lg px-2.5 py-1 text-xs text-foreground/60 hover:text-foreground transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-lg bg-brand-600 px-3 py-1 text-xs font-semibold !text-white hover:bg-brand-500 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Task List */}
      <div className="mt-2 divide-y divide-surface-border">
        {pendingTodos.length === 0 ? (
          <div className="py-6 text-center text-xs text-foreground/50">
            All tasks completed! You are on track with your study schedule.
          </div>
        ) : (
          pendingTodos.map((todo) => {
            return (
              <div
                key={todo.id}
                className="group flex items-center justify-between py-3 px-1 transition-colors hover:bg-surface-light"
              >
                <div className="flex items-start gap-3.5">
                  {/* Checkbox */}
                  <button
                    type="button"
                    onClick={() =>
                      onToggleTodo(todo.id, !todo.isCompleted)
                    }
                    className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${todo.isCompleted
                      ? 'border-brand-500 bg-brand-600 !text-white'
                      : 'border-surface-border bg-surface-light text-foreground/60 hover:border-brand-400'
                      }`}
                  >
                    {todo.isCompleted && (
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    )}
                  </button>

                  {/* Task details */}
                  <div>
                    <h4
                      className={`text-sm font-medium leading-snug transition-colors ${todo.isCompleted
                        ? 'line-through text-foreground/40'
                        : 'text-foreground'
                        }`}
                    >
                      {todo.title}
                    </h4>

                    {todo.dueDate && (
                      <div className="mt-1 flex items-center gap-1 text-xs font-medium text-brand-500">
                        <Calendar className="h-3 w-3 text-brand-400" />
                        <span>{formatDueDate(todo.dueDate)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {onDeleteTodo && (
                  <button
                    onClick={() => onDeleteTodo(todo.id)}
                    className="opacity-0 group-hover:opacity-100 rounded p-1 text-foreground/40 hover:text-rose-400 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};