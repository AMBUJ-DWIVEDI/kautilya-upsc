import Link from 'next/link'
import type { ReactNode } from 'react'
import { createClient } from '@/lib/supabase/server'
import { extractAnchorSnapshot } from '@/lib/kautilya/anchor'
import type { ReportContent } from '@/lib/report/types'

export default async function KautilyaAnchorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: summary }, { data: report }] = await Promise.all([
    supabase.from('user_dashboard_summary').select('name, archetype, stage_pattern, plan_type, integration_score, resource_chaos, prelims_nerve, mains_stamina, latest_score, latest_max_score, attempts_taken').eq('user_id', user!.id).maybeSingle(),
    supabase.from('diagnosis_reports').select('report_content, generated_at').eq('user_id', user!.id).order('generated_at', { ascending: false }).limit(1).maybeSingle(),
  ])

  const aspirantName = (summary?.name as string | null) ?? 'Aspirant'
  const archetype = (summary?.archetype as string | null) ?? 'Long-war profile pending'
  const snapshot = extractAnchorSnapshot(report?.report_content as Partial<ReportContent> | null)

  return (
    <main className="flex-1 bg-parchment px-4 pb-12 pt-2 text-slate900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="institutional-surface mb-7 p-6 sm:p-8">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-copper">Anchor Vault</p>
          <h1 className="heading-cinzel mt-3 max-w-3xl text-3xl font-black leading-tight text-indigo sm:text-5xl">
            The reason the long war stays personal.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-inkdim">
            Anchor stores the aspirant&apos;s emotional vault, rules, operating profile, diagnosis memory, target evidence, and return logic.
          </p>
        </header>

        <section className="grid gap-4 lg:grid-cols-3">
          <AnchorMetric title="Aspirant" value={aspirantName} detail={archetype} />
          <AnchorMetric title="Latest Score" value={summary?.latest_score != null ? `${summary.latest_score}/${summary.latest_max_score ?? 200}` : 'Pending'} detail="The latest measured examination evidence." />
          <AnchorMetric title="Attempt Stage" value={summary?.stage_pattern ?? 'Pending'} detail={`${summary?.attempts_taken ?? 0} attempts recorded in the operating profile.`} />
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-2">
          <VaultPanel
            title="Personal Emotional Vault"
            items={[
              snapshot.emotionalVault.fightingFor || 'Fighting-for anchor pending',
              snapshot.emotionalVault.mustProtect || 'Protection anchor pending',
              snapshot.emotionalVault.mustBecome || 'Becoming anchor pending',
              snapshot.emotionalVault.comebackLine || 'Return line pending',
            ]}
          />
          <VaultPanel
            title="Rules and Laws"
            items={snapshot.diagnosisLaws.length > 0
              ? snapshot.diagnosisLaws.map(item => `${item.name}: ${item.law}`)
              : [
                  'No new source until one source is reduced.',
                  'Write before comparing.',
                  'Current affairs must attach to static ground.',
                  'Recovery is a command, not a confession.',
                ]}
          />
          <VaultPanel
            title="Operating Profile"
            items={[
              `Cognitive archetype: ${archetype}`,
              `Stage pattern: ${(summary?.stage_pattern as string | null) ?? 'pending'}`,
              `Resource chaos: ${summary?.resource_chaos ?? 'pending'}`,
              `Mains stamina: ${summary?.mains_stamina ?? 'pending'}`,
            ]}
          />
          <VaultPanel
            title="Evidence and Reports"
            items={[
              'Long-War Diagnosis Report',
              'Target posts and service preference',
              'Score memory and attempt signals',
              'Weekly command review history',
            ]}
            action={<Link href="/report" className="text-xs font-bold text-copper hover:text-copperlight">Open dossier</Link>}
          />
        </section>
        <section className="institutional-surface mt-6 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-copper">Evidence law</p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-inkdim">
            Anchor points are generated from diagnosis evidence and the latest report. They cannot be rewritten from this page.
          </p>
        </section>
      </div>
    </main>
  )
}

function AnchorMetric({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <article className="card-calm p-5">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-copper">{title}</p>
      <p className="mt-2 text-2xl font-black text-indigo">{value}</p>
      <p className="mt-2 text-sm leading-6 text-inkdim">{detail}</p>
    </article>
  )
}

function VaultPanel({
  title,
  items,
  action,
}: {
  title: string
  items: string[]
  action?: ReactNode
}) {
  return (
    <article className="institutional-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="heading-cinzel text-lg font-black text-indigo">{title}</h2>
        {action}
      </div>
      <ul className="mt-4 space-y-2">
        {items.map(item => (
          <li key={item} className="rounded-lg border border-linen bg-ivory/75 px-3 py-2 text-sm leading-6 text-inkdim">
            {item}
          </li>
        ))}
      </ul>
    </article>
  )
}
