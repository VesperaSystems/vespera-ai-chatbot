import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Health check
  if (pathname.startsWith('/ping')) {
    return new Response('pong', { status: 200 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/chat/:id',
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}