'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'
import { initAnalytics, trackPageview, identify } from '@/lib/analytics'
import { createClient } from '@/lib/supabase/client'

const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID

/**
 * Mounts once in the root layout. Initializes PostHog, fires a pageview on
 * every route change, identifies the logged-in user, and injects the
 * Microsoft Clarity tag. Renders nothing when the respective keys are unset.
 */
export default function AnalyticsProvider() {
  const pathname = usePathname()

  useEffect(() => {
    initAnalytics()
  }, [])

  useEffect(() => {
    trackPageview()
  }, [pathname])

  useEffect(() => {
    try {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) identify(user.id, { email: user.email })
      })
    } catch {
      // Supabase env not configured — skip identify, analytics still works anonymously
    }
  }, [])

  if (!CLARITY_ID) return null

  return (
    <Script id="ms-clarity" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");`}
    </Script>
  )
}
