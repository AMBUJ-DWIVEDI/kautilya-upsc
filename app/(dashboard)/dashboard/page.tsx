import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { APP, daysUntilPrelims } from '@/lib/config'
import { getOrCreateTodayCommand } from '@/lib/command/generate'
import { isPaidPlan, hasGsPlan, planLabel } from '@/lib/plans'
import CommandBoard from './CommandBoard'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: summary } = await supabase
    .from('user_dashboard_summary')
    .select('*')
    .eq('user_id', user!.id)
    .single()

  const hasCompletedDiagnosis = summary?.archetype != null
  const aspirantName = (summary?.name as string) || 'Aspirant'
  const archetype = (summary?.archetype as string) || 'Unmapped Aspirant'
  const plan = (summary?.plan_type as string) ?? 'free'
  const paid = isPaidPlan(plan)
  const gs = hasGsPlan(plan)
  const integrationScore = (summary?.integration_score as number | null) ?? null

  const command = hasCompletedDiagnosis
    ? await getOrCreateTodayCommand(supabase, user!.id)
    : null

  return (
    <div className="flex-1 bg-parchment px-4 py-6 text-slate900 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-copper">
              {archetype} · {planLabel(plan)}
            </p>
            <h1 className="mt-2 text-3xl font-black leading-tight text-indigo sm:text-4xl">
              {hasCompletedDiagnosis ? `${aspirantName}, do this next.` : `${aspirantName}, the map comes first.`}
            </h1>
          </div>
          <div className="flex gap-3">
            {integrationScore != null && hasCompletedDiagnosis && (
              <div className="rounded-lg border border-sage/30 bg-ivory px-5 py-3 text-center">
                <p className="text-3xl font-black text-sage">{integrationScore}</p>
                <p className="text-xs text-inkdim">Integration Signal</p>
              </div>
            )}
            <div className="rounded-lg border border-linen bg-ivory px-5 py-3 text-center">
              <p className="text-3xl font-black text-indigo">{daysUntilPrelims()}</p>
              <p className="text-xs text-inkdim">days to Prelims{!APP.dates.confirmed && ' (expected)'}</p>
            </div>
          </div>
        </header>

        {!hasCompletedDiagnosis ? (
          <DiagnosisCommand />
        ) : (
          <>
            {/* 1 — DIAGNOSIS */}
            <Section title="Diagnosis" subtitle="Your long-war operating profile." action={{ href: '/report', label: 'Open full report' }}>
              <div className="card-calm p-5">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-copper">Your archetype</p>
                <p className="heading-cinzel mt-1 text-2xl font-black text-indigo">{archetype}</p>
                <p className="mt-2 text-sm leading-6 text-inkdim">
                  The full Command Diagnosis maps your purpose, judgement under fire, and where your sources fragment.
                </p>
              </div>
            </Section>

            {/* 2 — COMMAND */}
            <Section title="Command" className="mt-6">
              {command && <CommandBoard initialCommand={command} />}
            </Section>

            {/* 3 — PLANS */}
            <Section title="Scout · Free" className="mt-7" subtitle="Open to every aspirant.">
              <div className="grid gap-3 md:grid-cols-3">
                <FeatureTile state="free" eyebrow="Free report" title="Command Diagnosis" copy="Your full Scout report — read it anytime." href="/report" />
                <FeatureTile state="free" eyebrow="Free" title="Baseline Mock" copy="One full paper. The system reads your guessing discipline, not just the score." href="/mock" />
                <FeatureTile state="free" eyebrow="Free" title="Sample Smart Notes" copy="Issue-depth repair notes: Prelims facts boxed, Mains frameworks copyable." href="/notes" />
              </div>
            </Section>

            <Section title="Warrior Command" className="mt-6" subtitle="The full repair loop and mock arena."
              action={!paid ? { href: '/upgrade', label: 'Unlock Warrior' } : undefined}>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <FeatureTile state={paid ? 'open' : 'locked'} eyebrow="Warrior" title="50-Card Command Report" copy="Your Scout scan plus 20 deeper cards for sharper contextualisation." href={paid ? '/report?depth=paid50' : '/upgrade?reason=deep'} />
                <FeatureTile state={paid ? 'open' : 'locked'} eyebrow="Warrior" title="Full Mock Arena" copy="Full-length papers and sectional drills with guessing analytics." href={paid ? '/mock' : '/upgrade?reason=mock'} />
                <FeatureTile state={paid ? 'open' : 'locked'} eyebrow="Warrior" title="Smart Notes" copy="The repair library tied to your leaks, growing over time." href={paid ? '/notes' : '/upgrade?reason=notes'} />
                <FeatureTile state={paid ? 'open' : 'locked'} eyebrow="Warrior" title="Active Recovery Plan" copy="Daily two-minute log, streak chain, and comeback tracking." href="/log" />
              </div>
            </Section>

            <Section title="Commander Command" className="mt-6" subtitle="Full note depth, Mains frameworks, and mentorship."
              action={!gs ? { href: '/upgrade', label: 'Unlock Commander' } : undefined}>
              <div className="grid gap-3 md:grid-cols-2">
                <FeatureTile state={gs ? 'open' : 'locked'} eyebrow="Commander" title="Full Smart Notes Vault" copy="Every note, full upsc12 depth, plus Mains answer frameworks daily." href={gs ? '/notes' : '/upgrade?reason=vault'} />
                <FeatureTile state={gs ? 'open' : 'locked'} eyebrow="Commander" title="Personalised Mentor Review" copy="A mentor reviews your logs and mocks each month and tells you what to fix next." href="/upgrade" />
              </div>
            </Section>

            {/* 4 — DAILY LOG (last) */}
            <Section title="Daily Log" className="mt-7" subtitle="Two minutes a night. The chain that beats streak vanity.">
              <Link href="/log" className="card-calm flex flex-col gap-3 border-sage/40 p-5 transition-calm hover:border-sage sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-base font-black text-indigo">Log tonight in two minutes</p>
                  <p className="mt-1 text-sm leading-6 text-inkdim">
                    Hours, mood, the day&apos;s biggest leak, and one correction for tomorrow. KAUTILYA turns it into your recovery pattern.
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-sage px-4 py-2.5 text-sm font-bold text-ivory">
                  Open Daily Log →
                </span>
              </Link>
            </Section>
          </>
        )}
      </div>
    </div>
  )
}

/* ── Pronounced section wrapper ── */
function Section({
  title, subtitle, action, className = '', children,
}: {
  title: string
  subtitle?: string
  action?: { href: string; label: string }
  className?: string
  children: React.ReactNode
}) {
  return (
    <section className={className}>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-5 w-1 rounded-full bg-copper" />
            <h2 className="heading-cinzel text-xl font-black uppercase tracking-[0.1em] text-copper">{title}</h2>
          </div>
          {subtitle && <p className="mt-1 pl-3 text-sm text-inkdim">{subtitle}</p>}
        </div>
        {action && (
          <Link href={action.href} className="shrink-0 text-sm font-bold text-copper transition-calm hover:text-copperlight">
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}

function DiagnosisCommand() {
  return (
    <section className="card-calm copper-border p-6 sm:p-8">
      <p className="text-sm font-black uppercase tracking-[0.28em] text-copper">Diagnosis · First</p>
      <h2 className="heading-cinzel mt-3 max-w-xl text-2xl font-bold leading-tight text-indigo sm:text-3xl">
        Complete the 30-card Scout diagnosis before touching another book.
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-inkdim">
        Your books are not the problem. The system needs your operating profile first —
        how you recover, where your sources fragment, and what pressure does to your judgement.
        Six minutes. Then the commands begin.
      </p>
      <Link href="/diagnosis"
        className="mt-6 inline-flex min-h-12 items-center justify-center rounded-lg bg-copper px-7 text-sm font-bold text-ivory transition-calm hover:bg-copperlight">
        Start Long-War Diagnosis
      </Link>
    </section>
  )
}

function FeatureTile({ title, eyebrow, copy, href, state }: {
  title: string; eyebrow: string; copy: string; href: string; state: 'free' | 'open' | 'locked'
}) {
  const shell =
    state === 'free' ? 'border-sage/40 bg-sage/5 hover:border-sage'
      : state === 'open' ? 'border-copper/45 bg-copper/5 hover:border-copper'
      : 'border-linen bg-ivory/60 hover:border-copper/40'
  return (
    <Link href={href} className={`card-calm border p-4 transition-calm ${shell}`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-copper">{eyebrow}</p>
        {state === 'free' && <span className="rounded bg-sage px-2 py-1 text-[10px] font-bold uppercase text-ivory">Open</span>}
        {state === 'locked' && <span className="rounded bg-inkdim/10 px-2 py-1 text-[10px] font-bold uppercase text-inkdim">Unlock</span>}
        {state === 'open' && <span className="rounded bg-copper/15 px-2 py-1 text-[10px] font-bold uppercase text-copper">Active</span>}
      </div>
      <h3 className="text-base font-black text-slate900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-inkdim">{copy}</p>
    </Link>
  )
}
