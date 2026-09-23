import { createHmac, timingSafeEqual } from 'node:crypto'

const COOKIE_NAME = 'office_session'
const SESSION_TTL_SECONDS = 60 * 60 * 8

type Session = { userId: number; email: string; name: string; role: string; exp: number }

function signature(payload: string) {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET is not configured')
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

export function createSession(session: Omit<Session, 'exp'>) {
  const payload = Buffer.from(JSON.stringify({ ...session, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS })).toString('base64url')
  return `${payload}.${signature(payload)}`
}

export function readSession(value?: string | null): Session | null {
  if (!value) return null
  const [payload, provided] = value.split('.')
  if (!payload || !provided) return null
  const expected = signature(payload)
  if (provided.length !== expected.length || !timingSafeEqual(Buffer.from(provided), Buffer.from(expected))) return null
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString()) as Session
    return session.exp > Math.floor(Date.now() / 1000) ? session : null
  } catch { return null }
}

export { COOKIE_NAME, SESSION_TTL_SECONDS }
