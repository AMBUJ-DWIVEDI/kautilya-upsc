import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DailyLogForm from './DailyLogForm'

function isoDate(offsetDays = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

export default async function DailyLogPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = isoDate(0)
  const { data: logs } = await supabase
    .from('daily_logs')
    .select('log_date, study_hours, mood, energy, mission_completed, biggest_leak, tomorrow_correction, streak_day')
    .eq('user_id', user.id)
    .order('log_date', { ascending: false })
    .limit(10)

  const todayLog = (logs ?? []).find(l => l.log_date === today) ?? null
  const recent = (logs ?? []).filter(l => l.log_date !== today).slice(0, 7)
  const prior = (logs ?? []).find(l => l.log_date === isoDate(-1))
  const initialStreak = todayLog?.streak_day ?? ((prior?.streak_day ?? 0) + 1)

  return (
    <div className="flex-1 bg-parchment px-4 py-8 text-slate900 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-copper">Daily Log</p>
          <h1 className="heading-cinzel mt-1 text-3xl font-black leading-tight text-indigo sm:text-4xl">
            Two minutes. Then the long war holds.
          </h1>
          <p className="mt-2 text-sm leading-6 text-inkdim">
            The log is how KAUTILYA reads your real pattern — and how one missed day stops becoming a missed week.
          </p>
        </header>

        <DailyLogForm today={todayLog} initialStreak={initialStreak} />

        {recent.length > 0 && (
          <section className="mt-8">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-copper">Last 7 entries</p>
            <div className="card-calm overflow-hidden">
              {recent.map((l, i) => (
                <div key={l.log_date} className={`flex items-center justify-between gap-3 px-4 py-3 text-sm ${i > 0 ? 'border-t border-linen' : ''}`}>
                  <span className="font-mono text-xs text-inkdim">
                    {new Date(l.log_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                  <span className="flex-1 truncate text-inkdim">
                    {l.study_hours ?? 0}h{l.biggest_leak ? ` · ${l.biggest_leak}` : ''}
                  </span>
                  <span className={`shrink-0 text-xs font-bold ${l.mission_completed ? 'text-sage' : 'text-inkdim/40'}`}>
                    {l.mission_completed ? '✓ sealed' : '—'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
