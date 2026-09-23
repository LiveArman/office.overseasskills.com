import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = { title: 'Office | Overseas Skills', description: 'Franchise and training-center management for Overseas Skills' }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html> }
