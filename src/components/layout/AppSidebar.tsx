'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Anchor,
  LayoutGrid,
  BookOpen,
  Bookmark,
  CheckSquare,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Flame,
  User,
} from 'lucide-react';
import { useUser, UserButton } from '@clerk/nextjs';

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  onOpenAITutor: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onMobileClose,
  onOpenAITutor,
}) => {
  const pathname = usePathname();
  const { isSignedIn, user } = useUser();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutGrid },

    { label: 'My Library', href: '/dashboard/subjects', icon: Bookmark },
  ];

  const displayName = user?.fullName || user?.firstName || 'User';
  const displayImage = user?.imageUrl || undefined;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col justify-between border-r border-white/10 bg-[#0c0917]/95 backdrop-blur-xl transition-all duration-300 ease-in-out lg:static ${
          // Mobile state
          isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
          } ${
          // Desktop collapsed state
          isCollapsed ? 'lg:w-[76px]' : 'lg:w-64'
          }`}
      >
        {/* Top Section: Logo & Collapse Toggle */}
        <div>
          <div
            className={`flex h-16 items-center border-b border-white/10 px-4 ${isCollapsed ? 'justify-center' : 'justify-between'
              }`}
          >
            {/* Logo */}
            <Link
              href="/dashboard"
              onClick={onMobileClose}
              className="relative z-10 flex items-center gap-3 transition-opacity hover:opacity-90 overflow-hidden"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/25 ring-1 ring-brand-400/40">
                <Anchor className="h-5 w-5" />
              </div>

              {!isCollapsed && (
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-bold tracking-tight text-white font-sans">
                      Anchor
                    </span>

                  </div>
                  <span className="text-[10px] font-medium tracking-wide text-neutral-400">
                    Academic Workspace
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop Collapse Toggle Button */}
            {!isCollapsed && (
              <button
                onClick={onToggleCollapse}
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
                className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-white/5 text-neutral-400 hover:border-brand-500/30 hover:bg-brand-500/10 hover:text-white transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}

            {/* Mobile Close Button */}
            <button
              onClick={onMobileClose}
              aria-label="Close sidebar menu"
              className="flex lg:hidden h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-neutral-400 hover:bg-white/5 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* If collapsed on desktop, show expand trigger button below header */}
          {isCollapsed && (
            <div className="hidden lg:flex justify-center py-2 border-b border-white/5">
              <button
                onClick={onToggleCollapse}
                title="Expand sidebar"
                aria-label="Expand sidebar"
                className="h-8 w-8 flex items-center justify-center rounded-lg text-neutral-400 hover:bg-brand-500/10 hover:text-brand-300 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 ">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onMobileClose}
                  title={isCollapsed ? item.label : undefined}
                  className={`group relative flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all ${isActive
                    ? 'bg-brand-500/15 text-white shadow-sm shadow-brand-500/10 border border-brand-500/30'
                    : 'text-neutral-300 hover:bg-white/5 hover:text-white border border-transparent'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  {/* Left glowing active notch */}
                  {isActive && !isCollapsed && (
                    <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-400 shadow-[0_0_8px_#a855f7]" />
                  )}

                  <Icon
                    className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-110 group-hover:text-brand-500 ${isActive ? 'text-brand-400' : 'text-neutral-400 group-hover:text-brand-300'
                      }`}
                  />

                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}

            {/* AI Tutor Dedicated Nav Button */}
            <button
              onClick={() => {
                onOpenAITutor();
                onMobileClose();
              }}
              title={isCollapsed ? 'AI Tutor' : undefined}
              className={`group w-full flex items-center gap-3.5 rounded-xl px-3.5 py-3
  text-sm font-semibold
  border border-brand-500/20
  bg-surface
  text-600
  transition-colors
  hover:border-brand-500/40
  hover:bg-surface-light
  hover:text-500
  ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <Bot className="h-5 w-5 shrink-0 text-foreground/60 group-hover:text-brand-500 group-hover:scale-110 transition-all" />
              {!isCollapsed && (
                <div className="flex flex-1 items-center justify-between">
                  <span className="truncate">AI Tutor</span>
                  <Sparkles className="h-3.5 w-3.5 text-brand-400 animate-pulse" />
                </div>
              )}
            </button>
          </nav>

          {/* Quick Study Streak Card (in expanded mode)
          {!isCollapsed && (
            <div className="px-3 mt-4">
              <div className="rounded-2xl border border-surface-border bg-surface p-3.5 shadow-lg">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-brand-300">
                    <Flame className="h-4 w-4 text-brand-400" />
                    5 Day Streak
                  </span>
                  <span className="text-neutral-400 text-[11px]">Level 12</span>
                </div>
                <div className="mt-2.5 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-purple-400 w-[68%]" />
                </div>
                <p className="mt-1.5 text-[11px] text-neutral-400">
                  680 / 1000 XP to Level 13
                </p>
              </div>
            </div>
          )} */}
        </div>

        {/* Bottom Section: Profile & Settings */}
        <div className="border-t border-white/10 p-3 space-y-2">
          {/* User Profile Info */}
          <div
            className={`flex items-center gap-3 rounded-xl p-2 bg-surface/60 border border-white/5 ${isCollapsed ? 'justify-center p-1.5' : ''
              }`}
          >
            {isSignedIn ? (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'h-9 w-9 ring-2 ring-brand-500/50',
                  },
                }}
              />
            ) : (
              <div className="relative">
                <img
                  src={displayImage}
                  alt={displayName}
                  className="h-9 w-9 rounded-xl object-cover ring-1 ring-brand-500/50"
                />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-brand-500 ring-2 ring-[#0c0917]" />
              </div>
            )}

            {!isCollapsed && (
              <div className="flex flex-1 flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate">{displayName}</span>

              </div>
            )}
          </div>

          {/* Settings Link 
          <Link
            href="/dashboard/settings"
            onClick={onMobileClose}
            title={isCollapsed ? 'Settings' : undefined}
            className={`flex items-center gap-3.5 rounded-xl px-3.5 py-2 text-xs font-medium text-neutral-400 hover:bg-white/5 hover:text-white transition-colors ${isCollapsed ? 'justify-center px-0' : ''
              }`}
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </Link>*/}
        </div>
      </aside>
    </>
  );
};
