import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow ping route for health checks
  if (pathname.startsWith('/ping')) {
    return new Response('pong', { status: 200 })
  }

  // Allow auth API routes without checks
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // Read Supabase session cookie
  const supabaseToken =
    request.cookies.get('sb-access-token')?.value ||
    request.cookies.get('supabase-auth-token')?.value

  // If user is not logged in
  if (!supabaseToken && pathname !== '/login' && pathname !== '/register') {
    const redirectUrl = encodeURIComponent(request.url)
    return NextResponse.redirect(
      new URL(`/login?redirectUrl=${redirectUrl}`, request.url)
    )
  }

  // Optional: redirect logged-in users away from login/register
  if (supabaseToken && ['/login', '/register'].includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/chat/:id',
    '/login',
    '/register',
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}