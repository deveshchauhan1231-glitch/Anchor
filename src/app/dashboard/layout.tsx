'use client';

import React, { useState } from 'react';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { AITutorDrawer } from '@/components/assistant/AITutorDrawer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAITutorOpen, setIsAITutorOpen] = useState(false);

  const handleToggleSidebar = () => {
    // On small screens, open mobile slide drawer
    if (window.innerWidth < 1024) {
      setIsMobileSidebarOpen((prev) => !prev);
    } else {
      // On desktop, toggle collapse
      setIsSidebarCollapsed((prev) => !prev);
    }
  };

  return (
    <div className="min-h-screen bg-background  text-white flex overflow-hidden">
      {/* Collapsible Sidebar (Desktop persistent + Mobile drawer) */}
      <AppSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        onOpenAITutor={() => setIsAITutorOpen(true)}
      />

      {/* Main Workspace Area spanning 100% of remaining width */}
      <div className="flex flex-1 flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <AppHeader
          onToggleSidebar={handleToggleSidebar}
          onToggleAITutor={() => setIsAITutorOpen((prev) => !prev)}
          isAITutorOpen={isAITutorOpen}
        />

        {/* Content Canvas */}
        <div className="flex flex-1 overflow-hidden relative">
          <main className="flex-1 overflow-y-auto pb-20 lg:pb-8 min-w-0">
            {children}
          </main>

          {/* AI Tutor Drawer (dockable / slide-over) */}
          <AITutorDrawer
            isOpen={isAITutorOpen}
            onClose={() => setIsAITutorOpen(false)}
          />
        </div>

        {/* Mobile Quick Bottom Bar */}
        <BottomNav />
      </div>
    </div>
  );
}
