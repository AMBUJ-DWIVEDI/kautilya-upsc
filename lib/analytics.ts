'use client'

import posthog from 'posthog-js'

/**
 * Thin wrapper around PostHog. Every function is a safe no-op when
 * NEXT_PUBLIC_POSTHOG_KEY is unset, so dev and preview builds work
 * without analytics configured.
 */

const KEY  = process.env.NEXT_PUBLIC_POSTHOG_KEY
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'

let initialized = false

export function initAnalytics() {
  if (initialized || !KEY || typeof window === 'undefined') return
  posthog.init(KEY, {
    api_host: HOST,
    capture_pageview: false, // App Router: pageviews fired manually on route change
    persistence: 'localStorage+cookie',
  })
  initialized = true
}

export function trackPageview() {
  if (!initialized) return
  posthog.capture('$pageview')
}

export function track(event: string, props?: Record<string, unknown>) {
  if (!initialized) return
  posthog.capture(event, props)
}

export function identify(userId: string, props?: Record<string, unknown>) {
  if (!initialized) return
  posthog.identify(userId, props)
}
