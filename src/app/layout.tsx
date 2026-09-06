import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { ClerkThemeProvider } from '@/components/layout/ClerkThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Anchor | The Academic Flow Workspace',
  description:
    'Deep focus learning platform with synchronized YouTube video tracking, timestamp bookmarks, GitHub-style Markdown notes, Whisper speech transcription, and AI tutor.',
  icons: {
    icon: '/anchor-favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
}

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased selection:bg-brand-500/30 selection:text-brand-200">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <ClerkThemeProvider publishableKey={clerkPubKey}>
            {children}
            {/* Sonner Toaster */}
            <Toaster
              position="top-right"
              theme="system"
              richColors
              closeButton
              toastOptions={{
                style: {
                  background: 'var(--color-surface)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: 'var(--color-foreground)',
                  boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.3)',
                },
              }}
            />
          </ClerkThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
