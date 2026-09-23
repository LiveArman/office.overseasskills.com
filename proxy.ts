import { NextRequest, NextResponse } from 'next/server'
import { readSession, COOKIE_NAME } from '@/src/lib/auth'

export function proxy(request: NextRequest) {
  const session = readSession(request.cookies.get(COOKIE_NAME)?.value)
  if (!session) return NextResponse.redirect(new URL('/', request.url))
  return NextResponse.next()
}

export const config = { matcher: ['/dashboard/:path*'] }
