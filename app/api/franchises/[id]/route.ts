import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { query } from '@/src/lib/db/mysql'
import { COOKIE_NAME, readSession } from '@/src/lib/auth'

type Params = { params: Promise<{ id: string }> }
async function authorized() { const session = readSession((await cookies()).get(COOKIE_NAME)?.value); return session && ['admin', 'super_admin'].includes(session.role) }

export async function GET(_request: Request, { params }: Params) {
  if (!(await authorized())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    const [centers, staff, orders, payouts] = await Promise.all([
      query(`SELECT f.*, l.division, l.district, l.upazila, COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total ELSE 0 END), 0) AS sales, COUNT(o.id) AS order_count FROM franchises f LEFT JOIN locations l ON l.id = f.location_id LEFT JOIN orders o ON o.franchise_id = f.id WHERE f.id = ? OR f.code = ? GROUP BY f.id, l.division, l.district, l.upazila`, [id, id]),
      query(`SELECT u.id, u.name, u.email, u.phone, u.status, r.name AS role_name, u.last_login_at FROM users u JOIN roles r ON r.id = u.role_id WHERE u.franchise_id = ? ORDER BY u.created_at DESC`, [id]),
      query(`SELECT id, wordpress_order_id, student_name, status, total, attribution, placed_at FROM orders WHERE franchise_id = (SELECT id FROM franchises WHERE id = ? OR code = ? LIMIT 1) ORDER BY placed_at DESC LIMIT 20`, [id, id]),
      query(`SELECT id, period_start, period_end, amount, status, payment_reference, paid_at FROM payouts WHERE franchise_id = (SELECT id FROM franchises WHERE id = ? OR code = ? LIMIT 1) ORDER BY period_end DESC LIMIT 12`, [id, id]),
    ])
    if (!centers.length) return NextResponse.json({ error: 'Center not found' }, { status: 404 })
    return NextResponse.json({ center: centers[0], staff, orders, payouts })
  } catch (error) { console.error('[v0] Franchise detail failed:', error); return NextResponse.json({ error: 'Database data is not available' }, { status: 503 }) }
}

export async function PATCH(request: Request, { params }: Params) {
  if (!(await authorized())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params; const body = await request.json() as Record<string, unknown>
  const allowed = ['name', 'phone', 'email', 'address', 'status', 'direct_rate', 'territory_rate']
  const values = allowed.filter(key => body[key] !== undefined)
  if (!values.length) return NextResponse.json({ error: 'No changes supplied' }, { status: 422 })
  try { await query(`UPDATE franchises SET ${values.map(key => `${key} = ?`).join(', ')} WHERE id = ? OR code = ?`, [...values.map(key => body[key]), id, id]); return NextResponse.json({ ok: true }) }
  catch (error) { console.error('[v0] Franchise update failed:', error); return NextResponse.json({ error: 'Could not update center' }, { status: 400 }) }
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await authorized())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try { await query(`UPDATE franchises SET status = 'archived' WHERE id = ? OR code = ?`, [id, id]); return NextResponse.json({ ok: true }) }
  catch (error) { console.error('[v0] Franchise archive failed:', error); return NextResponse.json({ error: 'Could not archive center' }, { status: 409 }) }
}
