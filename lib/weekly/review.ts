import type { SupabaseClient } from '@supabase/supabase-js'

export interface WeeklyReviewRow {
  id: string
  user_id: string
  week_start: string
  verdict: string
  wins: string[]
  integration_score: number
  dimension_deltas: Record<string, number>
  generated_at: string
}

function weekStartIST(d: Date = new Date()): string {
  const ist = new Date(d.getTime() + 5.5 * 3600_000)
  const day = ist.getUTCDay()
  const diff = day === 0 ? -6 : 1 - day
  ist.setUTCDate(ist.getUTCDate() + diff)
  return ist.toISOString().slice(0, 10)
}

export function integrationScoreFromChaos(resourceChaos: number | null | undefined): number {
  const chaos = resourceChaos ?? 50
  return Math.max(0, Math.min(100, 100 - chaos))
}

export async function generateWeeklyReviewForUser(
  supabase: SupabaseClient,
  userId: string,
  weekStart: string = weekStartIST(),
): Promise<WeeklyReviewRow | null> {
  const { data: existing } = await supabase
    .from('weekly_reviews')
    .select('*')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .maybeSingle()

  if (existing) return existing as WeeklyReviewRow

  const weekEnd = new Date(`${weekStart}T00:00:00Z`)
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7)
  const weekEndStr = weekEnd.toISOString().slice(0, 10)

  const [{ data: scores }, { data: commands }, { data: attempts }, { data: revisions }] = await Promise.all([
    supabase.from('hidden_scores').select('resource_chaos, execution_friction, marathon_consistency').eq('user_id', userId).maybeSingle(),
    supabase.from('daily_commands').select('sealed, command_date').eq('user_id', userId).gte('command_date', weekStart).lt('command_date', weekEndStr),
    supabase.from('test_attempts').select('score, max_score, completed_at').eq('user_id', userId).gte('completed_at', `${weekStart}T00:00:00Z`).lt('completed_at', `${weekEndStr}T00:00:00Z`).order('completed_at', { ascending: false }).limit(1),
    supabase.from('note_revisions').select('id').eq('user_id', userId).gte('revised_at', `${weekStart}T00:00:00Z`).lt('revised_at', `${weekEndStr}T00:00:00Z`),
  ])

  const integration = integrationScoreFromChaos(scores?.resource_chaos as number | undefined)
  const sealedDays = (commands ?? []).filter(c => c.sealed).length
  const totalCommands = (commands ?? []).length

  const wins: string[] = []
  if (sealedDays > 0) wins.push(`${sealedDays} command day${sealedDays > 1 ? 's' : ''} fully sealed`)
  if ((revisions ?? []).length > 0) wins.push(`${revisions!.length} note revision${revisions!.length > 1 ? 's' : ''} logged`)
  if (attempts && attempts.length > 0) {
    const a = attempts[0]
    wins.push(`Latest paper: ${a.score}/${a.max_score ?? 200}`)
  }
  while (wins.length < 3) {
    wins.push('Integration debt held steady — next week, one fewer source open')
  }

  const prevWeek = new Date(`${weekStart}T00:00:00Z`)
  prevWeek.setUTCDate(prevWeek.getUTCDate() - 7)
  const { data: prior } = await supabase
    .from('weekly_reviews')
    .select('integration_score')
    .eq('user_id', userId)
    .eq('week_start', prevWeek.toISOString().slice(0, 10))
    .maybeSingle()

  const priorScore = prior?.integration_score as number | undefined
  const delta = priorScore != null ? integration - priorScore : 0

  const verdict =
    sealedDays >= 5 ? 'The week closed with discipline. Hold the line.'
    : sealedDays >= 2 ? 'Partial execution. The system remembers what was left open.'
    : 'A quiet week. Tomorrow\'s command is lighter — begin again.'

  const dimension_deltas: Record<string, number> = {
    integration_score: delta,
    resource_chaos: -(delta),
    commands_sealed: sealedDays,
    commands_total: totalCommands,
  }

  const { data: created, error } = await supabase
    .from('weekly_reviews')
    .insert({
      user_id: userId,
      week_start: weekStart,
      verdict,
      wins: wins.slice(0, 3),
      integration_score: integration,
      dimension_deltas,
    })
    .select('*')
    .single()

  if (error) return null
  return created as WeeklyReviewRow
}

export function weeklyReviewEmailHtml(review: WeeklyReviewRow, brandName = 'KAUTILYA'): string {
  const winsList = review.wins.map(w => `<li style="margin-bottom:8px">${w}</li>`).join('')
  const delta = (review.dimension_deltas?.integration_score as number) ?? 0
  const deltaStr = delta >= 0 ? `+${delta}` : `${delta}`

  return `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:32px;background:#F7F4ED;color:#1F2933">
      <p style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#B0763B;margin:0 0 8px">${brandName} · Weekly Review</p>
      <h1 style="font-family:Georgia,serif;color:#27364B;font-size:24px;margin:0 0 16px">The week is sealed.</h1>
      <p style="font-size:17px;line-height:1.75;margin:0 0 24px">${review.verdict}</p>
      <p style="font-size:14px;color:#5E6E5E;margin:0 0 8px">Integration Score: <strong>${review.integration_score}</strong> (${deltaStr} from last week)</p>
      <h2 style="font-size:14px;color:#B0763B;margin:24px 0 12px">Three wins</h2>
      <ul style="padding-left:20px;font-size:15px;line-height:1.6">${winsList}</ul>
      <p style="font-size:13px;color:#6B7280;margin-top:32px">Open your review in the app for next week's single focus.</p>
    </div>
  `
}
