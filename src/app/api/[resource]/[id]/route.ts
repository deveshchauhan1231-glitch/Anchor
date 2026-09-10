import { NextRequest } from 'next/server';
import { getCurrentUserId, rejectDemoWrite } from '@/lib/server/auth';
import { prisma } from '@/lib/server/prisma';
import { failure, handleError, success } from '@/lib/server/response';
import { getCached, invalidateCache, setCached, subjectCacheKeys } from '@/lib/server/cache';

type Context = { params: Promise<{ resource: string; id: string }> };

export async function GET(_request: NextRequest, { params }: Context) {
  try {
    const { resource, id } = await params;
    const userId = await getCurrentUserId();
    if (resource === 'subjects') {
      const cacheKey = `subject:${id}:detail`;
      const cached = await getCached<Awaited<ReturnType<typeof prisma.subject.findFirst>>>(cacheKey);
      if (cached) return success(cached, { cached: true });
      const subject = await prisma.subject.findFirst({ where: { id, userId }, include: {
        _count: { select: { videos: true, notes: true, todos: true } },
        videos: { take: 5, orderBy: { updatedAt: 'desc' }, include: { _count: { select: { timestamps: true } } } },
        notes: { take: 5, orderBy: { updatedAt: 'desc' }, select: { id: true, title: true, createdAt: true, updatedAt: true } },
        todos: { take: 5, orderBy: { createdAt: 'desc' } },
      } });
      if (subject) await setCached(cacheKey, subject);
      return subject ? success(subject) : failure('Subject not found or access denied', 404, 'NOT_FOUND');
    }
    if (resource === 'videos') {
      const cacheKey = `video:${id}:detail`;
      const cached = await getCached<Awaited<ReturnType<typeof prisma.video.findFirst>>>(cacheKey);
      if (cached) return success(cached, { cached: true });
      const video = await prisma.video.findFirst({
        where: { id, subject: { userId } },
        include: {
          subject: { select: { id: true, title: true, userId: true, colorCode: true } },
          timestamps: { orderBy: { timeSeconds: 'asc' } },
        },
      });
      if (video) await setCached(cacheKey, video);
      return video ? success(video) : failure('Video not found or access denied', 404, 'NOT_FOUND');
    }
    if (resource === 'notes') {
      const cacheKey = `note:${id}:detail`;
      const cached = await getCached<Awaited<ReturnType<typeof prisma.note.findFirst>>>(cacheKey);
      if (cached) return success(cached, { cached: true });
      const note = await prisma.note.findFirst({
        where: { id, subject: { userId } },
        include: { subject: { select: { id: true, title: true, userId: true, colorCode: true } } },
      });
      if (note) await setCached(cacheKey, note);
      return note ? success(note) : failure('Note not found or access denied', 404, 'NOT_FOUND');
    }
    return failure('Resource not found', 404, 'NOT_FOUND');
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: NextRequest, { params }: Context) {
  try {
    await rejectDemoWrite();
    const { resource, id } = await params;
    const userId = await getCurrentUserId();
    const body = await request.json();

    if (resource === 'subjects') {
      const existing = await prisma.subject.findFirst({ where: { id, userId } });
      if (!existing) return failure('Subject not found or access denied', 404, 'NOT_FOUND');
      const updated = await prisma.subject.update({ where: { id }, data: { ...(body.title !== undefined ? { title: body.title } : {}), ...(body.description !== undefined ? { description: body.description } : {}), ...(body.category !== undefined ? { category: body.category } : {}), ...(body.colorCode !== undefined ? { colorCode: body.colorCode } : {}) } });
      await invalidateCache(...subjectCacheKeys(userId, id));
      return success(updated);
    }

    if (resource === 'videos') {
      const existing = await prisma.video.findFirst({ where: { id, subject: { userId } } });
      if (!existing) return failure('Video not found or access denied', 404, 'NOT_FOUND');
      const updated = await prisma.video.update({ where: { id }, data: { ...(body.title !== undefined ? { title: body.title } : {}), ...(body.description !== undefined ? { description: body.description } : {}) } });
      await invalidateCache(...subjectCacheKeys(userId, existing.subjectId), `video:${id}:detail`);
      return success(updated);
    }

    if (resource === 'timestamps') {
      const existing = await prisma.timestampNote.findFirst({ where: { id, video: { subject: { userId } } } });
      if (!existing) return failure('Timestamp not found or access denied', 404, 'NOT_FOUND');
      const nextSeconds = body.timeSeconds !== undefined ? Number(body.timeSeconds) : undefined;
      const nextLabel = body.timeLabel !== undefined
        ? body.timeLabel
        : nextSeconds !== undefined
          ? `${String(Math.floor(nextSeconds / 60)).padStart(2, '0')}:${String(nextSeconds % 60).padStart(2, '0')}`
          : undefined;
      const updated = await prisma.timestampNote.update({ where: { id }, data: { ...(nextSeconds !== undefined ? { timeSeconds: nextSeconds } : {}), ...(nextLabel ? { timeLabel: nextLabel } : {}), ...(body.noteText !== undefined ? { noteText: body.noteText } : {}) } });
      await invalidateCache(`video:${existing.videoId}:timestamps`, `video:${existing.videoId}:detail`);
      return success(updated);
    }

    if (resource === 'notes') {
      const existing = await prisma.note.findFirst({ where: { id, subject: { userId } } });
      if (!existing) return failure('Note not found or access denied', 404, 'NOT_FOUND');
      const updated = await prisma.note.update({ where: { id }, data: { ...(body.title !== undefined ? { title: body.title } : {}), ...(body.content !== undefined ? { content: body.content } : {}) } });
      await invalidateCache(...subjectCacheKeys(userId, existing.subjectId), `note:${id}:detail`);
      return success(updated);
    }

    if (resource === 'todos') {
      const existing = await prisma.todo.findFirst({ where: { id, userId } });
      if (!existing) return failure('Todo not found or access denied', 404, 'NOT_FOUND');
      const updated = await prisma.todo.update({ where: { id }, data: { ...(body.title !== undefined ? { title: body.title } : {}), ...(body.isCompleted !== undefined ? { isCompleted: body.isCompleted } : {}), ...(body.dueDate !== undefined ? { dueDate: body.dueDate ? new Date(body.dueDate) : null } : {}) }, include: { subject: { select: { id: true, title: true, colorCode: true } } } });
      await invalidateCache(...subjectCacheKeys(userId, existing.subjectId || undefined));
      return success(updated);
    }
    return failure('Resource not found', 404, 'NOT_FOUND');
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Context) {
  try {
    await rejectDemoWrite();
    const { resource, id } = await params;
    const userId = await getCurrentUserId();
    if (resource === 'subjects') {
      const item = await prisma.subject.findFirst({ where: { id, userId } });
      if (!item) return failure('Subject not found or access denied', 404, 'NOT_FOUND');
      await prisma.subject.delete({ where: { id } });
      await invalidateCache(...subjectCacheKeys(userId, id));
    } else if (resource === 'todos') {
      const item = await prisma.todo.findFirst({ where: { id, userId } });
      if (!item) return failure('Todo not found or access denied', 404, 'NOT_FOUND');
      await prisma.todo.delete({ where: { id } });
      await invalidateCache(...subjectCacheKeys(userId, item.subjectId || undefined));
    } else if (resource === 'videos') {
      const item = await prisma.video.findFirst({ where: { id, subject: { userId } } });
      if (!item) return failure('Video not found or access denied', 404, 'NOT_FOUND');
      await prisma.video.delete({ where: { id } });
      await invalidateCache(...subjectCacheKeys(userId, item.subjectId), `video:${id}:detail`, `video:${id}:timestamps`);
    } else if (resource === 'notes') {
      const item = await prisma.note.findFirst({ where: { id, subject: { userId } } });
      if (!item) return failure('Note not found or access denied', 404, 'NOT_FOUND');
      await prisma.note.delete({ where: { id } });
      await invalidateCache(...subjectCacheKeys(userId, item.subjectId), `note:${id}:detail`);
    } else if (resource === 'timestamps') {
      const item = await prisma.timestampNote.findFirst({ where: { id, video: { subject: { userId } } } });
      if (!item) return failure('Timestamp not found or access denied', 404, 'NOT_FOUND');
      await prisma.timestampNote.delete({ where: { id } });
      await invalidateCache(`video:${item.videoId}:timestamps`, `video:${item.videoId}:detail`);
    } else return failure('Resource not found', 404, 'NOT_FOUND');
    return success({ id, deleted: true });
  } catch (error) {
    return handleError(error);
  }
}