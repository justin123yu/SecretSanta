import { NextResponse } from 'next/server';
import { shouldRunRandomizer, runRandomizer } from '@/lib/randomizer';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const shouldRun = await shouldRunRandomizer();
    
    if (shouldRun) {
      await runRandomizer();
      return NextResponse.json({ 
        success: true, 
        message: 'Randomizer has been executed',
        executed: true 
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Randomizer not scheduled to run yet',
      executed: false 
    });
  } catch (error: any) {
    // Handle case where database tables don't exist yet
    if (error.message?.includes('does not exist') || error.code === '42P01') {
      console.log('Database not initialized yet, skipping randomizer check');
      return NextResponse.json({ 
        success: true, 
        message: 'Database not initialized yet',
        executed: false 
      });
    }
    
    console.error('Error checking/running randomizer:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

