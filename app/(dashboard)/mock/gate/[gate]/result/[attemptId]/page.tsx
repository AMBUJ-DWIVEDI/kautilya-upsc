import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { SubjectResult, WeakTopic, ScoreLeak, GuessingDiscipline, EliminationAnalysis } from '@/lib/mock/types'
import { getVerdict } from '@/lib/mock/scoring'
import { APP } from '@/lib/config'

interface Props {
  params: Promise<{ gate: string; attemptId: string }>
}

interface ReportContent {
  type: string
  gate: number
  test_type?: string
  section?: string | null
  duration_mins?: number
  total_questions?: number
  score: number
  max_score: number
  accuracy_pct: number
  attempt_rate_pct: number
  time_minutes: number
  negative_loss: number
  easy_missed: number
  hard_solved: number
  verdict: string
  verdict_desc: string
  sections: SubjectResult[]
  leak_breakdown: Record<ScoreLeak, number>
  weak_topics: WeakTopic[]
  guessing?: GuessingDiscipline
  elimination?: EliminationAnalysis
  seven_day_plan: string[]
  at: string
  question_summary: {
    id: string; num: number; subject: string; topic: string
    format?: string; difficulty: string; correct: boolean; unattempted: boolean
    choice: string | null; sure?: boolean | null; answer: string; marks: number
    time_sec: number; time_trap: boolean; leak: ScoreLeak | null
    elimination_miss?: boolean; elimination_path?: string | null
  }[]
}

export default async function ResultPage({ params }: Props) {
  const { gate: gateStr, attemptId } = await params
  const gate = parseInt(gateStr, 10)
  const { negative } = APP.exam.prelimsGS

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: report, error }, { data: noteLinks }] = await Promise.all([
    supabase
      .from('diagnosis_reports')
      .select('report_content, generated_at')
      .eq('attempt_id', attemptId)
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('question_note_links')
      .select(`note_id, question_id, link_type, smart_notes!inner(id, slug, topic, section, category, high_yield, status)`)
      .eq('smart_notes.status', 'published')
      .limit(6),
  ])

  if (error || !report) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center text-inkdim">
          <p className="mb-2">Result not found.</p>
          <Link href="/mock" className="text-sm text-copper hover:underline">← Back to the Paper Library</Link>
        </div>
      </div>
    )
  }

  const r = report.report_content as ReportContent
  const { verdict } = getVerdict(r.score, r.max_score)
  const totalQuestions = r.total_questions ?? r.question_summary?.length ?? APP.exam.prelimsGS.questions
  const durationMins = r.duration_mins ?? Math.ceil(r.time_minutes || APP.exam.prelimsGS.minutes)

  const wrongQIds = new Set(
    r.question_summary.filter(q => !q.correct && !q.unattempted).map(q => q.id)
  )
  type NoteStub = { id: string; slug: string; topic: string; section: string; category: string; high_yield: boolean }
  type NoteLink = { question_id: string; link_type: string; smart_notes: NoteStub | NoteStub[] }

  const repairNotes: { question_id: string; note: NoteStub }[] = (noteLinks ?? [])
    .map(l => {
      const raw = l as unknown as NoteLink
      const note = Array.isArray(raw.smart_notes) ? raw.smart_notes[0] : raw.smart_notes
      return { question_id: raw.question_id, note }
    })
    .filter(l => l.note && wrongQIds.has(l.question_id))
    .reduce((acc: { question_id: string; note: NoteStub }[], l) => {
      if (!acc.some(a => a.note.id === l.note.id)) acc.push(l)
      return acc
    }, [])
    .slice(0, 4)

  const pct = r.max_score > 0 ? r.score / r.max_score : 0
  const verdictColor = pct < 0.38 ? 'text-clay' : pct < 0.47 ? 'text-copper' : 'text-sage'

  const eliminationMisses = r.question_summary.filter(q => q.elimination_miss)

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 space-y-8 px-4 py-10 sm:px-6">

      {/* ── Score Banner ── */}
      <div className="card-calm copper-border p-6 text-center sm:p-8">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-copper">
          Paper {gate} — The Verdict
        </p>
        <div className="mb-2 flex items-end justify-center gap-2">
          <span className={`font-mono text-7xl font-bold ${verdictColor}`}>
            {r.score}
          </span>
          <span className="mb-3 font-mono text-2xl text-inkdim">/{r.max_score}</span>
        </div>
        <p className={`heading-cinzel mb-2 text-xl font-bold ${verdictColor}`}>{verdict}</p>
        <p className="mx-auto max-w-md text-sm text-inkdim">{r.verdict_desc}</p>
      </div>

      {/* ── Core Metrics ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Accuracy', value: `${r.accuracy_pct}%`, dim: 'correct/attempted' },
          { label: 'Attempt Rate', value: `${r.attempt_rate_pct}%`, dim: `of ${totalQuestions} questions` },
          { label: 'Negative Loss', value: `−${r.negative_loss}`, dim: `at −${negative} per wrong` },
          { label: 'Time Used', value: `${r.time_minutes.toFixed(1)}m`, dim: `of ${durationMins} minutes` },
          { label: 'Easy Missed', value: r.easy_missed.toString(), dim: 'questions' },
          { label: 'Hard Solved', value: r.hard_solved.toString(), dim: 'questions' },
        ].map(m => (
          <div key={m.label} className="card-calm p-4 text-center">
            <p className="mb-1 text-xs text-inkdim">{m.label}</p>
            <p className="font-mono text-xl font-bold text-copper">{m.value}</p>
            <p className="mt-1 text-xs text-inkdim">{m.dim}</p>
          </div>
        ))}
      </div>

      {/* ── Guessing Discipline (UPSC-native) ── */}
      {r.guessing && (
        <section className="card-calm p-5 sm:p-6">
          <h2 className="heading-cinzel mb-1 text-lg font-semibold text-indigo">
            Guessing Discipline
          </h2>
          <p className="mb-4 text-sm text-inkdim">
            Scored against the 47-sure / 35-gamble attempt framework. The −{negative} punishes
            miscalibration, not courage.
          </p>
          <div className="mb-4 flex items-end gap-3">
            <span className="font-mono text-5xl font-bold text-sage">{r.guessing.score}</span>
            <span className="mb-1.5 text-sm text-inkdim">/ 100</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Sure shots', value: `${r.guessing.sure_count}`, dim: `framework: ${r.guessing.ideal_sure}` },
              { label: 'Sure accuracy', value: `${r.guessing.sure_accuracy_pct}%`, dim: 'target ≥ 90%' },
              { label: 'Gambles', value: `${r.guessing.gamble_count}`, dim: `framework: ${r.guessing.ideal_gamble}` },
              { label: 'Left blank', value: `${r.guessing.blank_count}`, dim: 'costs nothing' },
            ].map(m => (
              <div key={m.label} className="rounded-lg bg-parchment p-3 text-center">
                <p className="text-xs text-inkdim">{m.label}</p>
                <p className="font-mono text-lg font-bold text-slate900">{m.value}</p>
                <p className="text-[11px] text-inkdim/70">{m.dim}</p>
              </div>
            ))}
          </div>
          <p className="note-surface mt-4 border-l-2 border-copper/40 pl-3 text-[15px] text-slate900">
            {r.guessing.verdict}
          </p>
        </section>
      )}

      {/* ── Elimination Misses (UPSC-native) ── */}
      {r.elimination && (
        <section className="card-calm p-5 sm:p-6">
          <h2 className="heading-cinzel mb-1 text-lg font-semibold text-indigo">
            Elimination Misses
          </h2>
          <p className="mb-4 text-sm text-inkdim">
            Questions a smart guesser solves from the option structure alone — that you left
            blank or got wrong. This is technique, not knowledge.
          </p>
          <div className="mb-4 flex items-end gap-3">
            <span className="font-mono text-5xl font-bold text-sage">{r.elimination.score}</span>
            <span className="mb-1.5 text-sm text-inkdim">
              / 100 · missed {r.elimination.misses} of {r.elimination.eliminable_total} eliminable
            </span>
          </div>
          {eliminationMisses.length > 0 && (
            <div className="space-y-3">
              {eliminationMisses.slice(0, 5).map(q => (
                <div key={q.id} className="rounded-lg border border-linen bg-parchment p-4">
                  <p className="text-xs font-bold text-copper">Q{q.num} · {q.topic}</p>
                  {q.elimination_path && (
                    <p className="note-surface mt-1.5 text-sm leading-6 text-slate900">
                      {q.elimination_path}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Subject Breakdown ── */}
      <section>
        <h2 className="heading-cinzel mb-4 text-lg font-semibold text-indigo">
          Subject Breakdown
        </h2>
        <div className="card-calm overflow-hidden rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-linen">
                <th className="p-3 text-left text-xs text-inkdim">Subject</th>
                <th className="p-3 text-center text-xs text-inkdim">Score</th>
                <th className="hidden p-3 text-center text-xs text-inkdim sm:table-cell">Accuracy</th>
                <th className="hidden p-3 text-center text-xs text-inkdim sm:table-cell">−ve Marks</th>
                <th className="p-3 text-right text-xs text-inkdim">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {r.sections.map(s => {
                const sPct = (s.score / s.max) * 100
                const scoreColor = sPct >= 55 ? 'text-sage' : sPct >= 38 ? 'text-copper' : 'text-clay'
                return (
                  <tr key={s.subject} className="border-b border-linen/60 last:border-0">
                    <td className="p-3">
                      <p className="text-sm text-slate900">{s.label}</p>
                      <p className="mt-0.5 text-xs text-inkdim">
                        {s.correct}✓ · {s.wrong}✗ · {s.unattempted} blank
                      </p>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`font-mono font-bold ${scoreColor}`}>{s.score}</span>
                      <span className="text-inkdim/60">/{s.max}</span>
                    </td>
                    <td className="hidden p-3 text-center text-xs text-inkdim sm:table-cell">
                      {s.accuracy_pct}%
                    </td>
                    <td className="hidden p-3 text-center text-xs text-clay sm:table-cell">
                      −{s.negative_marks}
                    </td>
                    <td className="p-3 text-right">
                      <span className={`text-xs ${scoreColor}`}>{s.verdict}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Score Leak Analysis ── */}
      <section>
        <h2 className="heading-cinzel mb-1 text-lg font-semibold text-indigo">
          Score Leak Analysis
        </h2>
        <p className="mb-4 text-sm text-inkdim">
          Every wrong answer is categorised. Fix the highest leak first.
        </p>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(r.leak_breakdown) as [ScoreLeak, number][])
            .filter(([, count]) => count > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([leak, count]) => (
              <div
                key={leak}
                className="flex items-center gap-2 rounded-lg border border-clay/25 bg-clay/5 px-3 py-2 text-sm text-clay"
              >
                <span className="font-mono font-bold">{count}</span>
                <span>{leak}</span>
              </div>
            ))}
          {Object.values(r.leak_breakdown).every(v => v === 0) && (
            <p className="text-sm text-sage">No score leaks detected — a clean attempt.</p>
          )}
        </div>
      </section>

      {/* ── Topic Weakness Map ── */}
      {r.weak_topics.length > 0 && (
        <section>
          <h2 className="heading-cinzel mb-4 text-lg font-semibold text-indigo">
            Topic Weakness Map
          </h2>
          <div className="space-y-2">
            {r.weak_topics.map(t => (
              <div key={`${t.subject}-${t.topic}`} className="card-calm flex items-center gap-4 rounded-lg p-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="truncate text-sm text-slate900">{t.topic}</span>
                    <span className="shrink-0 text-xs text-inkdim">— {t.subject}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-linen">
                      <div
                        className="h-full rounded-full bg-clay/70"
                        style={{ width: `${100 - t.accuracy_pct}%` }}
                      />
                    </div>
                    <span className="shrink-0 font-mono text-xs text-clay">
                      {t.wrong}/{t.total} wrong
                    </span>
                  </div>
                </div>
                <span className="shrink-0 text-xs text-inkdim">{t.accuracy_pct}% acc</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Repair loop: wrong answer → linked note → Repair Now ── */}
      {repairNotes.length > 0 && (
        <section className="card-calm rounded-xl border border-clay/25 p-5">
          <h2 className="heading-cinzel mb-1 text-base font-semibold text-clay">
            Repair Now
          </h2>
          <p className="mb-4 text-xs text-inkdim">
            These topics cost you marks. Read the note, mark it revised, then re-attempt.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {repairNotes.map(link => {
              const note = link.note
              return (
                <Link
                  key={note.id}
                  href={`/notes/${note.section}/${note.slug}`}
                  className="group flex items-start gap-3 rounded-lg border border-linen bg-parchment p-3 transition-calm hover:border-copper/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate900 transition-calm group-hover:text-copper">
                      {note.topic}
                    </p>
                    <p className="mt-0.5 text-xs text-inkdim">{note.category}</p>
                  </div>
                  <span className="mt-0.5 shrink-0 font-mono text-xs text-copper">
                    Repair →
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* ── 7-Day Plan ── */}
      <section className="card-calm copper-border rounded-xl p-6">
        <h2 className="heading-cinzel mb-2 text-lg font-semibold text-copper">
          Your 7-Day Repair Plan
        </h2>
        <p className="mb-5 text-sm text-inkdim">
          Built from this paper&apos;s leaks. Execute it without deviation.
        </p>
        <div className="space-y-3">
          {r.seven_day_plan.map((day, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0 font-mono text-sm text-copper">
                {(i + 1).toString().padStart(2, '0')}
              </span>
              <p className="text-sm leading-relaxed text-slate900">{day}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Question Review ── */}
      <section>
        <h2 className="heading-cinzel mb-4 text-lg font-semibold text-indigo">
          Question Review
        </h2>
        <div className="space-y-2">
          {r.question_summary.map(q => {
            const statusColor =
              q.unattempted ? 'text-inkdim/60' :
              q.correct ? 'text-sage' :
              'text-clay'
            const statusLabel =
              q.unattempted ? 'Blank' :
              q.correct ? `+${q.marks} Correct` :
              `−${negative} Wrong`

            return (
              <div
                key={q.id}
                className="card-calm flex items-center gap-3 rounded-lg p-3 text-sm"
              >
                <span className="w-8 shrink-0 font-mono text-xs text-inkdim">{q.num}</span>
                <span className="hidden w-24 shrink-0 text-xs text-inkdim sm:block">{q.subject}</span>
                <span className="flex-1 truncate text-xs text-inkdim">{q.topic}</span>
                <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs ${
                  q.difficulty === 'Easy' ? 'text-sage' :
                  q.difficulty === 'Medium' ? 'text-copper' :
                  'text-clay'
                }`}>{q.difficulty[0]}</span>
                {q.sure === true && !q.unattempted && (
                  <span className="shrink-0 text-[10px] uppercase tracking-wide text-sage" title="Declared sure">sure</span>
                )}
                {q.sure === false && !q.unattempted && (
                  <span className="shrink-0 text-[10px] uppercase tracking-wide text-copper" title="Declared gamble">gamble</span>
                )}
                {q.time_trap && (
                  <span className="shrink-0 text-xs text-indigo" title="Time trap">⏱</span>
                )}
                <span className={`shrink-0 font-mono text-xs font-bold ${statusColor}`}>
                  {statusLabel}
                </span>
                {!q.unattempted && !q.correct && (
                  <span className="shrink-0 text-xs text-inkdim">
                    Ans: <span className="font-bold text-copper">{q.answer}</span>
                    {q.choice && <span> · You: <span className="text-clay">{q.choice}</span></span>}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Footer actions ── */}
      <div className="flex items-center justify-between border-t border-linen pt-4">
        <Link href="/mock" className="text-sm text-inkdim transition-calm hover:text-copper">
          ← Paper Library
        </Link>
        <Link href="/dashboard" className="text-sm text-copper transition-calm hover:text-copperlight">
          Back to Command →
        </Link>
      </div>
    </div>
  )
}
