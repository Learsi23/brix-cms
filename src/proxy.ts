import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Next.js 16+ proxy — replaces middleware.ts
// Protects /admin/* and handles login redirect

const COOKIE_NAME = 'eden_auth';

export function proxy(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME);
  const { pathname } = request.nextUrl;

  // Protect /admin/* — redirect to login if no session
  if (pathname.startsWith('/admin') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Already logged in — skip login page → go to admin
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
