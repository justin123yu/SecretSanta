import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('user_id');
  cookieStore.delete('user_email');
  cookieStore.delete('is_admin');

  return NextResponse.json({ success: true });
}

