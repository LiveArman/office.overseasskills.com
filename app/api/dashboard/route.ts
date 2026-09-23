import { NextResponse } from 'next/server'
import type { DashboardSummary } from '@/src/lib/domain/types'
export async function GET(){const summary:DashboardSummary={sales:728450,completedOrders:184,activeCenters:26,pendingPayouts:184200};return NextResponse.json({data:summary})}
