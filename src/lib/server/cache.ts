import { Redis } from '@upstash/redis';

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

const ttl = Number(process.env.REDIS_CACHE_TTL_SECONDS || 3600);

export async function getCached<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    return await redis.get<T>(key);
  } catch {
    return null;
  }
}

export async function setCached<T>(key: string, value: T): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(key, value, { ex: ttl });
  } catch {
    // Redis is an optimization; database reads remain the fallback.
  }
}

export async function invalidateCache(...keys: string[]): Promise<void> {
  if (!redis || keys.length === 0) return;
  try {
    await redis.del(...keys);
  } catch {
    // A cache invalidation failure must not fail the database mutation.
  }
}

export function subjectCacheKeys(userId: string, subjectId?: string) {
  return [
    `user:${userId}:subjects`,
    `user:${userId}:todos`,
    `user:${userId}:profile`,
    ...(subjectId ? [`subject:${subjectId}:detail`, `subject:${subjectId}:videos`, `subject:${subjectId}:notes`, `subject:${subjectId}:todos`] : []),
  ];
}