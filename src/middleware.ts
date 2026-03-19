import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || url.hostname;

  let res = NextResponse.next();

  // Skip localhost for redirect
  if (!hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
    // Check if protocol is HTTP
    // We check both the x-forwarded-proto header (for when behind a proxy)
    // and the actual request protocol.
    const forwardedProto = request.headers.get('x-forwarded-proto');
    const isHttpProtocol = url.protocol === 'http:';
    
    if (forwardedProto === 'http' || (!forwardedProto && isHttpProtocol)) {
      url.protocol = 'https:';
      url.host = hostname;
      url.port = ''; // Clear port for https
      res = NextResponse.redirect(url, 301);
    }
  }

  // Refresh portal_session cookie to extend inactivity timeout
  const sessionCookie = request.cookies.get('portal_session');
  if (sessionCookie) {
    res.cookies.set({
      name: 'portal_session',
      value: sessionCookie.value,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60, // 10 minutes
      path: '/',
    });
  }

  return res;
}

export const config = {
  matcher: '/:path*',
};
