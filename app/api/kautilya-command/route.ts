import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const commandMutation = z.object({
  action: z.enum(['seal', 'review']),
  command: z.object({
    type: z.string(),
    title: z.string(),
    seenText: z.string(),
    longWarSignal: z.string(),
    primaryLeak: z.string(),
    command: z.string(),
    doMore: z.array(z.string()),
    doLess: z.array(z.string()),
    focusAreas: z.record(z.string(), z.string()),
    avoidToday: z.string().optional(),
    whyThisMatters: z.string(),
    window: z.enum(['today', 'this_week']),
  }),
  review: z.object({
    tomorrowFirstMove: z.string().trim().min(2).max(500),
    whatMoved: z.string().trim().max(1000).optional(),
    whatLeaked: z.string().trim().max(1000).optional(),
  }).optional(),
}).strict()

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const parsed = commandMutation.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid command update' }, { status: 400 })
  const item = parsed.data.command
  const { data: saved, error } = await supabase.from('kautilya_commands').insert({
    user_id: user.id, command_type: item.type, status: parsed.data.action === 'seal' ? 'sealed' : 'active',
    title: item.title, seen_text: item.seenText, long_war_signal: item.longWarSignal,
    primary_leak: item.primaryLeak, command: item.command, do_more: item.doMore, do_less: item.doLess,
    focus_areas: item.focusAreas, avoid_today: item.avoidToday, why_this_matters: item.whyThisMatters,
    command_window: item.window, sealed_at: parsed.data.action === 'seal' ? new Date().toISOString() : null,
  }).select('id').single()
  if (error) return NextResponse.json({ error: 'Command could not be saved' }, { status: 503 })
  if (parsed.data.action === 'review' && parsed.data.review) {
    await supabase.from('kautilya_command_reviews').insert({
      user_id: user.id, command_id: saved.id, tomorrow_first_move: parsed.data.review.tomorrowFirstMove,
      what_moved: parsed.data.review.whatMoved, what_leaked: parsed.data.review.whatLeaked,
    })
  }
  return NextResponse.json({ id: saved.id })
}
