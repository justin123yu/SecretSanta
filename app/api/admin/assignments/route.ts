import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/session';
import { getAllAssignments } from '@/lib/assignments';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year') 
      ? parseInt(searchParams.get('year')!) 
      : new Date().getFullYear();

    const assignments = await getAllAssignments(year);
    return NextResponse.json({ assignments });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

