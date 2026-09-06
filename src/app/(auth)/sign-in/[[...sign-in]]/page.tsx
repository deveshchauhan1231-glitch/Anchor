'use client';

import React from 'react';
import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';
import { Anchor, ArrowRight, Sparkles } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#08060f] p-4 sm:p-6 selection:bg-brand-500/30 selection:text-brand-200">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-xl shadow-brand-500/30 ring-1 ring-brand-400/40 mx-auto">
            <Anchor className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans">
            Anchor
          </h1>
          <p className="text-sm text-neutral-400">
            Sign in to your deep focus academic workspace
          </p>
        </div>

        {/* Clerk Sign In Card with Violet Obsidian Styling */}
        <div className="flex justify-center">
          <SignIn
            forceRedirectUrl="/dashboard"
            appearance={{
              variables: {
                colorText: '#ffffff',
                colorTextSecondary: '#a1a1aa',
                colorInputText: '#ffffff',
              },
              elements: {
                card: 'bg-[#120f22] border border-white/10 shadow-2xl text-white rounded-2xl',
                headerTitle: 'text-white text-lg font-bold font-sans',
                headerSubtitle: 'text-neutral-400 text-sm',
                formFieldLabel: 'text-neutral-300 text-sm font-medium',
                formFieldInput: 'bg-[#0d0a17] border-white/10 text-white text-sm rounded-xl',
                formButtonPrimary: 'bg-brand-600 hover:bg-brand-500 text-white font-semibold py-2.5 text-sm rounded-xl shadow-lg shadow-brand-600/30',
                footerActionLink: 'text-brand-400 hover:text-brand-300 text-sm font-semibold',
              },
            }}
          />
        </div>

        {/* Quick Testing Bypass Option */}
        <div className="text-center pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-400 hover:text-brand-300 hover:underline transition-colors"
          >
            <span>Skip sign-in & explore as Guest (Alex)</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
