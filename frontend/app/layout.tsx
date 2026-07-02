import type { Metadata } from 'next'
import { Space_Grotesk, Instrument_Sans } from 'next/font/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
})

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Squadfy Studio',
  description: 'Tech Lead squad management dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body
        className={`${spaceGrotesk.variable} ${instrumentSans.variable} bg-ink-50 font-sans text-ink-900 antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
