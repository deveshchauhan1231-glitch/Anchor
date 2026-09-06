'use client';

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0c0a13] p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white">
            Study<span className="text-brand-400">Hall</span>
          </h1>
          <p className="mt-1 text-xs text-neutral-400">Create your scholar account</p>
        </div>
        <SignUp
          forceRedirectUrl="/dashboard"
          appearance={{
            elements: {
              card: 'bg-[#141122] border border-white/10 shadow-2xl text-white',
              headerTitle: 'text-white',
              headerSubtitle: 'text-neutral-400',
              formFieldLabel: 'text-neutral-300',
              formButtonPrimary: 'bg-brand-600 hover:bg-brand-500 text-white',
              footerActionLink: 'text-brand-400 hover:text-brand-300',
            },
          }}
        />
      </div>
    </div>
  );
}
