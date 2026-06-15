import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

function isoDate(offsetDays = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await request.json() as {
    study_hours?: number
    mood?: number
    energy?: number
    mission_completed?: boolean
    biggest_leak?: string
    tomorrow_correction?: string
  }

  const today = isoDate(0)
  const yesterday = isoDate(-1)

  const [{ data: existing }, { data: prior }] = await Promise.all([
    supabase.from('daily_logs').select('id, streak_day').eq('user_id', user.id).eq('log_date', today).maybeSingle(),
    supabase.from('daily_logs').select('streak_day').eq('user_id', user.id).eq('log_date', yesterday).maybeSingle(),
  ])

  const streak = existing?.streak_day ?? ((prior?.streak_day ?? 0) + 1)

  const row = {
    user_id: user.id,
    log_date: today,
    study_hours: Number.isFinite(Number(body.study_hours)) ? Number(body.study_hours) : 0,
    mood: body.mood ?? null,
    energy: body.energy ?? null,
    mission_completed: !!body.mission_completed,
    biggest_leak: body.biggest_leak?.trim() || null,
    tomorrow_correction: body.tomorrow_correction?.trim() || null,
    streak_day: streak,
  }

  const { error } = existing
    ? await supabase.from('daily_logs').update(row).eq('id', existing.id)
    : await supabase.from('daily_logs').insert(row)

  if (error) {
    console.error('daily-log save failed:', error)
    return NextResponse.json({ error: 'Could not save your log. Try again.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, streak })
}
