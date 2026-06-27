import Link from 'next/link'
import { ArrowRight, Check, Target } from 'lucide-react'
import { KAUTILYA_PROFILES } from '@/lib/kautilya/landing'
import { createClient } from '@/lib/supabase/server'

export default async function KautilyaProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: summary } = await supabase
    .from('user_dashboard_summary')
    .select('name, archetype, stage_pattern, attempts_taken, employed, integration_score, resource_chaos, prelims_nerve, mains_stamina')
    .eq('user_id', user!.id)
    .maybeSingle()

  const currentArchetype = (summary?.archetype as string | null) ?? 'Diagnosis pending'
  const normalizedCurrent = currentArchetype.toLowerCase().replace(/^the\s+/, '')

  return (
    <main className="flex-1 bg-parchment px-4 pb-12 pt-2 text-slate900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="institutional-surface mb-7 grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-copper">Operating Profiles</p>
            <h1 className="heading-cinzel mt-3 max-w-3xl text-3xl font-black leading-tight text-indigo sm:text-5xl">
              Every aspirant destabilizes differently.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-inkdim">
              KAUTILYA identifies the preparation pattern before prescribing sources, tests, writing, or recovery.
            </p>
          </div>
          <aside className="border border-copper/25 bg-ivory p-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-copper">Your current profile</p>
            <p className="heading-cinzel mt-3 text-xl font-black text-indigo">{currentArchetype}</p>
            <p className="mt-2 text-sm text-inkdim">{summary?.stage_pattern ?? 'Complete diagnosis to establish the operating pattern.'}</p>
            <Link href="/report" className="mt-4 inline-flex items-center gap-2 text-xs font-black text-copper">
              Open diagnosis dossier <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </aside>
        </header>

        <section className="mb-7 grid gap-px border border-linen bg-linen sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Integration', summary?.integration_score ?? 'Pending'],
            ['Resource chaos', summary?.resource_chaos ?? 'Pending'],
            ['Prelims nerve', summary?.prelims_nerve ?? 'Pending'],
            ['Mains stamina', summary?.mains_stamina ?? 'Pending'],
          ].map(([label, value]) => (
            <div key={label} className="bg-ivory p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-inkdim">{label}</p>
              <p className="mt-2 font-mono text-2xl font-black text-indigo">{value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {KAUTILYA_PROFILES.map(profile => {
            const active = normalizedCurrent.includes(profile.name.toLowerCase().replace(/^the\s+/, ''))
            return (
              <article key={profile.id} className={`institutional-surface p-5 ${active ? 'border-copper shadow-paper' : ''}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-copper">{active ? 'Current diagnosis' : 'Operating profile'}</p>
                  {active && <Target className="h-4 w-4 text-copper" />}
                </div>
                <h2 className="heading-cinzel mt-3 text-lg font-black text-indigo">{profile.name}</h2>
                <p className="mt-3 text-sm leading-6 text-inkdim">{profile.seenLanguage}</p>
                <div className="mt-5 border-t border-linen pt-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-inkdim">Command needs</p>
                  <ul className="mt-3 space-y-2">
                    {profile.needs.slice(0, 4).map(need => (
                      <li key={need} className="flex items-center gap-2 text-xs font-semibold text-slate900">
                        <Check className="h-3.5 w-3.5 text-sage" />
                        {need}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href={profile.offer.href} className="mt-5 inline-flex items-center gap-2 text-xs font-black text-copper">
                  {profile.offer.label} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </article>
            )
          })}
        </section>
      </div>
    </main>
  )
}
