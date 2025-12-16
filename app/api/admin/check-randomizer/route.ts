import { NextResponse } from 'next/server';
import { shouldRunRandomizer, runRandomizer } from '@/lib/randomizer';

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
    console.error('Error checking/running randomizer:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

