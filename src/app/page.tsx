

import React from 'react';
import Link from 'next/link';
import {
  Anchor,
  Clock,
  FileText,
  Brain,
  ArrowRight,
  Sparkles,
  BookOpen,
  GraduationCap,
  Globe,
  Play,
  CheckCircle2,
  Mic,
  LayoutGrid,
} from 'lucide-react';
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { DemoButton } from '@/components/landing/DemoButton';
import { cookies } from 'next/headers';




export default async function RootHomePage() {

  const { userId } = await auth()
  const demoMode = (await cookies()).get('anchor_demo')?.value === '1';

  if (userId || demoMode) {
    redirect('/dashboard')
  }

  const features = [
    {
      icon: Clock,
      title: 'Smart Timestamps',
      description:
        'Contextual timeline anchors that sync effortlessly with your recorded lectures and YouTube timestamps in 1-click.',
      tag: 'PRECISION TIMELINE',
    },
    {
      icon: FileText,
      title: 'Markdown & Voice Notes',
      description:
        'Write notes, or speak your thoughts with voice-to-text.',
      tag: 'FAST WORKFLOW',
    },
    {
      icon: Brain,
      title: 'Socratic AI Tutor',
      description:
        'Instant, personalized AI dialogue to test your mastery of complex lecture formulas, code snippets, and concepts.',
      tag: 'SOCRATIC MASTER',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-white flex flex-col justify-between selection:bg-brand-500/30 selection:text-brand-200 ">
      {/* Header */}
      <header className="flex h-18 w-full items-center justify-between border-b border-white/10 px-6 lg:px-16 bg-background/80 backdrop-blur-xl sticky top-0 z-30 m-auto align-items:center">
        <div className="flex items-center gap-4 mb-3 mt-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/30 ring-1 ring-brand-400/40">
            <Anchor className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-white font-sans">
              Anchor
            </span>

          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3 sm:gap-6 mb-3 mt-3">
          

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-brand-600/30  hover:from-brand-500 hover:to-purple-500 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Launch Workspace</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Main Full-Width Hero Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 lg:px-12 py-12 sm:py-16 lg:py-20 space-y-20">
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold text-brand-300 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-brand-400" />
            <span>Next-Generation Academic Flow State</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] font-sans">
            Anchor Your Focus. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-brand-200 to-brand-400">
              Master Any Subject.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Anchor groups your YouTube lectures, timestamped moments, and Markdown notes into dedicated subject hubs—so you pick up instantly right where you left off.          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-purple-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-brand-600/35  hover:from-brand-500 hover:to-purple-500 hover:scale-[1.03] active:scale-[0.98]"
            >
              <span>Open Anchor Workspace</span>
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              href="/dashboard/subjects"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-surface px-7 py-4 text-base font-semibold text-neutral-200  hover:from-brand-500 hover:to-purple-500 hover:scale-[1.03] active:scale-[0.98]"
            >
              <LayoutGrid className="h-4 w-4 text-brand-400" />
              <span>Browse Catalog</span>
            </Link>

            <DemoButton />
          </div>
        </section>

        {/* Feature Cards Grid (3 Columns) */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-sans">
              Built for High-Velocity Learning
            </h2>
            <p className="text-sm text-neutral-400">
              Every tool you need to retain knowledge, organized in one seamless desktop canvas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 cursor-default">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-surface p-7 shadow-xl  hover:border-brand-500/40 hover:bg-surface-light hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/15 text-brand-400 border border-brand-500/30 group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-bold tracking-wider text-brand-300 border border-white/5 uppercase">
                      {f.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors font-sans">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Live Workspace Preview Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-tr from-[#120f22] via-[#1a1433] to-[#120f22] p-8 sm:p-12 shadow-2xl">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Zero Friction Setup</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-sans">
                Ready to transform your study flow?
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                Paste any YouTube lecture, bookmark timestamps as you listen, write live Markdown notes, and ask your AI tutor whenever you get stuck.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 shrink-0 rounded-2xl bg-brand-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-brand-600/35  hover:bg-brand-500 hover:scale-[1.02]"
            >
              <span>Get Started Now</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 px-6 text-center space-y-4 bg-background">
        <div className="flex items-center justify-center gap-2">
          <Anchor className="h-5 w-5 text-brand-400" />
          <span className="text-base font-bold text-white">Anchor</span>
        </div>
        <p className="text-xs text-neutral-400 max-w-sm mx-auto">
          The academic flow workspace designed for deep focus and structured mastery.
        </p>
        <p className="text-xs text-neutral-600 pt-2">
          © 2026 Anchor. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
