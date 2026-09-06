import { getCurrentUserId } from '@/lib/server/auth';
import { failure, handleError, success } from '@/lib/server/response';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    await getCurrentUserId();
    const formData = await request.formData();
    const audio = formData.get('audio');

    if (!(audio instanceof File)) {
      return failure(
        'Audio file is required for transcription (multipart field name: "audio")',
        400,
        'FILE_REQUIRED',
      );
    }
    if (audio.size > 15 * 1024 * 1024) {
      return failure('Audio file exceeds the 15 MB limit', 413, 'FILE_TOO_LARGE');
    }
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes('sample')) {
      return failure('Groq Whisper transcription service is not configured on this server.', 503, 'SERVICE_UNAVAILABLE');
    }

    const upstream = new FormData();
    upstream.append('file', audio, audio.name || 'recording.webm');
    upstream.append('model', 'whisper-large-v3-turbo');
    upstream.append('response_format', 'verbose_json');

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: upstream,
    });
    const result = await response.json();
    if (!response.ok) return failure(result.error?.message || 'Failed to transcribe audio', 500, 'WHISPER_API_ERROR');

    return success({ text: result.text, language: result.language, duration: result.duration });
  } catch (error) {
    return handleError(error);
  }
}