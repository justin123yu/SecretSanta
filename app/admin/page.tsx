import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/session';
import { getRandomizerConfig } from '@/lib/randomizer';
import AdminClient from './admin-client';

export default async function AdminPage() {
  const user = await requireAdmin().catch(() => null);
  
  if (!user) {
    redirect('/dashboard');
  }

  const currentYear = new Date().getFullYear();
  const config = await getRandomizerConfig(currentYear);

  return <AdminClient config={config} />;
}

