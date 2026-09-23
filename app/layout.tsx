import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = { title: 'Office | Overseas Skills', description: 'Franchise and training-center management for Overseas Skills' }
export const viewport = { themeColor: '#173b67', width: 'device-width', initialScale: 1, userScalable: false }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html> }
