import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getAssignment, getUserInfo } from '@/lib/assignments';
import DashboardClient from './dashboard-client';

export default async function DashboardPage() {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  const currentYear = new Date().getFullYear();
  const assignment = await getAssignment(user.id, currentYear);
  const userInfo = await getUserInfo(user.id);

  return <DashboardClient user={user} assignment={assignment} userInfo={userInfo || null} />;
}

