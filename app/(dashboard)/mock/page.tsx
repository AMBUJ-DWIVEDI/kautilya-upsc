import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MOCK_CATALOG, type MockCatalogItem } from '@/lib/mock/catalog'
import { canAccessPlan, isPaidPlan } from '@/lib/plans'
import { APP } from '@/lib/config'

type MockRow = MockCatalogItem & { id: string }

export default async function PaperLibraryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('plan_type')
    .eq('id', user.id)
    .single()

  const plan = userData?.plan_type ?? 'free'
  const paid = isPaidPlan(plan)

  const [{ data: mockTests }, { data: attempts }] = await Promise.all([
    supabase
      .from('mock_tests')
      .select('id, gate_number, title, test_type, section, duration_mins, total_questions, max_score, is_baseline, unlock_plan, topic_tags')
      .order('gate_number'),
    supabase.from('test_attempts').select('id, mock_test_id, score, max_score, completed_at').eq('user_id', user.id),
  ])

  const testRows = new Map((mockTests as unknown as MockRow[] | null)?.map(t => [t.gate_number, t]) ?? [])
  const catalog: MockCatalogItem[] = MOCK_CATALOG.map(item => testRows.get(item.gate_number) ?? item)
  const idByGate = new Map((mockTests as unknown as MockRow[] | null)?.map(t => [t.gate_number, t.id]) ?? [])
  const attemptMap = new Map(attempts?.map(a => [a.mock_test_id, a]) ?? [])
  const fullLength = catalog.filter(test => test.test_type === 'full_length')
  const drills = catalog.filter(test => test.test_type === 'sectional')
  const completed = attempts?.length ?? 0
  const gs = APP.exam.prelimsGS

  return (
    <div className="flex-1 bg-parchment px-4 py-8 text-slate900 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 grid gap-4 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-copper">
              Full GS papers · Subject drills
            </p>
            <h1 className="heading-cinzel text-3xl font-black leading-tight text-indigo sm:text-4xl">
              The Paper Library
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-inkdim">
              Paper 1 is your free baseline — {gs.questions} questions, {gs.minutes} minutes,
              +{gs.perQuestion}/−{gs.negative}. Every paper reads your guessing discipline and
              elimination technique, not just your score.
            </p>
          </div>
          <div className="card-calm p-4">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-copper">Your access</p>
            <p className="mt-2 text-2xl font-black text-indigo">{paid ? 'Full library' : '1 baseline paper'}</p>
            <p className="mt-1 text-xs text-inkdim">{completed} completed so far</p>
          </div>
        </header>

        {!paid && (
          <section className="card-calm copper-border mb-6 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-copper">Free proof</p>
            <h2 className="heading-cinzel mt-2 text-2xl font-bold text-indigo">
              Take Paper 1. Then unlock the plan built from your leaks.
            </h2>
            <p className="mt-3 text-sm leading-6 text-inkdim">
              The baseline exposes where marks leak. Prelims Command uses that evidence to
              sequence full papers, subject drills, and Smart Notes.
            </p>
            <Link href="/upgrade?reason=mock" className="mt-5 inline-flex min-h-11 items-center rounded bg-copper px-5 text-sm font-bold text-ivory transition-calm hover:bg-copperlight">
              Unlock the library
            </Link>
          </section>
        )}

        <PaperSection title="Full-Length Papers" subtitle="Exam simulations: pressure, attempt structure, and cutoff practice." tests={fullLength} plan={plan} idByGate={idByGate} attemptMap={attemptMap} />
        <PaperSection title="Subject Drills" subtitle="Focused repair for Polity, History, Geography, and Economy." tests={drills} plan={plan} idByGate={idByGate} attemptMap={attemptMap} />
      </div>
    </div>
  )
}

function PaperSection({
  title,
  subtitle,
  tests,
  plan,
  idByGate,
  attemptMap,
}: {
  title: string
  subtitle: string
  tests: MockCatalogItem[]
  plan: string
  idByGate: Map<number, string>
  attemptMap: Map<string, { id: string; score: number; max_score: number | null }>
}) {
  return (
    <section className="card-calm mb-8 p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-indigo">{title}</h2>
          <p className="text-sm text-inkdim">{subtitle}</p>
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-copper">{tests.length} papers</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tests.map(test => {
          const mockId = idByGate.get(test.gate_number)
          const attempt = mockId ? attemptMap.get(mockId) : null
          const locked = !canAccessPlan(plan, test.unlock_plan)
          return <PaperCard key={test.gate_number} test={test} attempt={attempt} locked={locked} />
        })}
      </div>
    </section>
  )
}

function PaperCard({
  test,
  attempt,
  locked,
}: {
  test: MockCatalogItem
  attempt?: { id: string; score: number; max_score: number | null } | null
  locked: boolean
}) {
  const href = locked
    ? '/upgrade?reason=mock'
    : attempt
    ? `/mock/gate/${test.gate_number}/result/${attempt.id}`
    : `/mock/gate/${test.gate_number}`

  return (
    <Link
      href={href}
      className={`rounded-lg border p-4 transition-calm ${
        locked ? 'border-linen bg-ivory/60 opacity-75 hover:border-copper/30' : 'border-copper/30 bg-ivory hover:border-copper'
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-inkdim/70">#{test.gate_number.toString().padStart(2, '0')}</p>
          <h3 className="mt-1 line-clamp-2 text-sm font-black leading-tight text-slate900">
            {test.title.replace(/^(Paper|Drill) \d+ — /, '')}
          </h3>
        </div>
        <span className={`rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
          locked ? 'bg-linen text-inkdim/60' : 'bg-copper/10 text-copper'
        }`}>
          {locked ? 'Locked' : attempt ? 'Report' : 'Start'}
        </span>
      </div>
      <div className="flex flex-wrap gap-2 text-[11px] text-inkdim">
        <span>{test.test_type === 'full_length' ? 'Full GS' : test.section}</span>
        <span>{test.total_questions} Qs</span>
        <span>{test.duration_mins} min</span>
        <span>{test.max_score} marks</span>
      </div>
      {attempt && (
        <p className="mt-3 font-mono text-xs font-bold text-sage">
          Score {attempt.score}/{attempt.max_score ?? test.max_score}
        </p>
      )}
    </Link>
  )
}
