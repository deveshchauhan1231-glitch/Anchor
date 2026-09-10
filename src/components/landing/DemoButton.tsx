'use client';

import { useFormStatus } from 'react-dom';
import { ArrowRight, Play } from 'lucide-react';
import { enterDemoAction } from '@/app/actions/demo';

function DemoButtonContent() {
  const { pending } = useFormStatus();

  return (
    <>
      <Play className="h-4 w-4" />
      <span>{pending ? 'Opening Demo...' : 'View Demo'}</span>
      {!pending && <ArrowRight className="h-4 w-4" />}
    </>
  );
}

export function DemoButton() {
  return (
    <form action={enterDemoAction}>
      <button
        type="submit"
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-brand-500/40 bg-brand-500/10 px-7 py-4 text-base font-semibold text-brand-300 hover:border-brand-400 hover:bg-brand-500/20 sm:w-auto"
      >
        <DemoButtonContent />
      </button>
    </form>
  );
}
