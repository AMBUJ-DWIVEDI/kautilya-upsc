import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import { calculateResult } from '@/lib/mock/scoring'
import type { PrelimsQuestion, Answers } from '@/lib/mock/types'
import { bankFileForGate, getMockCatalogItem } from '@/lib/mock/catalog'
import { canAccessPlan } from '@/lib/plans'

export async function POST(req: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // ── Parse body ──────────────────────────────────────────────────
  const body = await req.json() as {
    gate: number
    answers: Answers
    time_minutes: number
  }
  const { gate, answers, time_minutes } = body

  const staticMeta = getMockCatalogItem(gate)
  if (!gate || !answers || !staticMeta) {
    return NextResponse.json({ error: 'Missing paper or answers' }, { status: 400 })
  }

  const { data: planRow } = await supabase
    .from('users')
    .select('plan_type')
    .eq('id', user.id)
    .single()

  if (!canAccessPlan(planRow?.plan_type, staticMeta.unlock_plan)) {
    return NextResponse.json({ error: 'This paper needs Warrior.' }, { status: 403 })
  }

  // ── Load question bank (server-side — contains correct answers) ──
  let questions: PrelimsQuestion[]
  try {
    const path = join(process.cwd(), 'data', 'question-bank', bankFileForGate(gate))
    const raw = readFileSync(path, 'utf-8')
    questions = (JSON.parse(raw) as { questions: PrelimsQuestion[] }).questions
  } catch {
    return NextResponse.json({ error: `Question bank for Paper ${gate} not found` }, { status: 404 })
  }

  // ── Get mock_test_id from DB ─────────────────────────────────────
  const { data: mockTest, error: mockErr } = await supabase
    .from('mock_tests')
    .select('id, duration_mins')
    .eq('gate_number', gate)
    .single()

  if (mockErr || !mockTest) {
    return NextResponse.json({ error: 'Paper not found in DB' }, { status: 404 })
  }

  // ── Idempotency: return existing attempt if already submitted ────
  const { data: existing } = await supabase
    .from('test_attempts')
    .select('id')
    .eq('user_id', user.id)
    .eq('mock_test_id', mockTest.id)
    .limit(1)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ attempt_id: existing.id, cached: true })
  }

  // ── Score the attempt (−0.66 lives in APP.exam, applied in scoring.ts) ──
  const result = calculateResult(gate, questions, answers, user.id, time_minutes)

  // ── Save to test_attempts ────────────────────────────────────────
  const { data: attempt, error: attemptErr } = await supabase
    .from('test_attempts')
    .insert({
      user_id: user.id,
      mock_test_id: mockTest.id,
      answers,
      score: Math.round(result.score),
      max_score: result.max_score,
      accuracy: result.accuracy_pct,
      total_time_secs: Math.round(time_minutes * 60),
      section_breakdown: Object.fromEntries(result.sections.map(s => [s.subject, {
        score: s.score,
        attempted: s.attempted,
        correct: s.correct,
        wrong: s.wrong,
        unattempted: s.unattempted,
      }])),
      weak_topics: result.weak_topics,
      negative_marks: result.negative_loss,
      questions_skipped: result.questions.filter(q => q.unattempted).length,
      time_pressure_flag: time_minutes >= (mockTest.duration_mins ?? staticMeta.duration_mins) * 0.9,
    })
    .select('id')
    .single()

  if (attemptErr || !attempt) {
    console.error('test_attempts insert error:', attemptErr)
    return NextResponse.json({ error: 'Failed to save attempt' }, { status: 500 })
  }

  // ── Living profile: demonstrated dimensions from real mock behavior ──
  // Rolling average weighted by sample size, so one bad paper never defines the profile.
  const demonstrated: { dimension: string; score: number; samples: number }[] = [
    { dimension: 'elimination_discipline', score: result.elimination.score, samples: result.elimination.eliminable_total },
    { dimension: 'guessing_discipline', score: result.guessing.score, samples: result.questions.length },
  ]
  for (const d of demonstrated) {
    const { data: prior } = await supabase
      .from('demonstrated_dimensions')
      .select('score, sample_size')
      .eq('user_id', user.id)
      .eq('dimension', d.dimension)
      .maybeSingle()

    const priorScore = prior?.score ?? d.score
    const priorN = prior?.sample_size ?? 0
    const newN = priorN + d.samples
    const blended = newN > 0
      ? Math.round((priorScore * priorN + d.score * d.samples) / newN)
      : d.score

    await supabase.from('demonstrated_dimensions').upsert(
      {
        user_id: user.id,
        dimension: d.dimension,
        score: blended,
        sample_size: newN,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,dimension' },
    )
  }

  // ── Save full diagnostic to diagnosis_reports ────────────────────
  const reportContent = {
    type: 'mock_result',
    gate: result.gate,
    test_type: staticMeta.test_type,
    section: staticMeta.section,
    duration_mins: mockTest.duration_mins ?? staticMeta.duration_mins,
    total_questions: questions.length,
    score: result.score,
    max_score: result.max_score,
    accuracy_pct: result.accuracy_pct,
    attempt_rate_pct: result.attempt_rate_pct,
    time_minutes: result.time_minutes,
    negative_loss: result.negative_loss,
    easy_missed: result.easy_missed,
    hard_solved: result.hard_solved,
    verdict: result.verdict,
    verdict_desc: result.verdict_desc,
    sections: result.sections,
    leak_breakdown: result.leak_breakdown,
    weak_topics: result.weak_topics,
    guessing: result.guessing,
    elimination: result.elimination,
    seven_day_plan: result.seven_day_plan,
    at: result.at,
    question_summary: result.questions.map(r => ({
      id: r.q.question_id,
      num: r.q.num,
      subject: r.q.subject,
      topic: r.q.topic,
      format: r.q.format,
      difficulty: r.q.difficulty,
      correct: r.correct,
      unattempted: r.unattempted,
      choice: r.choice,
      sure: r.sure,
      answer: r.q.answer,
      marks: r.marks,
      time_sec: r.time_sec,
      time_trap: r.time_trap,
      leak: r.leak,
      elimination_miss: r.elimination_miss,
      elimination_path: r.elimination_miss ? r.q.elimination_path : null,
    })),
  }

  await supabase.from('diagnosis_reports').insert({
    user_id: user.id,
    attempt_id: attempt.id,
    report_depth: 'mock_result',
    report_content: reportContent,
  })

  return NextResponse.json({ attempt_id: attempt.id, score: result.score })
}
