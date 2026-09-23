import { NextResponse } from 'next/server'
import { createHash } from 'node:crypto'
import type { RowDataPacket } from 'mysql2/promise'
import { query } from '@/src/lib/db/mysql'
import { createSession, COOKIE_NAME, SESSION_TTL_SECONDS } from '@/src/lib/auth'

type UserRow = RowDataPacket & { id: number; email: string; name: string; password_hash: string; status: string; role: string }

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: string; password?: string }
    const email = body.email?.trim().toLowerCase()
    const password = body.password ?? ''
    if (!email || !password) return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    const users = await query<UserRow[]>(`SELECT u.id, u.email, u.name, u.password_hash, u.status, r.slug AS role FROM users u JOIN roles r ON r.id = u.role_id WHERE u.email = ? LIMIT 1`, [email])
    const user = users[0]
    const candidate = createHash('sha256').update(`${password}:${email}`).digest('hex')
    if (!user || user.status !== 'active' || user.password_hash !== candidate) return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    const response = NextResponse.json({ ok: true })
    response.cookies.set(COOKIE_NAME, createSession({ userId: user.id, email: user.email, name: user.name, role: user.role }), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: SESSION_TTL_SECONDS, path: '/' })
    return response
  } catch (error) {
    console.error('[v0] Login database error:', error)
    return NextResponse.json({ error: 'Unable to connect to the database. Check the database import and environment variables.' }, { status: 503 })
  }
}
