import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('portal_session');

  if (!sessionCookie?.value) {
    return NextResponse.json({ authenticated: false });
  }

  try {
    const decoded = Buffer.from(sessionCookie.value, 'base64').toString();
    const { canvas_url } = JSON.parse(decoded);
    
    // We only send the boolean state and the canvas_url (for display purposes).
    // DO NOT send the canvas_token back to the client!
    return NextResponse.json({ authenticated: true, canvas_url });
  } catch (e) {
    console.error('[API] Session check error:', e);
    return NextResponse.json({ authenticated: false });
  }
}
