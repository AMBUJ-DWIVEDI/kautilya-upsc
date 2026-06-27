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
  | 'kautilya_command_page_viewed'
  | 'kautilya_command_generated'
  | 'kautilya_weekly_command_sealed'
  | 'kautilya_daily_command_completed'
  | 'kautilya_source_reduction_command_viewed'
  | 'kautilya_mains_command_viewed'
  | 'kautilya_prelims_command_viewed'
  | 'kautilya_command_review_submitted'
  | 'kautilya_data_load_failed'
  | 'kautilya_waitlist_joined'
  | 'kautilya_profile_viewed'
  | 'kautilya_profile_offer_clicked'
  | 'kautilya_anchor_viewed'
  | 'kautilya_anchor_saved'
  | 'kautilya_leaderboard_viewed'
  | 'kautilya_leaderboard_period_changed'
  | 'kautilya_forum_thread_created'
  | 'kautilya_forum_reply_created'
  | 'kautilya_forum_content_reported'
  | 'kautilya_forum_content_deleted'
  | 'kautilya_forum_content_moderated'

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
