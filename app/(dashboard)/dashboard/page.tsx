import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { APP, daysUntilPrelims } from '@/lib/config'
import { getOrCreateTodayCommand } from '@/lib/command/generate'
import CommandBoard from './CommandBoard'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: summary } = await supabase
    .from('user_dashboard_summary')
    .select('*')
    .eq('user_id', user!.id)
    .single()

  const hasCompletedDiagnosis = summary?.anchor_generated === true
  const aspirantName = (summary?.name as string) || 'Aspirant'
  const integrationScore = (summary?.integration_score as number | null) ?? null

  const command = hasCompletedDiagnosis
    ? await getOrCreateTodayCommand(supabase, user!.id)
    : null

  return (
    <div className="flex-1 bg-parchment px-4 py-6 text-slate900 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-copper">
              {APP.brand.name} Command
            </p>
            <h1 className="mt-2 text-3xl font-black leading-tight text-indigo sm:text-4xl">
              {hasCompletedDiagnosis
                ? `${aspirantName}, do this next.`
                : `${aspirantName}, the map comes first.`}
            </h1>
          </div>

          <div className="flex gap-3">
            {/* Integration Score — the ONE user-visible meta-metric. */}
            {integrationScore != null && hasCompletedDiagnosis && (
              <div className="rounded-lg border border-sage/30 bg-ivory px-5 py-3 text-center">
                <p className="text-3xl font-black text-sage">{integrationScore}</p>
                <p className="text-xs text-inkdim">Integration Score</p>
              </div>
            )}
            <div className="rounded-lg border border-linen bg-ivory px-5 py-3 text-center">
              <p className="text-3xl font-black text-indigo">{daysUntilPrelims()}</p>
              <p className="text-xs text-inkdim">
                days to Prelims{!APP.dates.confirmed && ' (expected)'}
              </p>
            </div>
          </div>
        </header>

        {!hasCompletedDiagnosis && <DiagnosisCommand />}

        {hasCompletedDiagnosis && command && <CommandBoard initialCommand={command} />}

        {hasCompletedDiagnosis && (
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <SupportTile
              eyebrow="Prelims Engine"
              title={summary?.latest_score != null ? `${summary.latest_score}/${summary?.latest_max_score ?? APP.exam.prelimsGS.marks}` : 'Baseline pending'}
              copy={
                summary?.gates_completed
                  ? `${summary.gates_completed} paper(s) on record. The map sharpens with each one.`
                  : 'Take the baseline paper. The system reads your guessing discipline, not just your score.'
              }
              href="/mock"
            />
            <SupportTile
              eyebrow="Smart Notes"
              title="The library"
              copy="Issue-depth notes, twelve blocks each. Prelims facts boxed, frameworks copyable."
              href="/notes"
            />
            <SupportTile
              eyebrow="Weekly Review"
              title="Sunday, sealed"
              copy="One verdict, three wins, one focus for next week. The week ends in ceremony, not a stats dump."
              href="/review"
            />
          </div>
        )}
      </div>
    </div>
  )
}

function DiagnosisCommand() {
  return (
    <section className="card-calm copper-border p-6 sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-copper">Today&apos;s Command</p>
      <h2 className="heading-cinzel mt-3 max-w-xl text-2xl font-bold leading-tight text-indigo sm:text-3xl">
        Complete the 52-card diagnosis before touching another book.
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-inkdim">
        Your books are not the problem. The system needs your operating profile first —
        how you recover, where your sources fragment, and what pressure does to your judgement.
        Nine minutes. Then the commands begin.
      </p>
      <Link
        href="/diagnosis"
        className="mt-6 inline-flex min-h-12 items-center justify-center rounded-lg bg-copper px-7 text-sm font-bold text-ivory transition-calm hover:bg-copperlight"
      >
        Begin the diagnosis
      </Link>
    </section>
  )
}

function SupportTile({ eyebrow, title, copy, href }: { eyebrow: string; title: string; copy: string; href: string }) {
  return (
    <Link href={href} className="card-calm block p-5 transition-calm hover:border-copper/40">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-copper">{eyebrow}</p>
      <h3 className="mt-2 text-lg font-black text-slate900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-inkdim">{copy}</p>
    </Link>
  )
}
