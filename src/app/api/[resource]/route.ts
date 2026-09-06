import { NextRequest } from 'next/server';
import { getCurrentUserId } from '@/lib/server/auth';
import { prisma } from '@/lib/server/prisma';
import { failure, handleError, success } from '@/lib/server/response';
import { getCached, invalidateCache, setCached, subjectCacheKeys } from '@/lib/server/cache';

type Context = { params: Promise<{ resource: string }> };

function youtubeId(url: string) {
  const match = url.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/);
  return match?.[2]?.length === 11 ? match[2] : '';
}

export async function GET(request: NextRequest, { params }: Context) {
  try {
    const { resource } = await params;
    const userId = await getCurrentUserId();
    const query = request.nextUrl.searchParams;

    if (resource === 'subjects') {
      const cacheKey = `user:${userId}:subjects`;
      const cached = await getCached<Awaited<ReturnType<typeof prisma.subject.findMany>>>(cacheKey);
      if (cached) return success(cached, { cached: true, count: cached.length });
      const subjects = await prisma.subject.findMany({
        where: { userId },
        include: { _count: { select: { videos: true, notes: true, todos: true } } },
        orderBy: { updatedAt: 'desc' },
      });
      await setCached(cacheKey, subjects);
      return success(subjects, { cached: false, count: subjects.length });
    }

    if (resource === 'todos') {
      const canCache = !query.toString();
      const cacheKey = `user:${userId}:todos`;
      if (canCache) {
        const cached = await getCached<Awaited<ReturnType<typeof prisma.todo.findMany>>>(cacheKey);
        if (cached) return success(cached, { cached: true });
      }
      const todos = await prisma.todo.findMany({
        where: {
          userId,
          ...(query.get('subjectId') ? { subjectId: query.get('subjectId')! } : {}),
          ...(query.has('isCompleted') ? { isCompleted: query.get('isCompleted') === 'true' } : {}),
        },
        include: { subject: { select: { id: true, title: true, colorCode: true } } },
        orderBy: [{ isCompleted: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
      });
      if (canCache) await setCached(cacheKey, todos);
      return success(todos);
    }

    if (resource === 'videos') {
      const subjectId = query.get('subjectId');
      if (!subjectId) return failure('subjectId is required', 400, 'VALIDATION_ERROR');
      const cacheKey = `subject:${subjectId}:videos`;
      const cached = await getCached<Awaited<ReturnType<typeof prisma.video.findMany>>>(cacheKey);
      if (cached) return success(cached, { cached: true });
      const videos = await prisma.video.findMany({
        where: { subjectId, subject: { userId } },
        include: { _count: { select: { timestamps: true } } },
        orderBy: { createdAt: 'desc' },
      });
      await setCached(cacheKey, videos);
      return success(videos);
    }

    if (resource === 'timestamps') {
      const videoId = query.get('videoId');
      if (!videoId) return failure('videoId is required', 400, 'VALIDATION_ERROR');
      const cacheKey = `video:${videoId}:timestamps`;
      const cached = await getCached<Awaited<ReturnType<typeof prisma.timestampNote.findMany>>>(cacheKey);
      if (cached) return success(cached, { cached: true });
      const timestamps = await prisma.timestampNote.findMany({
        where: { videoId, video: { subject: { userId } } },
        orderBy: { timeSeconds: 'asc' },
      });
      await setCached(cacheKey, timestamps);
      return success(timestamps);
    }

    if (resource === 'notes') {
      const subjectId = query.get('subjectId');
      if (!subjectId) return failure('subjectId is required', 400, 'VALIDATION_ERROR');
      const cacheKey = `subject:${subjectId}:notes`;
      const cached = await getCached<Awaited<ReturnType<typeof prisma.note.findMany>>>(cacheKey);
      if (cached) return success(cached, { cached: true });
      const notes = await prisma.note.findMany({
        where: { subjectId, subject: { userId } },
        select: { id: true, subjectId: true, title: true, createdAt: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
      });
      await setCached(cacheKey, notes);
      return success(notes);
    }

    return failure('Resource not found', 404, 'NOT_FOUND');
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest, { params }: Context) {
  try {
    const { resource } = await params;
    const userId = await getCurrentUserId();
    const body = await request.json();

    if (resource === 'subjects') {
      if (!body.title?.trim()) return failure('Title is required', 400, 'VALIDATION_ERROR');
      const subject = await prisma.subject.create({
        data: {
          userId,
          title: body.title.trim(),
          description: body.description || null,
          category: body.category || 'GENERAL',
          colorCode: body.colorCode || '#3b82f6',
        },
      });
      await invalidateCache(...subjectCacheKeys(userId));
      return success(subject, undefined, 201);
    }

    if (resource === 'todos') {
      if (!body.title?.trim()) return failure('Title is required', 400, 'VALIDATION_ERROR');
      if (body.subjectId) {
        const subject = await prisma.subject.findFirst({ where: { id: body.subjectId, userId } });
        if (!subject) return failure('Subject not found or access denied', 404, 'NOT_FOUND');
      }
      const todo = await prisma.todo.create({
        data: {
          userId,
          title: body.title.trim(),
          subjectId: body.subjectId || null,
          dueDate: body.dueDate ? new Date(body.dueDate) : null,
        },
        include: { subject: { select: { id: true, title: true, colorCode: true } } },
      });
      await invalidateCache(...subjectCacheKeys(userId, body.subjectId));
      return success(todo, undefined, 201);
    }

    if (resource === 'videos') {
      const id = youtubeId(body.youtubeUrl || '');
      if (!body.subjectId || !body.youtubeUrl || !body.title || !id) {
        return failure('subjectId, youtubeUrl, and title are required', 400, 'VALIDATION_ERROR');
      }
      const subject = await prisma.subject.findFirst({ where: { id: body.subjectId, userId } });
      if (!subject) return failure('Subject not found or access denied', 404, 'NOT_FOUND');
      const video = await prisma.video.create({
        data: {
          subjectId: body.subjectId,
          youtubeUrl: body.youtubeUrl,
          youtubeId: id,
          title: body.title.trim(),
          description: body.description || null,
          thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
        },
      });
      await invalidateCache(...subjectCacheKeys(userId, body.subjectId));
      return success(video, undefined, 201);
    }

    if (resource === 'timestamps') {
      if (!body.videoId || !body.noteText || body.timeSeconds === undefined) {
        return failure('videoId, timeSeconds, and noteText are required', 400, 'VALIDATION_ERROR');
      }
      const video = await prisma.video.findFirst({ where: { id: body.videoId, subject: { userId } } });
      if (!video) return failure('Video not found or access denied', 404, 'NOT_FOUND');
      const seconds = Number(body.timeSeconds);
      if (!Number.isInteger(seconds) || seconds < 0) {
        return failure('Playback time cannot be negative and must be an integer', 400, 'VALIDATION_ERROR');
      }
      const timeLabel = body.timeLabel || `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
      const timestamp = await prisma.timestampNote.create({ data: { videoId: body.videoId, timeSeconds: seconds, timeLabel, noteText: body.noteText } });
      await invalidateCache(`video:${body.videoId}:timestamps`, `video:${body.videoId}:detail`);
      return success(timestamp, undefined, 201);
    }

    if (resource === 'notes') {
      if (!body.subjectId || !body.title) return failure('subjectId and title are required', 400, 'VALIDATION_ERROR');
      const subject = await prisma.subject.findFirst({ where: { id: body.subjectId, userId } });
      if (!subject) return failure('Subject not found or access denied', 404, 'NOT_FOUND');
      const note = await prisma.note.create({ data: { subjectId: body.subjectId, title: body.title.trim(), content: body.content || '' } });
      await invalidateCache(...subjectCacheKeys(userId, body.subjectId));
      return success(note, undefined, 201);
    }

    return failure('Resource not found', 404, 'NOT_FOUND');
  } catch (error) {
    return handleError(error);
  }
}