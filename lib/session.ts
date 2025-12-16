import { cookies } from 'next/headers';
import { getUserById } from './auth';
import { User } from './auth';

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;

  if (!userId) {
    return null;
  }

  try {
    const user = await getUserById(parseInt(userId));
    return user;
  } catch (error) {
    return null;
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getSession();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth();
  if (!user.is_admin) {
    throw new Error('Forbidden: Admin access required');
  }
  return user;
}

