import { NextResponse } from 'next/server'
import { query } from '@/src/lib/db/mysql'
import { readSession, COOKIE_NAME } from '@/src/lib/auth'
import { cookies } from 'next/headers'
import type { RowDataPacket } from 'mysql2/promise'

type SummaryRow = RowDataPacket & { sales: number | string; completedOrders: number; activeCenters: number; pendingPayouts: number | string }
type TrendRow = RowDataPacket & { month: string; sales: number | string }
type CenterRow = RowDataPacket & { code: string; name: string; location: string | null; sales: number | string; orders: number; status: string }
type OrderRow = RowDataPacket & { id: number; student_name: string; center: string; total: number | string; status: string }

const empty = { sales: 0, completedOrders: 0, activeCenters: 0, pendingPayouts: 0, trend: [], centers: [], orders: [], configured: false }
const money = (value: number | string | null | undefined) => Number(value || 0)

export async function GET() {
  const session = readSession((await cookies()).get(COOKIE_NAME)?.value)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const [summary] = await query<SummaryRow[]>(`SELECT COALESCE((SELECT SUM(total) FROM orders WHERE status IN ('completed','processing')),0) sales, COALESCE((SELECT COUNT(*) FROM orders WHERE status='completed'),0) completedOrders, COALESCE((SELECT COUNT(*) FROM franchises WHERE status='active'),0) activeCenters, COALESCE((SELECT SUM(amount) FROM payouts WHERE status IN ('report_generated','requested','processing')),0) pendingPayouts`)
    const trend = await query<TrendRow[]>(`SELECT DATE_FORMAT(created_at, '%b') month, SUM(total) sales FROM orders WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH) AND status <> 'cancelled' GROUP BY YEAR(created_at), MONTH(created_at), DATE_FORMAT(created_at, '%b') ORDER BY YEAR(created_at), MONTH(created_at)`)
    const centers = await query<CenterRow[]>(`SELECT f.code, f.name, CONCAT(COALESCE(l.district,''), IF(l.district IS NULL,'',', '), COALESCE(l.division,'')) location, COALESCE(SUM(CASE WHEN o.status <> 'cancelled' THEN o.total ELSE 0 END),0) sales, COUNT(o.id) orders, f.status FROM franchises f LEFT JOIN locations l ON l.id=f.location_id LEFT JOIN orders o ON o.franchise_id=f.id GROUP BY f.id ORDER BY sales DESC LIMIT 5`)
    const orders = await query<OrderRow[]>(`SELECT o.id, o.student_name, COALESCE(f.name,'Unassigned') center, o.total, o.status FROM orders o LEFT JOIN franchises f ON f.id=o.franchise_id ORDER BY o.created_at DESC LIMIT 5`)
    return NextResponse.json({ data: { sales: money(summary?.sales), completedOrders: Number(summary?.completedOrders || 0), activeCenters: Number(summary?.activeCenters || 0), pendingPayouts: money(summary?.pendingPayouts), trend: trend.map(row => ({ month: row.month, sales: money(row.sales) })), centers, orders: orders.map(row => ({ id: `#OS-${row.id}`, student: row.student_name, center: row.center, amount: money(row.total), status: row.status })), configured: true } })
  } catch (error) {
    console.error('[v0] Dashboard database read failed:', error)
    return NextResponse.json({ data: empty, warning: 'Database data is not available.' })
  }
}
