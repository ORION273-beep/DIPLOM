import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Admin routes only — auth for profile/checkout is handled on the client. */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');

  if (!isAdminRoute) {
    return NextResponse.next();
  }

  const hasRefresh = request.cookies.has('refresh_token');
  if (!hasRefresh) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  const role = request.cookies.get('user_role')?.value;
  if (role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
