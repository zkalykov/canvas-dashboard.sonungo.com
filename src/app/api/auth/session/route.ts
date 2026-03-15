import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decryptPayload } from '@/lib/session';

export async function GET() {
  if (process.env.APP_STATUS === 'test') {
    return NextResponse.json({
      authenticated: true,
      canvas_url: process.env.CANVAS_BASE_URL || process.env.NEXT_PUBLIC_CANVAS_BASE_URL
    });
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('portal_session');

  if (!sessionCookie?.value) {
    return NextResponse.json({ authenticated: false });
  }

  try {
    const decoded = decryptPayload(sessionCookie.value);
    if (!decoded) {
      throw new Error('Failed to decrypt session');
    }
    const { canvas_url } = JSON.parse(decoded);
    
    // We only send the boolean state and the canvas_url (for display purposes).
    // DO NOT send the canvas_token back to the client!
    return NextResponse.json({ authenticated: true, canvas_url });
  } catch (e) {
    console.error('[API] Session check error:', e);
    return NextResponse.json({ authenticated: false });
  }
}
