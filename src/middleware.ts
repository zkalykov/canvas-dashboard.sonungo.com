import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || url.hostname;

  // Skip localhost
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return NextResponse.next();
  }

  // Check if protocol is HTTP
  // We check both the x-forwarded-proto header (for when behind a proxy)
  // and the actual request protocol.
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const isHttpProtocol = url.protocol === 'http:';
  
  if (forwardedProto === 'http' || (!forwardedProto && isHttpProtocol)) {
    url.protocol = 'https:';
    url.host = hostname;
    url.port = ''; // Clear port for https
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
