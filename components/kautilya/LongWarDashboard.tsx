'use client'

import Link from 'next/link'
import { ReactNode } from 'react'
import MotionPage from './MotionPage'
import CommandBoard from '@/app/(dashboard)/dashboard/CommandBoard'
import ResourceChaosMap from './ResourceChaosMap'
import KautilyaEmptyState from './KautilyaEmptyState'
import WeeklyCommandCard from './WeeklyCommandCard'
import { deriveWeeklyCommand } from '@/lib/kautilya/demo-data'
import { computeIntegrationScore } from '@/lib/kautilya/integrationScore'
import type { ResourceState } from '@/types/kautilya'
import { APP, daysUntilPrelims } from '@/lib/config'
import { planLabel } from '@/lib/plans'
import type { DailyCommandRow } from '@/lib/command/types'
import type { StagePattern } from '@/lib/diagnosis/types'
import { cn } from '@/lib/utils'

interface Readiness {
  label: string
  tone: string
  signal: string
  rule: string
}

export interface LongWarDashboardProps {
  aspirantName: string
  archetype: string
  stagePattern?: StagePattern
  plan: string
  hasCompletedDiagnosis: boolean
  integrationScore: number | null
  readiness: Readiness
  command: DailyCommandRow | null
  prelimsNerve?: number | null
  mainsStamina?: number | null
}

function nerveLabel(score: number | null | undefined) {
  if (score == null) return 'Unmapped'
  if (score >= 65) return 'Steady'
  if (score >= 40) return 'Strained'
  return 'Volatile'
}

function staminaLabel(score: number | null | undefined) {
  if (score == null) return 'Unmapped'
  if (score >= 65) return 'Sustained'
  if (score >= 40) return 'Fading'
  return 'Depleted'
}

export default function LongWarDashboard({
  aspirantName,
  archetype,
  stagePattern = 'PRELIMS_WALL',
  plan,
  hasCompletedDiagnosis,
  integrationScore,
  readiness,
  command,
  prelimsNerve,
  mainsStamina,
}: LongWarDashboardProps) {
  const resourceState: ResourceState = {
    sources: [],
    resourceChaos: integrationScore != null ? 100 - integrationScore : null,
  }
  const resolvedIntegrationScore = computeIntegrationScore(resourceState) ?? integrationScore
  const weeklyCommand = deriveWeeklyCommand('Resource chaos')

  return (
    <MotionPage className="flex-1 bg-parchment px-4 py-6 text-slate900 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-4xl">
        {/* ── Top: Long-War Command ── */}
        <header className="command-dossier mb-7 overflow-hidden rounded-2xl border border-linen">
          <div className="grid lg:grid-cols-[1fr_280px]">
            <div className="p-6 sm:p-7">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-copper">
                Long-War Command
              </p>
              <h1 className="heading-cinzel mt-3 max-w-2xl text-3xl font-black leading-tight text-indigo sm:text-4xl">
                {hasCompletedDiagnosis
                  ? `${aspirantName}, close the open front.`
                  : `${aspirantName}, the map comes first.`}
              </h1>
              <p className="mt-3 text-sm font-semibold text-copper">
                {archetype} · {planLabel(plan)}
              </p>

              {/* One dominant command */}
              {hasCompletedDiagnosis && command && (
                <div className="mt-5 rounded-xl border border-copper/35 bg-copper/5 px-4 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-copper">
                    Today&apos;s command
                  </p>
                  <p className="mt-2 text-base font-bold text-indigo">
                    {(command.threads as { title: string }[])[0]?.title ?? readiness.rule}
                  </p>
                  <p className="mt-1 text-sm text-inkdim">{readiness.rule}</p>
                </div>
              )}

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <SignalCard label="Current war signal" value={readiness.signal} />
                <SignalCard label="Operating rule" value={readiness.rule} />
              </div>
            </div>

            <aside className="border-t border-linen bg-ivory/70 p-6 lg:border-l lg:border-t-0">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
                <MetricCard
                  label="Readiness"
                  value={readiness.label}
                  valueClassName={readiness.tone}
                  detail={
                    resolvedIntegrationScore != null
                      ? `Integration ${resolvedIntegrationScore}`
                      : 'Scout pending'
                  }
                />
                <MetricCard
                  label="Prelims clock"
                  value={daysUntilPrelims().toString()}
                  valueClassName="text-indigo"
                  detail={`days${!APP.dates.confirmed ? ' expected' : ''}`}
                />
              </div>
            </aside>
          </div>
        </header>

        {!hasCompletedDiagnosis ? (
          <DiagnosisGate />
        ) : (
          <>
            {/* ── Middle: signals ── */}
            <Section
              title="War Signals"
              subtitle="What is destabilizing the long war?"
            >
              <div className="grid gap-3 md:grid-cols-3">
                <WarSignalCard
                  label="Resource chaos"
                  value={resolvedIntegrationScore != null && resolvedIntegrationScore < 50 ? 'High' : 'Moderating'}
                  detail={
                    resolvedIntegrationScore != null
                      ? `Integration ${resolvedIntegrationScore}`
                      : 'Source map pending'
                  }
                  tone={resolvedIntegrationScore != null && resolvedIntegrationScore < 50 ? 'text-clay' : 'text-copper'}
                />
                <WarSignalCard
                  label="Prelims nerve"
                  value={nerveLabel(prelimsNerve)}
                  detail="Judgement under fire"
                  tone="text-indigo"
                />
                <WarSignalCard
                  label="Mains stamina"
                  value={staminaLabel(mainsStamina)}
                  detail="Architecture endurance"
                  tone="text-indigo"
                />
              </div>
            </Section>

            <Section title="Command" subtitle="What must be written or revised today?" className="mt-7">
              {command ? <CommandBoard initialCommand={command} /> : null}
            </Section>

            <Section
              title="Resource Integration"
              subtitle="What must be integrated? What must be reduced?"
              className="mt-7"
            >
              <div className="space-y-4">
                <ResourceChaosMap
                  integrationScore={resolvedIntegrationScore}
                  sources={resourceState.sources}
                />
                <div id="source-reduction" className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-copper">
                    Source reduction
                  </p>
                  <KautilyaEmptyState variant="no-resource-map" />
                </div>
              </div>
            </Section>

            <Section
              title="Weekly Focus"
              subtitle="The long-war report for this week."
              className="mt-7"
            >
              <WeeklyCommandCard command={weeklyCommand} />
            </Section>

            {/* ── Bottom: repair surfaces ── */}
            <Section
              title="Repair Surfaces"
              subtitle="Smart notes, answer repair, current affairs integration."
              className="mt-7"
            >
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="card-calm border p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-copper">
                    Smart Notes
                  </p>
                  <p className="mt-2 text-sm leading-6 text-inkdim">
                    Premium civil-services briefs — narrative, traps, Mains hooks, active recall.
                  </p>
                  <Link
                    href="/notes"
                    className="mt-4 inline-flex text-sm font-bold text-copper hover:text-copperlight"
                  >
                    Open Repair Library →
                  </Link>
                </div>
                <ComingSoonSurface
                  id="answer-repair"
                  title="Mains Answer Repair"
                  body="Answer structure grading ships when the repair engine is wired. No fabricated feedback until then."
                />
              </div>

              <div className="mt-4">
                <ComingSoonSurface
                  id="current-affairs"
                  title="Current Affairs Inbox"
                  body="Issue linking and static-ground integration ship when the CA engine is ready."
                />
              </div>
            </Section>

            <Section
              title="Operating Profile"
              className="mt-7"
              subtitle="Diagnosis stays visible; command remains primary."
              action={{ href: '/report', label: 'Open dossier' }}
            >
              <div className="grid gap-3 md:grid-cols-[1fr_1.25fr]">
                <div className="card-calm copper-border p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-copper">Archetype</p>
                  <p className="heading-cinzel mt-1 text-2xl font-black text-indigo">{archetype}</p>
                  <p className="mt-2 text-sm leading-6 text-inkdim">
                    Stage: {stagePattern.replace(/_/g, ' ').toLowerCase()}. Primary leak: resource chaos.
                  </p>
                </div>
                <div className="card-calm p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-copper">
                    Daily log
                  </p>
                  <p className="mt-2 text-sm leading-6 text-inkdim">
                    Two minutes a night. Recovery speed beats streak vanity.
                  </p>
                  <Link href="/log" className="mt-4 inline-flex text-sm font-bold text-copper hover:text-copperlight">
                    Open Daily Log →
                  </Link>
                </div>
              </div>
            </Section>
          </>
        )}
      </div>
    </MotionPage>
  )
}

function ComingSoonSurface({
  id,
  title,
  body,
}: {
  id: string
  title: string
  body: string
}) {
  return (
    <div id={id} className="card-calm border border-dashed border-linen p-5">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-copper">Coming soon</p>
      <p className="mt-2 text-base font-bold text-indigo">{title}</p>
      <p className="mt-2 text-sm leading-6 text-inkdim">{body}</p>
    </div>
  )
}

function DiagnosisGate() {
  return (
    <section className="card-calm copper-border p-6 sm:p-8">
      <p className="text-sm font-black uppercase tracking-[0.28em] text-copper">Diagnosis First</p>
      <h2 className="heading-cinzel mt-3 max-w-xl text-2xl font-bold leading-tight text-indigo sm:text-3xl">
        Complete the 30-card Scout diagnosis before touching another book.
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-inkdim">
        Your books are not the problem. The system needs your operating profile first.
      </p>
      <Link
        href="/diagnosis"
        className="mt-6 inline-flex min-h-12 items-center justify-center rounded-lg bg-copper px-7 text-sm font-bold text-ivory transition-calm hover:bg-copperlight"
      >
        Start Long-War Diagnosis
      </Link>
    </section>
  )
}

function SignalCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-linen bg-ivory/70 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-copper">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate900">{value}</p>
    </div>
  )
}

function MetricCard({
  label, value, detail, valueClassName,
}: {
  label: string
  value: string
  detail: string
  valueClassName: string
}) {
  return (
    <div className="rounded-xl border border-linen bg-parchment/70 px-4 py-3 text-center">
      <p className={cn('text-2xl font-black leading-none', valueClassName)}>{value}</p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-inkdim">{label}</p>
      <p className="mt-1 text-xs text-inkdim">{detail}</p>
    </div>
  )
}

function WarSignalCard({
  label, value, detail, tone,
}: {
  label: string
  value: string
  detail: string
  tone: string
}) {
  return (
    <div className="card-calm border p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-copper">{label}</p>
      <p className={cn('mt-2 text-xl font-black', tone)}>{value}</p>
      <p className="mt-1 text-xs text-inkdim">{detail}</p>
    </div>
  )
}

function Section({
  title, subtitle, action, className = '', children,
}: {
  title: string
  subtitle?: string
  action?: { href: string; label: string }
  className?: string
  children: ReactNode
}) {
  return (
    <section className={className}>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-5 w-1 rounded-full bg-copper" />
            <h2 className="heading-cinzel text-xl font-black uppercase tracking-[0.1em] text-copper">
              {title}
            </h2>
          </div>
          {subtitle && <p className="mt-1 pl-3 text-sm text-inkdim">{subtitle}</p>}
        </div>
        {action && (
          <Link href={action.href} className="shrink-0 text-sm font-bold text-copper hover:text-copperlight">
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}
