import { NextResponse, type NextRequest } from 'next/server';

// Host-based routing:
// - Company site (vesperasystems.com): the corporate landing page owns `/`.
// - Product (vespera.systems, *.vercel.app previews, localhost): `/` is the AI chat.
const COMPANY_HOSTS = new Set(['vesperasystems.com', 'www.vesperasystems.com']);

function isCompanyHost(hostHeader: string | null) {
  if (!hostHeader) return false;
  const host = hostHeader.split(':')[0].toLowerCase();
  return COMPANY_HOSTS.has(host);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Health check
  if (pathname.startsWith('/ping')) {
    return new Response('pong', { status: 200 });
  }

  // Skip middleware for static files, source maps, and other non-chat routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/sitemap.xml') ||
    pathname.startsWith('/robots.txt') ||
    pathname.includes('.') || // Skip files with extensions
    pathname.startsWith('/images/') ||
    pathname.startsWith('/logos/')
  ) {
    return NextResponse.next();
  }

  // Product domains serve the AI chat at the root; the company domain keeps
  // the corporate landing page that owns `/` in the app tree.
  if (pathname === '/' && !isCompanyHost(request.headers.get('host'))) {
    const url = request.nextUrl.clone();
    url.pathname = '/chat';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/chat/:id',
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
