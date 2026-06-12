'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

/**
 * Mobile-only bottom CTA bar for the landing page.
 * Appears after the user scrolls past the hero so the conversion
 * action stays in the thumb zone for the whole page.
 */
export default function StickyCTA() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-8 pointer-events-none sm:hidden"
      style={{ background: 'linear-gradient(0deg, rgba(8,10,15,0.97) 55%, transparent)' }}
    >
      <Link
        href="/login"
        className="pointer-events-auto block w-full rounded bg-chanakya-gold py-3.5 text-center text-sm font-bold text-chanakya-bg transition-colors hover:bg-chanakya-gold-light"
      >
        START FREE DIAGNOSIS
      </Link>
    </div>
  )
}
