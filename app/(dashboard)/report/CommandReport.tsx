// Presentational renderer for the KAUTILYA Command Diagnosis.
// Pure (props in → JSX out), so it works in both the server page and the
// client loader. No hooks, no server-only imports.

import Link from 'next/link'
import type { ReportContent, CognitiveDomain } from '@/lib/report/types'
import { isFreeDepth, type ReportDepth } from '@/lib/report/depth'

function scoreColor(score: number): string {
  return score >= 60 ? 'text-sage' : score >= 40 ? 'text-copper' : 'text-clay'
}
function barColor(score: number): string {
  return score >= 60 ? 'bg-sage/70' : score >= 40 ? 'bg-copper/70' : 'bg-clay/70'
}

function Engine({ name, d }: { name: string; d: CognitiveDomain }) {
  return (
    <div className="card-calm p-4">
      <div className="mb-2 flex items-baseline justify-between">
        <p className="text-xs uppercase tracking-wide text-inkdim">{name}</p>
        <span className={`font-mono text-lg font-bold ${scoreColor(d.score)}`}>{d.score}</span>
      </div>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-linen">
        <div className={`h-full rounded-full ${barColor(d.score)}`} style={{ width: `${Math.max(0, Math.min(100, d.score))}%` }} />
      </div>
      <p className={`mb-1 text-sm font-medium ${scoreColor(d.score)}`}>{d.label}</p>
      <p className="text-xs leading-5 text-inkdim">{d.summary}</p>
    </div>
  )
}

export default function CommandReport({
  report,
  depth,
}: {
  report: ReportContent
  depth?: ReportDepth
}) {
  const r = report
  const cm = r.cognitive_map

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 space-y-8 px-4 py-10 sm:px-6">
      {/* 1 — Archetype hero */}
      <div className="card-calm copper-border p-6 text-center sm:p-8">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-copper">
          KAUTILYA Command Diagnosis
        </p>
        <h1 className="heading-cinzel text-3xl font-black leading-tight text-copper sm:text-4xl">
          {r.archetype}
        </h1>
        {r.archetype_tagline && (
          <p className="mx-auto mt-3 max-w-xl text-sm italic leading-6 text-inkdim">
            {r.archetype_tagline}
          </p>
        )}
      </div>

      {/* 2 — Modus Operandi */}
      {r.modus_operandi && (
        <section className="note-surface border-l-2 border-copper/40 pl-4 text-lg leading-7 text-slate900">
          {r.modus_operandi}
        </section>
      )}

      {/* 3 — Cognitive Map */}
      {cm && (
        <section>
          <h2 className="heading-cinzel mb-4 text-lg font-semibold text-indigo">Cognitive Map</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Engine name="Clarity" d={cm.clarity_engine} />
            <Engine name="Consistency" d={cm.consistency_engine} />
            <Engine name="Pressure" d={cm.pressure_engine} />
            <Engine name="Integration" d={cm.integration_engine} />
          </div>
        </section>
      )}

      {/* 4 — Functional Flow */}
      {r.functional_flow?.length > 0 && (
        <section>
          <h2 className="heading-cinzel mb-4 text-lg font-semibold text-indigo">How You Operate</h2>
          <div className="space-y-3">
            {r.functional_flow.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 font-mono text-sm text-copper">
                  {(i + 1).toString().padStart(2, '0')}
                </span>
                <p className="text-sm leading-relaxed text-slate900">{step}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5 — Stabilization Layer */}
      {r.target_profile && (
        <section className="border-y border-linen py-6">
          <h2 className="heading-cinzel mb-4 text-lg font-semibold text-indigo">Target Profile</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {([
              ['Post', r.target_profile.post],
              ['Rank', r.target_profile.rank],
              ['Score', r.target_profile.score],
            ] as const).map(([label, value]) => (
              <div key={label}>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-copper">{label}</p>
                <p className="mt-2 text-sm leading-6 text-slate900">{value}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {r.emotional_vault && (
        <section className="border-b border-linen pb-6">
          <h2 className="heading-cinzel mb-4 text-lg font-semibold text-indigo">Emotional Vault</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {([
              ['Primary trigger', r.emotional_vault.primary_trigger],
              ['Pressure story', r.emotional_vault.pressure_story],
              ['Protection rule', r.emotional_vault.protection_rule],
            ] as const).map(([label, value]) => (
              <div key={label}>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-copper">{label}</p>
                <p className="mt-2 text-sm leading-6 text-slate900">{value}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {r.anchor_vault && (
        <section className="border-b border-linen pb-6">
          <h2 className="heading-cinzel mb-4 text-lg font-semibold text-indigo">Anchor Vault</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {([
              ['Human anchor', r.anchor_vault.human_anchor],
              ['Anchor role', r.anchor_vault.anchor_role],
              ['Character anchor', r.anchor_vault.character_anchor],
              ['Deepest motivator', r.anchor_vault.deepest_motivator],
              ['Return point', r.anchor_vault.return_point],
            ] as const).map(([label, value]) => (
              <div key={label}>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-copper">{label}</p>
                <p className="mt-2 text-sm leading-6 text-slate900">{value}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {r.operating_profile && (
        <section className="border-b border-linen pb-6">
          <h2 className="heading-cinzel mb-4 text-lg font-semibold text-indigo">Operating Profile</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {([
              ['Rhythm', r.operating_profile.rhythm],
              ['Starts best when', r.operating_profile.starts_best_when],
              ['Sustained by', r.operating_profile.sustained_by],
              ['Disrupted by', r.operating_profile.disrupted_by],
              ['Recovery protocol', r.operating_profile.recovery_protocol],
              ['Protected environment', r.operating_profile.protected_environment],
            ] as const).map(([label, value]) => (
              <div key={label}>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-copper">{label}</p>
                <p className="mt-2 text-sm leading-6 text-slate900">{value}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {r.stabilization_layer && (
        <section className="card-calm rounded-xl p-5 sm:p-6">
          <p className="mb-1 font-mono text-xs uppercase tracking-[0.3em] text-indigo">
            Stabilization Layer · {r.stabilization_layer.layer}
          </p>
          <p className="mb-4 text-sm leading-6 text-inkdim">{r.stabilization_layer.why}</p>
          <ul className="space-y-2">
            {r.stabilization_layer.prescriptions?.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate900">
                <span className="mt-1 text-copper">▹</span>
                <span className="leading-6">{p}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 6 & 7 — Strengths / Vulnerabilities */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {r.strengths?.length > 0 && (
          <section className="card-calm rounded-xl border border-sage/25 p-5">
            <h2 className="heading-cinzel mb-3 text-base font-semibold text-sage">Strengths</h2>
            <div className="space-y-3">
              {r.strengths.map((s, i) => (
                <div key={i}>
                  <p className="text-sm font-medium text-slate900">{s.title}</p>
                  <p className="mt-0.5 text-xs leading-5 text-inkdim">{s.detail}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        {r.vulnerabilities?.length > 0 && (
          <section className="card-calm rounded-xl border border-clay/25 p-5">
            <h2 className="heading-cinzel mb-3 text-base font-semibold text-clay">Vulnerabilities</h2>
            <div className="space-y-3">
              {r.vulnerabilities.map((v, i) => (
                <div key={i}>
                  <p className="text-sm font-medium text-slate900">{v.title}</p>
                  <p className="mt-0.5 text-xs leading-5 text-inkdim">→ {v.correction}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* 9 — Prelims Verdict */}
      {r.prelims_verdict && (
        <section className="card-calm copper-border rounded-xl p-6">
          <h2 className="heading-cinzel mb-4 text-lg font-semibold text-copper">Prelims Verdict</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-inkdim">Stage</p>
              <p className="mt-1 text-sm font-medium text-slate900">{r.prelims_verdict.stage}</p>
            </div>
            <div>
              <p className="text-xs text-inkdim">Integration</p>
              <p className={`mt-1 font-mono text-2xl font-bold ${scoreColor(r.prelims_verdict.integration_score)}`}>
                {r.prelims_verdict.integration_score}
              </p>
            </div>
            <div>
              <p className="text-xs text-inkdim">Focus subject</p>
              <p className="mt-1 text-sm font-medium text-slate900">{r.prelims_verdict.focus_subject}</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-xs text-inkdim">Main leak</p>
              <p className="mt-1 text-sm font-medium text-clay">{r.prelims_verdict.main_leak}</p>
            </div>
          </div>
        </section>
      )}

      {/* 8 — Anchor Card */}
      {r.anchor_card && (
        <section className="card-calm rounded-xl border border-indigo/20 p-6">
          <h2 className="heading-cinzel mb-4 text-lg font-semibold text-indigo">Your Anchor</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {([
              ['Fighting for', r.anchor_card.fighting_for],
              ['Must protect', r.anchor_card.must_protect],
              ['Must prove', r.anchor_card.must_prove],
              ['Must become', r.anchor_card.must_become],
              ['Biggest enemy', r.anchor_card.biggest_enemy],
              ['Warning', r.anchor_card.warning],
            ] as const).map(([label, value]) => (
              value ? (
                <div key={label} className="rounded-lg bg-parchment p-3">
                  <p className="text-xs uppercase tracking-wide text-inkdim">{label}</p>
                  <p className="mt-1 text-sm leading-6 text-slate900">{value}</p>
                </div>
              ) : null
            ))}
          </div>
          {r.anchor_card.comeback_line && (
            <p className="note-surface mt-4 border-l-2 border-indigo/40 pl-3 text-[15px] italic leading-6 text-slate900">
              {r.anchor_card.comeback_line}
            </p>
          )}
        </section>
      )}

      {/* 10 — 7-Day Attack Plan */}
      {r.attack_plan?.length > 0 && (
        <section>
          <h2 className="heading-cinzel mb-4 text-lg font-semibold text-indigo">7-Day Attack Plan</h2>
          <div className="space-y-3">
            {r.attack_plan.map((d) => (
              <div key={d.day} className="card-calm rounded-lg p-4">
                <div className="mb-2 flex items-center gap-3">
                  <span className="font-mono text-sm text-copper">Day {d.day}</span>
                  <span className="text-sm font-medium text-slate900">{d.focus}</span>
                </div>
                <ul className="space-y-1">
                  {d.tasks?.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-inkdim">
                      <span className="mt-0.5 text-copper/60">·</span>
                      <span className="leading-5">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 11 — Personal Laws */}
      {r.personal_laws?.length > 0 && (
        <section>
          <h2 className="heading-cinzel mb-4 text-lg font-semibold text-indigo">Your Personal Laws</h2>
          <div className="space-y-3">
            {r.personal_laws.map((law, i) => (
              <div key={i} className="card-calm rounded-lg p-4">
                <p className="text-sm font-semibold text-copper">{law.law_name}</p>
                <p className="mt-1 text-sm text-slate900">{law.law}</p>
                <p className="mt-1 text-xs leading-5 text-inkdim">{law.detail}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 12 — Daily Command */}
      {r.daily_command && (
        <section className="card-calm copper-border rounded-xl p-6 text-center">
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.3em] text-copper">Daily Command</p>
          <p className="heading-cinzel text-xl font-bold leading-relaxed text-slate900">
            {r.daily_command}
          </p>
        </section>
      )}

      <div className="flex items-center justify-between border-t border-linen pt-4">
        <Link href="/dashboard" className="text-sm text-inkdim transition-calm hover:text-copper">
          ← Today&apos;s Command
        </Link>
        {isFreeDepth(depth) && (
          <Link href="/upgrade" className="text-sm text-copper transition-calm hover:text-copperlight">
            Unlock the complete 60-card report →
          </Link>
        )}
      </div>
    </div>
  )
}
