import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'es', 'fr', 'de', 'ar', 'zh', 'ja', 'ko'];
const defaultLocale = 'en';

export function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname;
    const response = NextResponse.next();
    
    // Add security and performance headers
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

    // Handle locale routing
    const pathnameIsMissingLocale = locales.every(
      (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    );

    if (pathnameIsMissingLocale) {
      const locale = defaultLocale;
      return NextResponse.redirect(
        new URL(`/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url)
      );
    }

    // Add caching headers based on route type
    if (request.nextUrl.pathname.startsWith('/api/')) {
      response.headers.set('Cache-Control', 'no-store');
    } else {
      response.headers.set('Cache-Control', 'public, max-age=3600, must-revalidate');
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    
    // Handle API errors
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return new NextResponse(
        JSON.stringify({ error: 'Internal Server Error' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    // Redirect to error page for non-API routes
    return NextResponse.redirect(new URL(`/${defaultLocale}/error`, request.url));
  }
}

export const config = {
  matcher: [
    // Skip all internal paths (_next) and public files
    '/((?!_next|api|favicon.ico|sw.js).*)',
  ],
};
