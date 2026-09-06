import { NextResponse } from 'next/server';

export function success<T>(data: T, meta?: Record<string, unknown>, status = 200) {
  return NextResponse.json({ success: true, data, ...(meta ? { meta } : {}) }, { status });
}

export function failure(message: string, status = 500, code = 'API_ERROR') {
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status },
  );
}

export function handleError(error: unknown) {
  const known = error as { statusCode?: number; message?: string };
  return failure(known.message || 'An unexpected error occurred', known.statusCode || 500);
}