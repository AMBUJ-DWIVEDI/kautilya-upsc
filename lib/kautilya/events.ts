'use client'

import { track } from '@/lib/analytics'

export type KautilyaEvent =
  | 'kautilya_landing_viewed'
  | 'kautilya_diagnosis_started'
  | 'kautilya_diagnosis_completed'
  | 'kautilya_long_war_report_viewed'
  | 'kautilya_resource_audit_started'
  | 'kautilya_resource_map_viewed'
  | 'kautilya_source_parked'
  | 'kautilya_smart_note_opened'
  | 'kautilya_smart_note_repaired'
  | 'kautilya_answer_repair_started'
  | 'kautilya_weekly_command_sealed'
  | 'kautilya_data_load_failed'
  | 'kautilya_waitlist_joined'

/**
 * Analytics wrapper — forwards to PostHog when configured,
 * always logs in development for inspection.
 */
export function trackEvent(event: KautilyaEvent, props?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'development') {
    console.info(`[kautilya] ${event}`, props ?? {})
  }
  track(event, props)
}
