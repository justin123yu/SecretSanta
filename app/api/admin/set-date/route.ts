import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/session';
import { setRandomizerDate } from '@/lib/randomizer';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const { date } = await request.json();

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      );
    }

    const assignmentDate = new Date(date);
    const currentYear = new Date().getFullYear();

    await setRandomizerDate(assignmentDate, currentYear);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error setting date:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

