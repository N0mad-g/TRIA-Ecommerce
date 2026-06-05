import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TRIA - Ciência para reconstruir sua identidade',
  description: 'Premium e-commerce platform for hair treatment protocols',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-900 text-slate-100">{children}</body>
    </html>
  )
}
