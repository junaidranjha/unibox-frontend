import { NextResponse, type NextRequest } from 'next/server';

// Auth state lives in localStorage (client-only). We only route-level redirect
// `/` to `/inbox` here; the client AuthGate below is the real gatekeeper.
export function middleware(req: NextRequest): NextResponse {
  if (req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/inbox', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};
