'use client';

import React from 'react';
import Link from 'next/link';
import {
  Menu,
  Bot,
  Sparkles,
  Flame,
  User as UserIcon,
} from 'lucide-react';
import { useUser, UserButton } from '@clerk/nextjs';
import { ThemeToggle } from './ThemeToggle';

interface AppHeaderProps {
  onToggleSidebar: () => void;
  onToggleAITutor: () => void;
  isAITutorOpen?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onToggleSidebar,
  onToggleAITutor,
  isAITutorOpen,
}) => {
  const { isSignedIn, user } = useUser();
  const userName = user?.firstName || 'Alex';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-surface-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      {/* Left: Menu toggle + Brand on mobile / Breadcrumbs on desktop */}
      <div className="flex items-center gap-3.5">


        {/* Mobile Brand */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 transition-opacity hover:opacity-90 lg:hidden"
        >
          <span className="text-xl font-bold tracking-tight text-foreground">
            Anchor
          </span>
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-surface-border bg-surface/50 text-foreground/70 transition-colors hover:border-brand-500/40 hover:bg-brand-500/10 hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>


        </Link>

        {/* Desktop Context */}
        <div className="hidden items-center gap-2 text-sm text-foreground/60 lg:flex">
          <span className="font-semibold text-foreground">
            Workspace
          </span>




        </div>
      </div>

      {/* Right: Quick Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Streak Pill */}
        {/* <div className="hidden items-center gap-1.5 rounded-xl border border-surface-border bg-surface-light px-3 py-1.5 text-xs font-semibold text-foreground/60 sm:flex">
          <Flame className="h-4 w-4 text-brand-400" />
          <span>5 Days Active</span>
        </div> */}

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* AI Tutor Toggle */}
        <button
          onClick={onToggleAITutor}
          title="Open Socratic AI Tutor"
          aria-label="Toggle AI Tutor"
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition-colors ${isAITutorOpen
            ? 'bg-brand-600 !text-white shadow-lg shadow-brand-500/25 ring-2 ring-brand-400'
            : 'border border-brand-500/30 bg-brand-500/10 text-brand-500 hover:border-brand-500/60 hover:bg-brand-500/20 hover:text-brand-600'
            }`}
        >
          <Bot className="h-4 w-4 text-brand-500 sm:h-5 sm:w-5" />

          <span className="font-medium">AI Tutor</span>

          <Sparkles className="hidden h-3.5 w-3.5 animate-pulse text-brand-500 sm:inline" />
        </button>

        {/* User Account */}
        <div className="flex items-center pl-1">
          {isSignedIn ? (
            <UserButton

              appearance={{
                elements: {
                  avatarBox: 'h-9 w-9 ring-2 ring-brand-500/50',
                },
              }}
            />
          ) : (
            <Link
              href="/sign-in"
              title="Sign In or Manage Account"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-500/30 bg-surface text-foreground/70 shadow-sm transition-colors hover:border-brand-500/60 hover:bg-surface-light hover:text-foreground"
            >
              <UserIcon className="h-4 w-4 text-brand-500" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};