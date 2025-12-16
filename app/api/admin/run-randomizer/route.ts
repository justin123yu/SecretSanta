import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/session';
import { runRandomizer } from '@/lib/randomizer';

export async function POST() {
  try {
    await requireAdmin();
    await runRandomizer();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error running randomizer:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

