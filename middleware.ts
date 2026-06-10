import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)

async function verifySession(session: string | undefined) {
  if (!session) return null
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload
  } catch {
    return null
  }
}

const protectedRoutes = ['/admin']
const publicRoutes = ['/login']

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route))
  const isApiRoute = path.startsWith('/api') && !path.startsWith('/api/auth/login')

  const cookie = req.cookies.get('session')?.value
  const session = await verifySession(cookie)

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  // Redirect to admin if accessing login page with active session
  if (isPublicRoute && session) {
    return NextResponse.redirect(new URL('/admin', req.nextUrl))
  }

  // Protect API routes (except auth endpoints)
  if (isApiRoute && !session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/api/:path*'],
}
