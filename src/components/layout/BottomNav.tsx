'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, BookOpen, Bookmark, Bot, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
    { label: 'Subjects', href: '/dashboard/subjects', icon: BookOpen },
    { label: 'Library', href: '/dashboard/subjects', icon: Bookmark },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-30 flex h-16 w-full items-center justify-around border-t border-white/10 bg-[#0c0917]/95 px-4 backdrop-blur-xl lg:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href);

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 p-2 transition-all ${
              isActive ? 'text-brand-400 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive ? 'scale-110' : ''}`} />
            <span className="text-[11px]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
