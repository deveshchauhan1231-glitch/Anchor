import { getCurrentUserId } from '@/lib/server/auth';
import { prisma } from '@/lib/server/prisma';
import { handleError, success } from '@/lib/server/response';
import { getCached, setCached } from '@/lib/server/cache';

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const cacheKey = `user:${userId}:profile`;
    const cached = await getCached<Awaited<ReturnType<typeof prisma.user.findUnique>>>(cacheKey);
    if (cached) return success(cached, { cached: true });
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { _count: { select: { subjects: true, todos: true } } },
    });
    if (user) await setCached(cacheKey, user);
    return success(user);
  } catch (error) {
    return handleError(error);
  }
}