import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateTodayCommand, todayDateString } from '@/lib/command/generate'
import { randomSealedInsight } from '@/lib/voice'
import type { CommandThread, DailyCommandRow } from '@/lib/command/types'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const command = await getOrCreateTodayCommand(supabase, user.id)
  if (!command) return NextResponse.json({ error: 'Could not draw up the command' }, { status: 500 })
  return NextResponse.json({ command })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { thread_id?: string }
  if (!body.thread_id) return NextResponse.json({ error: 'thread_id required' }, { status: 400 })

  const today = todayDateString()
  const { data: row } = await supabase
    .from('daily_commands')
    .select('*')
    .eq('user_id', user.id)
    .eq('command_date', today)
    .maybeSingle()

  if (!row) return NextResponse.json({ error: 'No command for today yet' }, { status: 404 })

  const command = row as DailyCommandRow
  const threads = command.threads as CommandThread[]
  const validIds = threads.filter(t => !t.locked).map(t => t.id)
  if (!validIds.includes(body.thread_id)) {
    return NextResponse.json({ error: 'Unknown or locked thread' }, { status: 400 })
  }

  const completed = Array.from(new Set([...(command.completed ?? []), body.thread_id]))
  const sealed = validIds.every(id => completed.includes(id))
  const insight = sealed && !command.sealed ? randomSealedInsight() : command.insight

  const { data: updated, error } = await supabase
    .from('daily_commands')
    .update({ completed, sealed, insight })
    .eq('id', command.id)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (error || !updated) {
    return NextResponse.json({ error: 'Failed to record the thread' }, { status: 500 })
  }

  return NextResponse.json({ command: updated })
}
