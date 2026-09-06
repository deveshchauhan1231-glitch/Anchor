'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ClerkThemeProvider({
  publishableKey,
  children,
}: {
  publishableKey: string;
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use default theme if not yet mounted/resolved
  const isDark = mounted ? resolvedTheme !== 'light' : true;

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      appearance={{
        variables: isDark
          ? {
              colorPrimary: '#6366f1',
              colorBackground: '#111118',
              colorText: '#ffffff',
              colorTextSecondary: '#a1a1aa',
              colorInputBackground: '#0f0f17',
              colorInputText: '#ffffff',
            }
          : {
              colorPrimary: '#4f46e5',
              colorBackground: '#ffffff',
              colorText: '#18181b',
              colorTextSecondary: '#52525b',
              colorInputBackground: '#f4f4f5',
              colorInputText: '#18181b',
            },
        elements: {
          userButtonPopoverCard: isDark
            ? 'bg-[#111118] !text-white border border-white/10 shadow-2xl'
            : 'bg-white !text-black border border-zinc-200 shadow-xl',
          userButtonPopoverActionButton: isDark
            ? '!text-white hover:bg-white/10'
            : '!text-black hover:bg-zinc-100',
          userButtonPopoverActionButtonText: isDark
            ? '!text-white'
            : '!text-black',
          userPreviewMainIdentifier: isDark ? '!text-white' : '!text-black',
          userPreviewSecondaryIdentifier: isDark
            ? '!text-zinc-400'
            : '!text-zinc-600',
          userButtonPopoverFooter: isDark
            ? 'border-white/10'
            : 'border-zinc-200',
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}