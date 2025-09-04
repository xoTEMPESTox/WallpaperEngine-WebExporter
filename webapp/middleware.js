import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // No rewrites initially

  return NextResponse.next();
}

export const config = {
  matcher: '/demo/:id*',
};