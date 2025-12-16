import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/session';
import { toggleUserExclusion } from '@/lib/assignments';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const result = await toggleUserExclusion(userId);
    return NextResponse.json({ success: true, excluded: result.excluded });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error toggling user exclusion:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

