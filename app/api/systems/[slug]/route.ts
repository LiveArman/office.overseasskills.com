import { NextResponse } from 'next/server'
import type { RowDataPacket } from 'mysql2/promise'
import { query } from '@/src/lib/db/mysql'

const tables: Record<string, { table: string; columns: string }> = {
  franchises: { table: 'franchises', columns: 'code, name, status, phone' },
  students: { table: 'users', columns: 'name, email, phone, status' },
  orders: { table: 'orders', columns: 'wordpress_order_id, student_name, status, total, placed_at' },
  payouts: { table: 'payouts', columns: 'franchise_id, period_start, period_end, amount, status' },
  reports: { table: 'activity_logs', columns: 'action, entity_type, created_at' },
  settings: { table: 'settings', columns: 'setting_key, setting_value, updated_at' },
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const config = tables[slug]
  if (!config) return NextResponse.json({ configured: false, count: 0, rows: [] }, { status: 404 })
  try {
    const rows = await query<(Record<string, unknown> & RowDataPacket)[]>(`SELECT ${config.columns} FROM ${config.table} ORDER BY 1 DESC LIMIT 50`)
    return NextResponse.json({ configured: true, count: rows.length, rows })
  } catch {
    return NextResponse.json({ configured: false, count: 0, rows: [] })
  }
}
