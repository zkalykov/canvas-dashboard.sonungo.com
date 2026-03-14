import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const SESSION_DURATION_SECONDS = 2 * 60 * 60; // 2 hours

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { canvas_url, canvas_token } = body;

    if (!canvas_url || !canvas_token) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const payload = JSON.stringify({ canvas_url, canvas_token });
    
    // Store as base64 to avoid special character issues in cookies
    const encodedPayload = Buffer.from(payload).toString('base64');

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
