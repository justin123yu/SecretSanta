import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/session';
import { createPasswordResetToken } from '@/lib/password-reset';
import { getUserById } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const token = await createPasswordResetToken(userId);
    
    // Generate the reset URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    return NextResponse.json({ 
      success: true, 
      token,
      resetUrl 
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error generating reset token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

