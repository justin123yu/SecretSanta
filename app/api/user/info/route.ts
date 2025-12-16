import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { updateUserInfo } from '@/lib/assignments';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { infoText } = await request.json();

    await updateUserInfo(user.id, infoText || '');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error updating user info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

