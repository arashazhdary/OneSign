import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales } from './i18n';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always'
});

export default function middleware(request: NextRequest) {
  // Handle root path redirect first
  if (request.nextUrl.pathname === '/') {
    // Redirect to login page with default locale
    return NextResponse.redirect(new URL('/en/login', request.url));
  }
  
  // Let next-intl handle other paths
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // Explicitly match root path
    '/'
  ]
};

