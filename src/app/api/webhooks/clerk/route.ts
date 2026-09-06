import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { failure, success } from '@/lib/server/response';
import { invalidateCache } from '@/lib/server/cache';

export async function POST(request: NextRequest) {
  try {
    const event = await verifyWebhook(request);
    const data = event.data as {
      id: string;
      image_url?: string;
      first_name?: string;
      last_name?: string;
      email_addresses?: Array<{ email_address: string }>;
    };

    if (event.type === 'user.created' || event.type === 'user.updated') {
      const primaryEmail = data.email_addresses?.[0]?.email_address || null;
      await prisma.user.upsert({
        where: { id: data.id },
        create: {
          id: data.id,
          email: primaryEmail,
          firstName: data.first_name || null,
          lastName: data.last_name || null,
          imageUrl: data.image_url || null,
        },
        update: {
          email: primaryEmail,
          firstName: data.first_name || null,
          lastName: data.last_name || null,
          imageUrl: data.image_url || null,
        },
      });
      await invalidateCache(`user:${data.id}:profile`);
    } else if (event.type === 'user.deleted') {
      await prisma.user.deleteMany({ where: { id: data.id } });
      await invalidateCache(`user:${data.id}:profile`, `user:${data.id}:subjects`, `user:${data.id}:todos`);
    }

    return success({ received: true });
  } catch (error) {
    console.error('Clerk webhook error:', error);
    return failure('Invalid Clerk webhook', 400, 'WEBHOOK_VERIFICATION_FAILED');
  }
}