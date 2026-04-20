import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const hasRefreshCookie = request.cookies.has('refreshToken');
  const { pathname } = request.nextUrl;

  const isProtectedPath = pathname.startsWith('/dashboard');
  const isAuthPath = pathname.startsWith('/login') || pathname.startsWith('/register');

  if (isProtectedPath && !hasRefreshCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthPath && hasRefreshCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
