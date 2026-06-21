'use client'

import { useEffect, type ReactNode } from 'react'
import MotionPage from '@/components/kautilya/MotionPage'
import { trackEvent } from '@/lib/kautilya/events'

export default function LandingMotion({ children }: { children: ReactNode }) {
  useEffect(() => {
    trackEvent('kautilya_landing_viewed')
  }, [])

  return <MotionPage>{children}</MotionPage>
}
