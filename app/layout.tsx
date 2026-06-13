import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Cinzel, Inter, JetBrains_Mono, Source_Serif_4 } from 'next/font/google'
import AnalyticsProvider from '@/components/AnalyticsProvider'
import { APP } from '@/lib/config'
import './globals.css'

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-source-serif',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(APP.url),
  title: 'KAUTILYA UPSC — Knowledge is not enough. Judgement selects.',
  description:
    'The UPSC CSE command system that diagnoses how you prepare, integrates your sources, and tells you exactly what to do next.',
  keywords: ['UPSC CSE', 'IAS preparation', 'KAUTILYA', 'prelims mock', 'mains answer writing', 'UPSC strategy'],
  openGraph: {
    title: 'KAUTILYA UPSC — Judgement selects.',
    description: 'Diagnosis first. One command a day. Recovery over streaks. Your UPSC command system.',
    type: 'website',
    url: APP.url,
    images: [{ url: '/kautilya-ias-logo.jpg', width: 440, height: 582, alt: 'KAUTILYA IAS logo' }],
  },
  twitter: {
    card: 'summary',
    title: 'KAUTILYA UPSC — Knowledge is not enough. Judgement selects.',
    description: 'The UPSC system that studies you before it teaches you.',
    images: ['/kautilya-ias-mark.png'],
  },
  icons: {
    icon: '/kautilya-ias-mark.png',
    apple: '/kautilya-ias-mark.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${cinzel.variable} ${inter.variable} ${sourceSerif.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-parchment text-slate900">
        {children}
        <AnalyticsProvider />
      </body>
    </html>
  )
}
