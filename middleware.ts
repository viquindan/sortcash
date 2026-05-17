import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const isPublicRoute = (path: string) =>
  path === '/' ||
  path.startsWith('/sign-in') ||
  path.startsWith('/sign-up') ||
  path.startsWith('/forgot-password') ||
  path.startsWith('/reset-password') ||
  path.startsWith('/api/auth/') ||
  path.startsWith('/terms');

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicRoute(pathname)) return NextResponse.next();

  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    // Misconfigured server — block access safely
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  const cookie = request.cookies.get('session')?.value;
  if (!cookie) return NextResponse.redirect(new URL('/sign-in', request.url));

  try {
    const key = new TextEncoder().encode(secretKey);
    await jwtVerify(cookie, key, { algorithms: ['HS256'] });
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|mjs|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
