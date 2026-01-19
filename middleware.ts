import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js Middleware - Route Protection Layer
 * 
 * Security Model:
 * - Protected routes require active Supabase session
 * - Public routes (/, /auth, /p/*, /api/webhooks/*) bypass auth
 * - Unauthenticated access to protected routes → redirect to /auth
 * - Authenticated users on /auth → redirect to /dashboard
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Validate session - IMPORTANT: Must call getUser() not getSession() to refresh
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const isPublicRoute = 
    pathname === '/' ||
    pathname === '/auth' ||
    pathname === '/auth/callback' ||
    pathname.startsWith('/p/') ||
    pathname.startsWith('/api/webhooks/') ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/terms');

  // If accessing protected route without session → redirect to /auth
  if (!user && !isPublicRoute) {
    const redirectUrl = new URL('/auth', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If authenticated user tries to access /auth → redirect to intended destination
  if (user && pathname === '/auth') {
    const redirectTo = request.nextUrl.searchParams.get('redirectTo');
    const destination = redirectTo && redirectTo.startsWith('/') 
      ? redirectTo 
      : '/dashboard';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public assets (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|assets/).*)',
  ],
};
