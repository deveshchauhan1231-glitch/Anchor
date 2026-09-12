'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/server/prisma';

export async function enterDemoAction() {
  if ((await auth()).userId) {
    redirect('/dashboard');
  }

  const demoUserId = 'demo_user_anchor';

  await prisma.user.upsert({
    where: { id: demoUserId },
    create: {
      id: demoUserId,
      email: 'demo@anchor.study',
      firstName: 'Demo',
      lastName: 'Student',
    },
    update: {},
  });

  const subject = await prisma.subject.findFirst({
    where: { userId: demoUserId, title: 'Quantum Physics' },
  });

  const demoSubject = subject ?? await prisma.subject.create({
    data: {
      userId: demoUserId,
      title: 'Quantum Physics',
      description: 'A guided introduction to the foundations of quantum mechanics.',
      category: 'SCIENCES',
      colorCode: '#f97316',
    },
  });

  const existingNote = await prisma.note.findFirst({
    where: { subjectId: demoSubject.id, title: 'Lecture 1: The Quantum World' },
  });

  if (!existingNote) {
    await prisma.note.create({
      data: {
        subjectId: demoSubject.id,
        title: 'Lecture 1: The Quantum World',
        content: '# Lecture 1: The Quantum World\n\nQuantum mechanics describes nature at the smallest scales. Key ideas include quantization, wave-particle duality, and the role of measurement.\n',
      },
    });
  }

  const existingVideo = await prisma.video.findFirst({
    where: { subjectId: demoSubject.id, title: 'Lecture 1: Quantum Mechanics' },
  });

  if (!existingVideo) {
    await prisma.video.create({
      data: {
        subjectId: demoSubject.id,
        youtubeUrl: 'https://www.youtube.com/watch?v=6AYT08PLX7U&list=PLuyN7BuB3DLzQPQz9LIt-xyu9KBdeBTLN',
        youtubeId: '9XyF5mb5FzQ',
        title: 'Lecture 1: Basics',
        description: 'A short introduction to quantum mechanics.',
        thumbnailUrl: 'https://img.youtube.com/vi/9XyF5mb5FzQ/hqdefault.jpg',
      },
    });
  }

  const cookieStore = await cookies();
  cookieStore.set('anchor_demo', '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  redirect('/dashboard');
}
