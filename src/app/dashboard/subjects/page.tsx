'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, BookOpen, Compass } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@clerk/nextjs';
import { Subject } from '@/lib/types';
import { apiClient } from '@/lib/api';
import { SubjectCard } from '@/components/subjects/SubjectCard';
import { CreateSubjectModal } from '@/components/subjects/CreateSubjectModal';
import { DeleteConfirmationModal } from '@/components/ui/DeleteConfirmationModal';

export default function ExploreSubjectsPage() {
  const { getToken } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'SCIENCES' | 'MATHEMATICS' | 'ENGINEERING'>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [pendingSubjectDelete, setPendingSubjectDelete] = useState<Subject | null>(null);

  const categories = ['ALL', 'SCIENCES', 'MATHEMATICS', 'ENGINEERING'] as const;

  useEffect(() => {
    async function fetchSubjects() {
      try {
        setLoading(true);
        const token = await getToken();
        const data = await apiClient<Subject[]>('/subjects', {}, token);
        setSubjects(data);
      } catch (err: any) {
        toast.error(err?.message || 'Could not load subjects. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchSubjects();
  }, []);

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

  // Filter subjects based on search query and category
  const filteredSubjects = subjects.filter((sub) => {
    const matchesSearch =
      sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.description && sub.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (activeCategory === 'ALL') return true;

    return sub.category === activeCategory;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-500 uppercase tracking-wider mb-1">
            <Compass className="h-4 w-4" />
            <span>Academic Curriculum</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground font-sans">
            Explore Subjects
          </h1>
          <p className="mt-1 text-sm sm:text-base text-foreground/60">
            Browse through curated lecture series, timestamped video catalogs, and notes.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-brand-600/30  hover:from-brand-500 hover:to-purple-500 hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" />
          <span>New Subject</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subjects by name, topic, or keyword..."
            className="w-full rounded-2xl border border-surface-border bg-surface py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-foreground/40 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 shadow-inner"
          />
        </div>

        {/* Filter Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-xl px-4 py-2 text-xs font-bold tracking-wider uppercase shrink-0 transition-colors ${isActive
                  ? 'bg-brand-600 !text-white shadow-md shadow-brand-600/30 ring-1 ring-brand-400'
                  : 'border border-surface-border bg-surface text-foreground/60 hover:border-brand-500/30 hover:text-foreground'
                  }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Responsive Full-Width Grid of Subject Cards */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-48 rounded-2xl border border-surface-border bg-surface-light animate-pulse"
              />
            ))}
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-surface-border bg-surface p-12 text-center text-sm text-foreground/60">
            <BookOpen className="h-10 w-10 text-foreground/30 mx-auto mb-3" />
            <h3 className="text-base font-bold text-foreground mb-1">
              {subjects.length === 0 ? 'No subjects yet' : 'No subjects found'}
            </h3>
            <p className="text-xs text-foreground/60 max-w-sm mx-auto">
              {subjects.length === 0
                ? 'Create your first subject to start building your lecture library.'
                : 'No academic paths matched your current search or category filter. Try clearing the search or create a new subject.'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredSubjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                onDelete={(selectedSubject) => setPendingSubjectDelete(selectedSubject)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Subject Modal */}
      <CreateSubjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleSubjectCreated}
      />

      <DeleteConfirmationModal
        isOpen={pendingSubjectDelete !== null}
        itemLabel="subject"
        onCancel={() => setPendingSubjectDelete(null)}
        onConfirm={async () => {
          if (!pendingSubjectDelete) return;
          const subjectToDelete = pendingSubjectDelete;
          setPendingSubjectDelete(null);
          await handleDeleteSubject(subjectToDelete);
        }}
      />
    </div>
  );
}