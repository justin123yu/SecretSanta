import { NextResponse } from 'next/server';
import { initDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await initDatabase();
    return NextResponse.json({ success: true, message: 'Database initialized' });
  } catch (error: any) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize database' },
      { status: 500 }
    );
  }
}

