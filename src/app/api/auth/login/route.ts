import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { encryptPayload } from '@/lib/session';

const SESSION_DURATION_SECONDS = 10 * 60; // 10 minutes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { canvas_url, canvas_token } = body;

    if (!canvas_url || !canvas_token) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const payload = JSON.stringify({ canvas_url, canvas_token });
    
    // Encrypt the payload securely so the token is not visible to the user
    const encodedPayload = encryptPayload(payload);

    const cookieStore = await cookies();
    cookieStore.set('portal_session', encodedPayload, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION_SECONDS,
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
