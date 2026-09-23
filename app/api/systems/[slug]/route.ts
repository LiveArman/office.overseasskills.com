import { NextResponse } from 'next/server'
import type { RowDataPacket } from 'mysql2/promise'
import { query, transaction } from '@/src/lib/db/mysql'
import { cookies } from 'next/headers'
import { COOKIE_NAME, readSession } from '@/src/lib/auth'

type TableConfig = { table: string; columns: string; editable: string[]; required: string[] }
const tables: Record<string, TableConfig> = {
  franchises: { table: 'franchises', columns: 'id, code, name, status, phone, email', editable: ['code', 'name', 'status', 'phone', 'email'], required: ['code', 'name'] },
  students: { table: 'users', columns: 'id, name, email, phone, status', editable: ['name', 'email', 'phone', 'status'], required: ['name', 'email'] },
  orders: { table: 'orders', columns: 'id, wordpress_order_id, student_name, status, total, placed_at', editable: ['status', 'total', 'student_name'], required: ['student_name', 'total'] },
  payouts: { table: 'payouts', columns: 'id, franchise_id, period_start, period_end, amount, status', editable: ['status', 'amount', 'payment_reference'], required: ['franchise_id', 'period_start', 'period_end', 'amount'] },
  reports: { table: 'activity_logs', columns: 'id, action, entity_type, created_at', editable: [], required: [] },
  settings: { table: 'settings', columns: 'setting_key, setting_value, is_secret, updated_at', editable: ['setting_key', 'setting_value', 'is_secret'], required: ['setting_key', 'setting_value'] },
}

async function admin() {
  const session = readSession((await cookies()).get(COOKIE_NAME)?.value)
  return session && ['admin', 'super_admin'].includes(session.role) ? session : null
}
function config(slug: string) { return tables[slug] }
function bodyValues(input: Record<string, unknown>, fields: string[]) { return fields.reduce<Record<string, unknown>>((result, field) => { if (input[field] !== undefined) result[field] = input[field]; return result }, {}) }

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await admin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { slug } = await params; const table = config(slug)
  if (!table) return NextResponse.json({ configured: false, count: 0, rows: [] }, { status: 404 })
  try { const rows = await query<(Record<string, unknown> & RowDataPacket)[]>(`SELECT ${table.columns} FROM ${table.table} ORDER BY 1 DESC LIMIT 100`); return NextResponse.json({ configured: true, count: rows.length, rows }) }
  catch (error) { console.error('[v0] System read failed:', error); return NextResponse.json({ configured: false, count: 0, rows: [] }) }
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await admin(); if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { slug } = await params; const table = config(slug); if (!table || !table.editable.length) return NextResponse.json({ error: 'This system is read-only' }, { status: 400 })
  const input = await request.json() as Record<string, unknown>; const values = bodyValues(input, table.editable)
  if (table.required.some(field => values[field] === undefined || values[field] === '')) return NextResponse.json({ error: 'Required fields are missing' }, { status: 422 })
  try { const fields = Object.keys(values); const result = await query<RowDataPacket[]>(`INSERT INTO ${table.table} (${fields.join(',')}) VALUES (${fields.map(() => '?').join(',')})`, fields.map(field => values[field])); return NextResponse.json({ id: (result as unknown as { insertId: number }).insertId }, { status: 201 }) }
  catch (error) { console.error('[v0] System create failed:', error); return NextResponse.json({ error: 'Could not create record' }, { status: 400 }) }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await admin(); if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { slug } = await params; const table = config(slug); if (!table || !table.editable.length) return NextResponse.json({ error: 'This system is read-only' }, { status: 400 })
  const input = await request.json() as Record<string, unknown>; const id = input.id; const values = bodyValues(input, table.editable); const fields = Object.keys(values)
  if (!id || !fields.length) return NextResponse.json({ error: 'Record and changes are required' }, { status: 422 })
  try { await query(`UPDATE ${table.table} SET ${fields.map(field => `${field} = ?`).join(', ')} WHERE id = ?`, [...fields.map(field => values[field]), id] as unknown as []); return NextResponse.json({ ok: true }) }
  catch (error) { console.error('[v0] System update failed:', error); return NextResponse.json({ error: 'Could not update record' }, { status: 400 }) }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await admin(); if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { slug } = await params; const table = config(slug); if (!table || !table.editable.length) return NextResponse.json({ error: 'This system is read-only' }, { status: 400 })
  const { id } = await request.json() as { id?: number }; if (!id) return NextResponse.json({ error: 'Record is required' }, { status: 422 })
  try { await transaction(async connection => { await connection.execute(`DELETE FROM ${table.table} WHERE id = ?`, [id]) }); return NextResponse.json({ ok: true }) }
  catch (error) { console.error('[v0] System delete failed:', error); return NextResponse.json({ error: 'Could not delete record. It may be referenced by another record.' }, { status: 409 }) }
}
