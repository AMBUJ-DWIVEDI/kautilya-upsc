// ============================================================
// KAUTILYA UPSC — Daily Command generation (server-side)
// Generated on first visit of the day (idempotent via UNIQUE
// (user_id, command_date)); a Supabase cron can pre-warm it.
// The dashboard never asks what to study. It tells.
// ============================================================

import type { SupabaseClient } from '@supabase/supabase-js'
import { mainsPromptForDate } from './mains-pool'
import type { CommandThread, DailyCommandRow } from './types'

interface NotePick {
  id: string
  slug: string
  section: string
  topic: string
}

function noteHref(n: NotePick): string {
  return `/notes/${n.section}/${n.slug}`
}

export function todayDateString(d: Date = new Date()): string {
  // KAUTILYA-DECISION: command days run on IST — the aspirant's clock, not the server's.
  const ist = new Date(d.getTime() + 5.5 * 3600_000)
  return ist.toISOString().slice(0, 10)
}

async function pickNotes(supabase: SupabaseClient, userId: string): Promise<{ revision: NotePick | null; issue: NotePick | null }> {
  // Weak topics from the latest attempt steer the revision thread.
  const { data: attempt } = await supabase
    .from('test_attempts')
    .select('weak_topics')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const weakTopics: string[] = Array.isArray(attempt?.weak_topics)
    ? (attempt.weak_topics as { topic?: string }[]).map(w => w.topic ?? '').filter(Boolean)
    : []

  const { data: notes } = await supabase
    .from('smart_notes')
    .select('id, slug, section, topic')
    .eq('status', 'published')
    .limit(40)

  const pool = (notes ?? []) as NotePick[]
  if (pool.length === 0) return { revision: null, issue: null }

  const weakMatch = pool.find(n => weakTopics.some(w => n.topic.toLowerCase().includes(w.toLowerCase()) || w.toLowerCase().includes(n.topic.toLowerCase())))
  const revision = weakMatch ?? pool[0]
  const issue = pool.find(n => n.id !== revision.id) ?? revision
  return { revision, issue }
}

function buildThreads(
  revision: NotePick | null,
  issue: NotePick | null,
  date: Date,
  reentry: boolean,
): CommandThread[] {
  const mains = mainsPromptForDate(date)

  if (reentry) {
    // Lighter by design. Recovery design is retention design.
    return [
      {
        id: 't1',
        type: 'prelims_revision',
        title: revision ? `Re-enter through ${revision.topic}` : 'Re-enter through one revision block',
        target: '25 min',
        href: revision ? noteHref(revision) : '/notes',
        note_ids: revision ? [revision.id] : [],
        locked: false,
      },
      {
        id: 't2',
        type: 'current_issue',
        title: issue ? `One issue, read to depth: ${issue.topic}` : 'One issue, read to depth',
        target: '1 topic',
        href: issue ? `${noteHref(issue)}#issue-story` : '/notes',
        note_ids: issue ? [issue.id] : [],
        locked: false,
      },
      {
        id: 't3',
        type: 'recall_test',
        title: 'Five recall cards. Just five.',
        target: '5 cards',
        href: '/notes?mode=revision',
        note_ids: [],
        locked: false,
      },
      {
        id: 't5',
        type: 'optional_locked',
        title: 'Optional subject',
        target: 'Unlocks later',
        note_ids: [],
        locked: true,
      },
    ]
  }

  return [
    {
      id: 't1',
      type: 'prelims_revision',
      title: revision ? `Prelims revision — ${revision.topic}` : 'Prelims revision — your weakest standing topic',
      target: '45 min',
      href: revision ? noteHref(revision) : '/notes',
      note_ids: revision ? [revision.id] : [],
      locked: false,
    },
    {
      id: 't2',
      type: 'mains_answer',
      title: 'Mains answer — one question, written by hand',
      target: '1 question',
      detail: JSON.stringify(mains),
      locked: false,
      note_ids: [],
    },
    {
      id: 't3',
      type: 'current_issue',
      title: issue ? `Current issue — ${issue.topic}` : 'Current issue — one topic to depth',
      target: '1 topic',
      href: issue ? `${noteHref(issue)}#issue-story` : '/notes',
      note_ids: issue ? [issue.id] : [],
      locked: false,
    },
    {
      id: 't4',
      type: 'recall_test',
      title: 'Recall test — spaced cards from what you have read',
      target: '10 cards',
      href: '/notes?mode=revision',
      note_ids: [],
      locked: false,
    },
    {
      id: 't5',
      type: 'optional_locked',
      title: 'Optional subject',
      target: 'Unlocks later',
      note_ids: [],
      locked: true,
    },
  ]
}

/**
 * Get-or-create today's command. Idempotent: the UNIQUE(user_id, command_date)
 * constraint makes concurrent first-visits collapse to one row.
 */
export async function getOrCreateTodayCommand(
  supabase: SupabaseClient,
  userId: string,
): Promise<DailyCommandRow | null> {
  const today = todayDateString()

  const { data: existing } = await supabase
    .from('daily_commands')
    .select('*')
    .eq('user_id', userId)
    .eq('command_date', today)
    .maybeSingle()

  if (existing) return existing as DailyCommandRow

  // Missed-day detection: the most recent command before today, unsealed or
  // older than yesterday, means the chain broke. Tomorrow never shames; it lightens.
  const { data: last } = await supabase
    .from('daily_commands')
    .select('command_date, sealed')
    .eq('user_id', userId)
    .lt('command_date', today)
    .order('command_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  const yesterday = todayDateString(new Date(Date.now() - 86_400_000))
  const isReentry = !!last && (!last.sealed || (last.command_date as string) < yesterday)

  const { revision, issue } = await pickNotes(supabase, userId)
  const threads = buildThreads(revision, issue, new Date(), isReentry)

  const { data: created, error } = await supabase
    .from('daily_commands')
    .insert({
      user_id: userId,
      command_date: today,
      threads,
      completed: [],
      sealed: false,
      is_reentry: isReentry,
    })
    .select('*')
    .single()

  if (error) {
    // Unique-violation race: another request created it first — read it back.
    const { data: raced } = await supabase
      .from('daily_commands')
      .select('*')
      .eq('user_id', userId)
      .eq('command_date', today)
      .maybeSingle()
    return (raced as DailyCommandRow) ?? null
  }

  return created as DailyCommandRow
}
