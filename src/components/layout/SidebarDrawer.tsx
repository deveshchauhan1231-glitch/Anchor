'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, BookOpen, Bookmark, Settings, X, Sparkles } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { user } = useUser();

  if (!isOpen) return null;

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
    { label: 'All Subjects', href: '/dashboard/subjects', icon: BookOpen },
    { label: 'My Library', href: '/dashboard/subjects', icon: Bookmark },
  ];

  const displayName = user?.fullName || user?.firstName || 'Alex Rivers';
  const displayImage =
    user?.imageUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide Drawer */}
      <div className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col justify-between border-r border-white/10 bg-[#120f1e] p-6 shadow-2xl transition-transform">
        <div>
          {/* User Profile Header matching screenshot */}
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={displayImage}
                  alt={displayName}
                  className="h-12 w-12 rounded-2xl object-cover ring-2 ring-brand-500 ring-offset-2 ring-offset-background"
                />
              </div>
              <div>
                <h3 className="text-base font-bold text-white leading-snug">{displayName}</h3>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-400">
                  <span>GOLD SCHOLAR</span>
                  <span className="text-white/40">•</span>
                  <span className="text-neutral-400">Level 12</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-white/5 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Items with active left border indicator */}
          <nav className="mt-8 space-y-2">
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
                  onClick={onClose}
                  className={`group relative flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-500/10 text-white font-semibold'
                      : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
                  }`}
                >
                  {/* Active Indicator Bar */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand-400" />
                  )}
                  <Icon
                    className={`h-5 w-5 transition-colors ${
                      isActive ? 'text-brand-400' : 'text-neutral-400 group-hover:text-white'
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Settings Link */}
        <div className="border-t border-white/10 pt-4">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium text-neutral-400 hover:bg-white/5 hover:text-white"
          >
            <Settings className="h-5 w-5 text-neutral-400" />
            <span>Settings</span>
          </Link>
        </div>
      </div>
    </>
  );
};
