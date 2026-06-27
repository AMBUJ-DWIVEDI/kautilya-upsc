// ============================================================
// POST /api/generate-report
// Generates (and caches) the aspirant's KAUTILYA Command Diagnosis
// narrative on top of the rule-based silent scores.
// One row per user per depth (attempt_id NULL = the onboarding report).
// Model selection + failover handled by lib/ai/gateway.
// ============================================================

import { createClient } from '@/lib/supabase/server'
import { buildReportPrompt } from '@/lib/report/prompt'
import { findShameLanguage } from '@/lib/voice/seenLanguage'
import { resolveDiagnosisAnswers } from '@/lib/report/answers'
import { isPaidDepth, normalizeReportDepth, type ReportDepth } from '@/lib/report/depth'
import { generateJSON, GatewayError } from '@/lib/ai/gateway'
import { isPaidPlan } from '@/lib/plans'
import type { ReportContent } from '@/lib/report/types'
import type { Answers, HiddenScores, ProfileFacts } from '@/lib/diagnosis/types'
import { NextResponse, type NextRequest } from 'next/server'

function num(v: unknown, fallback = 50): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function normalizeScores(row: Record<string, unknown>): HiddenScores {
  return {
    purpose_intensity: num(row.purpose_intensity),
    anchor_strength: num(row.anchor_strength),
    emotional_volatility: num(row.emotional_volatility),
    cognitive_clarity: num(row.cognitive_clarity),
    execution_friction: num(row.execution_friction),
    distraction_risk: num(row.distraction_risk),
    self_belief_type: (row.self_belief_type as HiddenScores['self_belief_type']) ?? 'medium',
    marathon_consistency: num(row.marathon_consistency),
    recovery_speed: num(row.recovery_speed),
    prelims_nerve: num(row.prelims_nerve),
    mains_stamina: num(row.mains_stamina),
    attempt_pressure: num(row.attempt_pressure),
    resource_chaos: num(row.resource_chaos),
    identity_fusion: num(row.identity_fusion),
    external_pressure: num(row.external_pressure),
    stage_pattern: (row.stage_pattern as HiddenScores['stage_pattern']) ?? 'FRESH',
    purpose_type: (row.purpose_type as HiddenScores['purpose_type']) ?? 'UNTESTED',
    flags: [],
  }
}

async function readDepth(request: NextRequest): Promise<ReportDepth> {
  try {
    const body = (await request.json()) as { depth?: string }
    return normalizeReportDepth(body.depth)
  } catch {
    return 'free40'
  }
}

export async function POST(request: NextRequest) {
  const depth = await readDepth(request)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { data: planRow } = await supabase
    .from('users')
    .select('plan_type')
    .eq('id', user.id)
    .single()

  const paid = isPaidPlan(planRow?.plan_type)
  if (isPaidDepth(depth) && !paid) {
    return NextResponse.json(
      { error: 'Upgrade to unlock the complete 60-card report.' },
      { status: 403 },
    )
  }

  // Return the cached report if one already exists for this depth.
  const { data: existing } = await supabase
    .from('diagnosis_reports')
    .select('id, report_content')
    .eq('user_id', user.id)
    .is('attempt_id', null)
    .eq('report_depth', depth)
    .order('generated_at', { ascending: false })
    .limit(1)
    .single()

  if (existing?.report_content && Object.keys(existing.report_content).length > 0) {
    return NextResponse.json({ report: existing.report_content, cached: true })
  }

  const [{ data: profile }, { data: scores }] = await Promise.all([
    supabase
      .from('aspirant_profiles')
      .select(
        'name, diagnosis_depth, attempts_taken, attempts_mains, prep_years, employed, age, optional_subject, pillar1_data, paid_extra_data',
      )
      .eq('user_id', user.id)
      .single(),
    supabase.from('hidden_scores').select('*').eq('user_id', user.id).single(),
  ])

  if (!profile || !scores) {
    return NextResponse.json(
      { error: 'Diagnosis not found. Complete the scan first.' },
      { status: 400 },
    )
  }

  const hiddenScores = normalizeScores(scores as Record<string, unknown>)
  const facts: ProfileFacts = {
    attempts_taken: profile.attempts_taken ?? undefined,
    attempts_mains: profile.attempts_mains ?? undefined,
    prep_years: profile.prep_years ?? undefined,
    employed: profile.employed ?? undefined,
    age: profile.age ?? undefined,
    optional_subject: profile.optional_subject ?? undefined,
  }
  const archetypeId = String((scores as Record<string, unknown>).archetype ?? 'FIRST_FLIGHT_IDEALIST')
  const warPatternTags = ((scores as Record<string, unknown>).war_pattern_tags as string[]) ?? []

  // Feed the aspirant's ACTUAL answers (curated free scan or complete paid scan)
  // so the report references their real choices instead of writing from scores alone.
  const rawAnswers = {
    ...((profile.pillar1_data ?? {}) as Answers),
    ...(isPaidDepth(depth) ? ((profile.paid_extra_data ?? {}) as Answers) : {}),
  }
  const resolvedAnswers = resolveDiagnosisAnswers(rawAnswers)

  const { system, user: userMsg } = buildReportPrompt({
    scores: hiddenScores,
    archetypeId,
    facts,
    warPatternTags,
    depth,
    name: profile.name ?? undefined,
    resolvedAnswers,
  })

  let report: ReportContent
  try {
    const result = await generateJSON<ReportContent>({
      system,
      user: userMsg,
      tier: isPaidDepth(depth) ? 'paid' : 'free',
      temperature: isPaidDepth(depth) ? 0.65 : 0.7,
      maxTokens: isPaidDepth(depth) ? 5200 : 4400,
    })
    report = result.data
    const shameLeaks = findShameLanguage(JSON.stringify(report))
    if (shameLeaks.length) {
      console.warn('Seen-language guard: report contained banned terms:', shameLeaks)
    }
  } catch (err) {
    if (err instanceof GatewayError) {
      console.error('AI gateway failed:', err.attempts)
    } else {
      console.error('Report generation error:', err)
    }
    return NextResponse.json(
      { error: 'AI generation failed. Try again in a moment.' },
      { status: 502 },
    )
  }

  const { error: saveErr } = await supabase
    .from('diagnosis_reports')
    .insert({ user_id: user.id, report_content: report, report_depth: depth })

  if (saveErr) {
    console.error('Report save error:', saveErr)
  }

  await supabase
    .from('aspirant_profiles')
    .update({ anchor_generated: true })
    .eq('user_id', user.id)

  return NextResponse.json({ report })
}
