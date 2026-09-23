'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const labels: Record<string, string> = { franchises: 'Franchises', students: 'Students', orders: 'Orders', payouts: 'Payouts', reports: 'Reports', settings: 'Settings' }

type SystemData = { configured: boolean; count: number; rows: Record<string, unknown>[] }

export default function SystemPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState('')
  const [data, setData] = useState<SystemData>({ configured: false, count: 0, rows: [] })
  useEffect(() => { params.then(({ slug: value }) => { setSlug(value); fetch(`/api/systems/${value}`).then(response => response.json()).then(setData).catch(() => setData({ configured: false, count: 0, rows: [] })) }) }, [params])
  const title = labels[slug] ?? 'System'
  return <main className="min-h-screen bg-[#f6f8fb] p-4 text-slate-900 sm:p-8"><div className="mx-auto max-w-6xl"><Link href="/dashboard" className="text-sm font-medium text-[#173b67]">← Back to Dashboard</Link><div className="mb-6 mt-6"><p className="text-sm text-slate-500">Office By Overseas Skills</p><h1 className="text-3xl font-bold">{title}</h1><p className="mt-1 text-slate-500">Database-backed {title.toLowerCase()} management.</p></div><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 pb-4"><div><h2 className="font-semibold">{title} records</h2><p className="text-sm text-slate-500">{data.configured ? `${data.count} records found` : 'Database connection is not configured'}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">{data.configured ? 'Connected' : 'Data Not Found'}</span></div>{data.rows.length ? <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b text-slate-500">{Object.keys(data.rows[0]).map(key => <th key={key} className="px-3 py-3 font-medium">{key}</th>)}</tr></thead><tbody>{data.rows.map((row, index) => <tr key={index} className="border-b last:border-0">{Object.values(row).map((value, cell) => <td key={cell} className="px-3 py-3">{String(value ?? 'Data Not Found')}</td>)}</tr>)}</tbody></table></div> : <div className="flex min-h-40 items-center justify-center text-sm text-slate-400">{title}: Data Not Found</div>}</section></div></main>
}


