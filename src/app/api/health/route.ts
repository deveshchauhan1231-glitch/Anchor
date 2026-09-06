import { prisma } from '@/lib/server/prisma';
import { success } from '@/lib/server/response';

export async function GET() {
  let database = 'connected';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    database = `error: ${(error as Error).message}`;
  }

  return success({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database,
      redis: 'not_configured (direct database access)',
    },
  });
}