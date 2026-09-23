'use client'

import { FormEvent, useState } from 'react'
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true); setError('')
    const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
    const result = await response.json() as { error?: string }
    if (!response.ok) { setError(result.error ?? 'Sign in failed.'); setPending(false); return }
    window.location.href = '/dashboard'
  }

  return <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 py-10 text-slate-100"><section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.06] p-7 shadow-2xl backdrop-blur sm:p-10"><div className="mb-10 flex items-center gap-3"><div className="flex size-12 items-center justify-center rounded-2xl bg-teal-400 font-black text-slate-950">OS</div><div><p className="font-bold">Office</p><p className="text-sm text-slate-400">Overseas Skills</p></div></div><div className="mb-8"><div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-teal-400/10 text-teal-300"><ShieldCheck /></div><h1 className="text-3xl font-bold tracking-tight">Welcome back</h1><p className="mt-2 text-sm text-slate-400">Sign in to manage your operations dashboard.</p></div><form onSubmit={submit} className="flex flex-col gap-5"><label className="flex flex-col gap-2 text-sm font-medium">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-base outline-none ring-teal-400 placeholder:text-slate-600 focus:ring-2" placeholder="admin@example.com" /></label><label className="flex flex-col gap-2 text-sm font-medium">Password<div className="relative"><LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" /><input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-900 py-3 pl-11 pr-4 text-base outline-none ring-teal-400 placeholder:text-slate-600 focus:ring-2" placeholder="Your password" /></div></label>{error && <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p>}<button disabled={pending} className="flex items-center justify-center gap-2 rounded-xl bg-teal-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-teal-300 disabled:cursor-wait disabled:opacity-60">{pending ? 'Signing in…' : 'Sign in'}{!pending && <ArrowRight />}</button></form><p className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500"><Mail /> Use the administrator account created in the SQL seed.</p></section></main>
}
