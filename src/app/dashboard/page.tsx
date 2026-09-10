import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import DashboardClient from "./DashboardClient";
import { cookies } from 'next/headers';

export default async function DashboardPage() {
  const { userId } = await auth();

  const demoMode = (await cookies()).get('anchor_demo')?.value === '1';

  if (!userId && !demoMode) {
    redirect('/sign-in');
  }

  return <DashboardClient />;
}