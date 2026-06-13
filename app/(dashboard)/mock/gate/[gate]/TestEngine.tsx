'use client'

import { useReducer, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { APP } from '@/lib/config'
import type { ClientQuestion, Answers, Option, Subject } from '@/lib/mock/types'
import { SUBJECT_META, FORMAT_LABELS } from '@/lib/mock/types'
import type { MockCatalogItem } from '@/lib/mock/catalog'
import { track } from '@/lib/analytics'

type Phase = 'instructions' | 'active' | 'submitting' | 'done'

interface State {
  phase: Phase
  currentIdx: number
  answers: Answers
  timeLeft: number
  qStartTime: number
  attemptId: string | null
}

type Action =
  | { type: 'START' }
  | { type: 'NAV'; toIdx: number; fromQId: string; toQId: string; now: number }
  | { type: 'CHOOSE'; qId: string; option: Option }
  | { type: 'CLEAR'; qId: string }
  | { type: 'MARK'; qId: string }
  | { type: 'SURE'; qId: string; sure: boolean }
  | { type: 'TICK' }
  | { type: 'BEGIN_SUBMIT' }
  | { type: 'DONE'; attemptId: string }
  | { type: 'RESTORE'; data: Pick<State, 'answers' | 'timeLeft' | 'currentIdx'> }

const OPTIONS: Option[] = ['A', 'B', 'C', 'D']

function initState(questions: ClientQuestion[], durationMins: number): State {
  const answers: Answers = Object.fromEntries(
    questions.map(q => [q.question_id, { choice: null, marked: false, sure: null, time_sec: 0, visits: 0 }]),
  )
  return {
    phase: 'instructions',
    currentIdx: 0,
    answers,
    timeLeft: durationMins * 60,
    qStartTime: 0,
    attemptId: null,
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START':
      return { ...state, phase: 'active', qStartTime: Date.now() }
    case 'NAV': {
      const elapsed = Math.max(0, Math.round((action.now - state.qStartTime) / 1000))
      const prev = state.answers[action.fromQId]
      return {
        ...state,
        currentIdx: action.toIdx,
        qStartTime: action.now,
        answers: {
          ...state.answers,
          [action.fromQId]: { ...prev, time_sec: prev.time_sec + elapsed },
          [action.toQId]: {
            ...state.answers[action.toQId],
            visits: state.answers[action.toQId].visits + 1,
          },
        },
      }
    }
    case 'CHOOSE': {
      const s = state.answers[action.qId]
      return { ...state, answers: { ...state.answers, [action.qId]: { ...s, choice: action.option } } }
    }
    case 'CLEAR': {
      const s = state.answers[action.qId]
      return { ...state, answers: { ...state.answers, [action.qId]: { ...s, choice: null, sure: null } } }
    }
    case 'MARK': {
      const s = state.answers[action.qId]
      return { ...state, answers: { ...state.answers, [action.qId]: { ...s, marked: !s.marked } } }
    }
    case 'SURE': {
      const s = state.answers[action.qId]
      return { ...state, answers: { ...state.answers, [action.qId]: { ...s, sure: action.sure } } }
    }
    case 'TICK':
      if (state.timeLeft <= 1) return { ...state, timeLeft: 0, phase: 'submitting' }
      return { ...state, timeLeft: state.timeLeft - 1 }
    case 'BEGIN_SUBMIT':
      return { ...state, phase: 'submitting' }
    case 'DONE':
      return { ...state, phase: 'done', attemptId: action.attemptId }
    case 'RESTORE':
      return { ...state, ...action.data }
    default:
      return state
  }
}

function fmtTime(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0')
  const s = (sec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function qBoxClass(isCurrent: boolean, ans: Answers[string]): string {
  const base = 'flex h-8 w-8 items-center justify-center rounded border text-xs font-mono transition-calm'
  if (isCurrent) return `${base} border-copper text-copper ring-1 ring-copper`
  if (ans.choice && ans.marked) return `${base} border-indigo bg-indigo/10 text-indigo`
  if (ans.choice) return `${base} border-sage bg-sage/15 text-sage`
  if (ans.marked) return `${base} border-indigo/60 bg-indigo/5 text-indigo`
  if (ans.visits > 0) return `${base} border-clay/50 bg-clay/5 text-clay`
  return `${base} border-linen text-inkdim/60`
}

function buildSections(questions: ClientQuestion[]) {
  const sections: Array<{ key: Subject; label: string; start: number; end: number }> = []
  questions.forEach((q, index) => {
    const existing = sections.find(sec => sec.key === q.subject)
    if (existing) {
      existing.end = index
    } else {
      sections.push({
        key: q.subject,
        label: SUBJECT_META[q.subject].label,
        start: index,
        end: index,
      })
    }
  })
  return sections
}

interface Props {
  gate: number
  questions: ClientQuestion[]
  testMeta: MockCatalogItem
}

export default function TestEngine({ gate, questions, testMeta }: Props) {
  const router = useRouter()
  const storageKey = `kautilya_paper_${gate}_progress`
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [state, dispatch] = useReducer(reducer, undefined, () => initState(questions, testMeta.duration_mins))
  const { phase, currentIdx, answers, timeLeft } = state
  const currentQ = questions[currentIdx]
  const sections = buildSections(questions)
  const { perQuestion, negative } = APP.exam.prelimsGS

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const saved = JSON.parse(raw) as Partial<State>
        if (saved.phase === 'active' && saved.answers && saved.timeLeft && saved.currentIdx != null) {
          dispatch({ type: 'RESTORE', data: { answers: saved.answers, timeLeft: saved.timeLeft, currentIdx: saved.currentIdx } })
        }
      }
    } catch {}
  }, [storageKey])

  useEffect(() => {
    if (phase === 'active') {
      localStorage.setItem(storageKey, JSON.stringify({ phase, answers, timeLeft, currentIdx }))
    }
  }, [phase, answers, timeLeft, currentIdx, storageKey])

  useEffect(() => {
    if (phase !== 'active') {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(() => dispatch({ type: 'TICK' }), 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase])

  const handleSubmit = useCallback(async () => {
    track('mock_submitted', { gate, test_type: testMeta.test_type, time_minutes: Math.round((testMeta.duration_mins * 60 - timeLeft) / 60) })
    try {
      const res = await fetch('/api/mock/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gate,
          answers,
          time_minutes: (testMeta.duration_mins * 60 - timeLeft) / 60,
        }),
      })
      const data = await res.json() as { attempt_id?: string; error?: string }
      if (data.attempt_id) {
        dispatch({ type: 'DONE', attemptId: data.attempt_id })
      }
    } catch (err) {
      console.error('Submit failed:', err)
    }
  }, [gate, testMeta.test_type, testMeta.duration_mins, timeLeft, answers])

  useEffect(() => {
    if (phase === 'submitting') void handleSubmit()
  }, [phase, handleSubmit])

  useEffect(() => {
    if (phase === 'done' && state.attemptId) {
      localStorage.removeItem(storageKey)
      router.push(`/mock/gate/${gate}/result/${state.attemptId}`)
    }
  }, [phase, state.attemptId, gate, router, storageKey])

  const navTo = useCallback((toIdx: number) => {
    if (toIdx === currentIdx || toIdx < 0 || toIdx >= questions.length) return
    dispatch({
      type: 'NAV',
      toIdx,
      fromQId: questions[currentIdx].question_id,
      toQId: questions[toIdx].question_id,
      now: Date.now(),
    })
  }, [currentIdx, questions])

  function confirmSubmit() {
    const unanswered = questions.filter(q => !answers[q.question_id]?.choice).length
    const msg = unanswered > 0
      ? `${unanswered} questions are blank. Blank costs nothing; wrong leaks ${negative}. Seal this attempt anyway?`
      : 'Seal this attempt? Answers are final after submission.'
    if (confirm(msg)) dispatch({ type: 'BEGIN_SUBMIT' })
  }

  const answered = Object.values(answers).filter(a => a.choice !== null).length
  const marked = Object.values(answers).filter(a => a.marked).length

  if (phase === 'instructions') {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="card-calm copper-border w-full max-w-lg p-8">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-copper">
            {testMeta.test_type === 'full_length' ? `${APP.brand.exam} Prelims GS` : `${testMeta.section} Drill`}
          </p>
          <h1 className="heading-cinzel mb-6 text-2xl font-bold text-indigo">
            {testMeta.title}
          </h1>

          <div className="mb-6 grid grid-cols-2 gap-3">
            {[
              { label: 'Signals', value: String(questions.length) },
              { label: 'Duration', value: `${testMeta.duration_mins} min` },
              { label: 'Max signal', value: String(testMeta.max_score) },
              { label: 'Marks / leak', value: `+${perQuestion} / −${negative}` },
            ].map(item => (
              <div key={item.label} className="rounded-lg bg-parchment p-3">
                <p className="mb-1 text-xs text-inkdim">{item.label}</p>
                <p className="font-mono text-lg text-copper">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mb-8 space-y-2 text-sm text-inkdim">
            <p>Declare each answer as a sure shot or a calculated gamble — the system reads your attempt structure, not just your score.</p>
            <p>Blank costs nothing. Wrong leaks −{negative}. Price your gambles accordingly.</p>
            {testMeta.test_type === 'full_length' && (
              <p>Full mocks are best attempted on laptop for accurate timing and navigation.</p>
            )}
            <p>The timer auto-submits at {testMeta.duration_mins}:00. Progress is auto-saved in your browser.</p>
          </div>

          <button
            onClick={() => { track('mock_started', { gate, test_type: testMeta.test_type }); dispatch({ type: 'START' }) }}
            className="w-full rounded-lg bg-copper py-4 font-bold tracking-widest text-ivory transition-calm hover:bg-copperlight"
          >
            Enter Mock Arena
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'submitting' || phase === 'done') {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-2 border-copper border-t-transparent" />
          <p className="heading-cinzel tracking-widest text-copper">
            Reading your attempt structure...
          </p>
          <p className="text-sm text-inkdim">
            Reading {answered} answers. Mapping the leaks.
          </p>
        </div>
      </div>
    )
  }

  const timerColor = timeLeft < 600 ? 'text-clay' : 'text-indigo'
  const ans = answers[currentQ.question_id]

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between border-b border-linen px-4 py-2">
        <div className="flex items-center gap-4">
          <span className="heading-cinzel hidden text-sm tracking-widest text-copper sm:block">
            Paper {gate}
          </span>
          <span className="text-xs text-inkdim">
            {answered}/{questions.length} answered · {marked} marked for review
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className={`font-mono text-xl font-bold ${timerColor}`}>{fmtTime(timeLeft)}</span>
          <button
            onClick={confirmSubmit}
            className="rounded bg-copper px-4 py-1.5 text-xs font-bold tracking-wide text-ivory transition-calm hover:bg-copperlight"
          >
            Seal Attempt
          </button>
        </div>
      </div>

      {sections.length > 1 && (
        <div className="flex shrink-0 overflow-x-auto border-b border-linen">
          {sections.map(sec => {
            const active = currentIdx >= sec.start && currentIdx <= sec.end
            const secAnswered = questions.slice(sec.start, sec.end + 1).filter(q => answers[q.question_id]?.choice !== null).length
            const secTotal = sec.end - sec.start + 1
            return (
              <button
                key={sec.key}
                onClick={() => navTo(sec.start)}
                className={`flex-1 whitespace-nowrap border-b-2 px-3 py-2 text-xs transition-calm ${
                  active ? 'border-copper text-copper' : 'border-transparent text-inkdim hover:text-slate900'
                }`}
              >
                <span className="hidden sm:inline">{sec.label}</span>
                <span className="sm:hidden">{sec.key}</span>
                <span className="ml-1 text-inkdim">({secAnswered}/{secTotal})</span>
              </button>
            )
          })}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-8">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs text-inkdim">Q{currentQ.num}</span>
            <span className="text-xs text-inkdim">{currentQ.topic}</span>
            <span className="rounded-full border border-linen px-2 py-0.5 text-xs text-inkdim">
              {FORMAT_LABELS[currentQ.format]}
            </span>
            <span className={`rounded-full border px-2 py-0.5 text-xs ${
              currentQ.difficulty === 'Easy' ? 'border-sage/40 text-sage' :
              currentQ.difficulty === 'Medium' ? 'border-copper/40 text-copper' :
              'border-clay/40 text-clay'
            }`}>
              {currentQ.difficulty}
            </span>
            <span className="ml-auto text-xs text-inkdim/60">~{currentQ.expected_time_sec}s</span>
          </div>

          <div className="card-calm mb-6 rounded-xl p-5">
            <p className="note-surface whitespace-pre-wrap text-base leading-relaxed text-slate900">{currentQ.text}</p>
            {currentQ.statements && currentQ.statements.length > 0 && (
              <ol className="note-surface mt-4 space-y-2 border-l-2 border-copper/30 pl-4 text-[15px] text-slate900">
                {currentQ.statements.map((st, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="shrink-0 font-mono text-xs text-copper">
                      {currentQ.format === 'match_pairs' || currentQ.format === 'assertion_reason' ? '' : `${i + 1}.`}
                    </span>
                    <span>{st}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="mb-5 space-y-3">
            {OPTIONS.map(opt => {
              const selected = ans?.choice === opt
              return (
                <button
                  key={opt}
                  onClick={() => dispatch({ type: 'CHOOSE', qId: currentQ.question_id, option: opt })}
                  className={`w-full rounded-xl border p-4 text-left transition-calm ${
                    selected
                      ? 'border-copper bg-copper/10 text-slate900'
                      : 'border-linen bg-ivory text-inkdim hover:border-copper/40 hover:text-slate900'
                  }`}
                >
                  <span className={`mr-3 font-mono font-bold ${selected ? 'text-copper' : 'text-inkdim'}`}>
                    {opt}.
                  </span>
                  {currentQ.options[opt]}
                </button>
              )
            })}
          </div>

          {/* Sure / gamble declaration — feeds Guessing Discipline analytics */}
          {ans?.choice && (
            <div className="mb-6 flex items-center gap-3">
              <span className="text-xs text-inkdim">This answer is a</span>
              <button
                onClick={() => dispatch({ type: 'SURE', qId: currentQ.question_id, sure: true })}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-calm ${
                  ans.sure === true ? 'border-sage bg-sage/15 text-sage' : 'border-linen text-inkdim hover:border-sage/50'
                }`}
              >
                Sure shot
              </button>
              <button
                onClick={() => dispatch({ type: 'SURE', qId: currentQ.question_id, sure: false })}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-calm ${
                  ans.sure === false ? 'border-copper bg-copper/10 text-copper' : 'border-linen text-inkdim hover:border-copper/50'
                }`}
              >
                Calculated gamble
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => navTo(currentIdx - 1)} disabled={currentIdx === 0} className="rounded-lg border border-linen px-4 py-2 text-sm text-inkdim transition-calm hover:border-inkdim disabled:opacity-30">
              Previous
            </button>
            <button onClick={() => dispatch({ type: 'CLEAR', qId: currentQ.question_id })} className="rounded-lg border border-linen px-4 py-2 text-sm text-inkdim transition-calm hover:border-clay/40 hover:text-clay">
              Clear response
            </button>
            <button onClick={() => dispatch({ type: 'MARK', qId: currentQ.question_id })} className={`rounded-lg border px-4 py-2 text-sm transition-calm ${
              ans?.marked
                ? 'border-indigo bg-indigo/10 text-indigo'
                : 'border-linen text-inkdim hover:border-indigo/50 hover:text-indigo'
            }`}>
              {ans?.marked ? 'Marked for review' : 'Mark for review'}
            </button>
            <button onClick={() => navTo(currentIdx + 1)} disabled={currentIdx === questions.length - 1} className="ml-auto rounded-lg border border-copper/40 bg-copper/10 px-4 py-2 text-sm text-copper transition-calm hover:bg-copper/20 disabled:opacity-30">
              Save & Next
            </button>
          </div>
        </div>

        <div className="hidden w-56 shrink-0 flex-col overflow-y-auto border-l border-linen p-4 lg:flex">
          <p className="mb-3 text-xs uppercase tracking-wide text-inkdim">Question palette</p>
          {sections.map(sec => (
            <div key={sec.key} className="mb-4">
              <p className="mb-2 font-mono text-xs text-inkdim">{sec.key}</p>
              <div className="grid grid-cols-5 gap-1">
                {questions.slice(sec.start, sec.end + 1).map((q, i) => {
                  const idx = sec.start + i
                  return (
                    <button
                      key={q.question_id}
                      onClick={() => navTo(idx)}
                      title={`Q${q.num}: ${q.topic}`}
                      className={qBoxClass(idx === currentIdx, answers[q.question_id])}
                    >
                      {q.num}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="shrink-0 overflow-x-auto border-t border-linen p-2 lg:hidden">
        <div className="flex w-max gap-1">
          {questions.map((q, idx) => (
            <button key={q.question_id} onClick={() => navTo(idx)} className={qBoxClass(idx === currentIdx, answers[q.question_id])}>
              {q.num}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
