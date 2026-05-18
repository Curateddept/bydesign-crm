import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that are public (portal-only, no admin needed)
const PORTAL_ROUTES = ['/portal']
// Routes that require admin access
const ADMIN_ROUTES = ['/clients', '/todos', '/deliverables', '/analytics', '/calendar']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow login page freely
  if (pathname === '/login') {
    return NextResponse.next()
  }

  // Allow portal routes freely
  if (pathname.startsWith('/portal') || pathname.startsWith('/api/portal')) {
    return NextResponse.next()
  }

  // Allow API routes freely (they have their own auth)
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // For admin routes, check for admin session cookie
  const isAdminRoute = ADMIN_ROUTES.some(r => pathname.startsWith(r)) || pathname === '/'
  if (isAdminRoute) {
    const adminSession = request.cookies.get('admin_session')
    if (!adminSession || adminSession.value !== 'authenticated') {
      // Redirect to admin login
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
