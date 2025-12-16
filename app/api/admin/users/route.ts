import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/session';
import { getAllUsers } from '@/lib/assignments';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();
    const users = await getAllUsers();
    return NextResponse.json({ users });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

