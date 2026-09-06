import { NextRequest } from 'next/server';

const AI_BOT_BACKEND_URL = process.env.AI_BOT_BACKEND_URL;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  if (!AI_BOT_BACKEND_URL) {
    return Response.json({ message: 'AI chatbot backend is not configured.' }, { status: 503 });
  }

  const { path } = await params;
  const upstream = await fetch(
    `${AI_BOT_BACKEND_URL.replace(/\/$/, '')}/${path.join('/')}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: await request.text(),
    }
  );

  return new Response(await upstream.text(), {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
    },
  });
}
