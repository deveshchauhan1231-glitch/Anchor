import { auth, currentUser } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { prisma } from './prisma';

export async function getCurrentUserId() {
  const userId = (await auth()).userId;
  const requestHeaders = await headers();
  const resolvedUserId = userId ||
    (process.env.NODE_ENV !== 'production'
      ? requestHeaders.get('x-dev-user-id') || process.env.DEV_USER_ID
      : null) ||
    'user_scholar_alex';

  let profile: {
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    imageUrl?: string | null;
  } = {};

  if (userId) {
    try {
      const clerkUser = await currentUser();
      profile = {
        email: clerkUser?.emailAddresses[0]?.emailAddress,
        firstName: clerkUser?.firstName,
        lastName: clerkUser?.lastName,
        imageUrl: clerkUser?.imageUrl,
      };
    } catch {
      // The webhook remains the source of truth when Clerk profile lookup is unavailable.
    }
  }

  await prisma.user.upsert({
    where: { id: resolvedUserId },
    create: {
      id: resolvedUserId,
      email: profile.email || (userId ? null : 'dev@example.com'),
      firstName: profile.firstName || (userId ? null : 'Dev'),
      lastName: profile.lastName || (userId ? null : 'Student'),
      imageUrl: profile.imageUrl || null,
    },
    update: profile,
  });

  return resolvedUserId;
}