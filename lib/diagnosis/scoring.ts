// ============================================================
// KAUTILYA UPSC — Diagnosis Scoring
// Aggregates option weights into the 15 silent dimensions,
// computes attempt_pressure, and extracts factual profile fields.
// ============================================================

import { CARDS } from './cards'
import { APP } from '@/lib/config'
import type {
  Answers, Dimension, HiddenScores, ProfileFacts,
  SelfBeliefType, StagePattern, PurposeType,
} from './types'

function clamp(v: number): number {
  return Math.min(100, Math.max(0, Math.round(v)))
}

/** Neutral starting points before option deltas are applied.
 *  resource_chaos starts at 0 because L4-02 maps source-count directly onto it. */
const BASELINES: Record<Dimension, number> = {
  purpose_intensity: 40,
  anchor_strength: 40,
  emotional_volatility: 30,
  cognitive_clarity: 45,
  execution_friction: 30,
  distraction_risk: 25,
  marathon_consistency: 45,
  recovery_speed: 50,
  prelims_nerve: 50,
  mains_stamina: 40,
  resource_chaos: 0,
  identity_fusion: 25,
  external_pressure: 25,
}

/**
 * attempt_pressure is COMPUTED, never declared.
 *
 * Formula (documented for audit):
 *   attemptsUsedPct = attempts_taken / APP.exam.attemptsGeneral          (0..1, capped)
 *   ageUsedPct      = max(0, age - 21) / (APP.exam.ageCapGeneral - 21)  (0..1, capped)
 *   pressure        = 100 * (0.55 * attemptsUsedPct + 0.45 * ageUsedPct)
 *
 * Rationale: burned attempts press harder than the calendar (an aspirant at 24
 * with 4 attempts gone is under more pressure than one at 30 with 1 attempt),
 * so attempts carry slightly more weight. Past the general age cap the age term
 * saturates at 1 — category extensions change eligibility, not felt pressure.
 */
export function computeAttemptPressure(attemptsTaken: number, age: number | undefined): number {
  const attemptsUsedPct = Math.min(1, Math.max(0, attemptsTaken) / APP.exam.attemptsGeneral)
  const ageSpan = APP.exam.ageCapGeneral - 21
  const ageUsedPct = age == null ? 0.4 : Math.min(1, Math.max(0, age - 21) / ageSpan)
  return clamp(100 * (0.55 * attemptsUsedPct + 0.45 * ageUsedPct))
}

/** The ONE user-visible meta-metric. resource_chaos inverted. */
export function integrationScore(resourceChaos: number): number {
  return clamp(100 - resourceChaos)
}

export interface ScoredDiagnosis {
  scores: HiddenScores
  facts: ProfileFacts
}

export function calculateHiddenScores(answers: Answers): ScoredDiagnosis {
  const dims = { ...BASELINES }
  const facts: ProfileFacts = {}
  const flags = new Set<string>()
  let stage: StagePattern = 'FRESH'
  let purpose: PurposeType = 'UNTESTED'
  let belief: SelfBeliefType = 'medium'
  let pressureDelta = 0

  for (const card of CARDS) {
    const answer = answers[card.id]
    if (!answer || card.input === 'text') continue
    const option = card.options.find(o => o.key === answer)
    if (!option) continue

    if (option.weights) {
      for (const [dim, delta] of Object.entries(option.weights) as [Dimension, number][]) {
        dims[dim] += delta
      }
    }
    if (option.sets) {
      if (option.sets.stage_pattern) stage = option.sets.stage_pattern
      if (option.sets.purpose_type) purpose = option.sets.purpose_type
      if (option.sets.self_belief) belief = option.sets.self_belief
      if (typeof option.sets.attempt_pressure_delta === 'number') {
        pressureDelta += option.sets.attempt_pressure_delta
      }
      option.sets.flags?.forEach(f => flags.add(f))
      if (option.sets.profile) Object.assign(facts, option.sets.profile)
    }
  }

  const attempt_pressure = computeAttemptPressure(facts.attempts_taken ?? 0, facts.age)

  // ATTEMPT_MATH (result-day attempt arithmetic) amplifies computed pressure —
  // the aspirant is already running the formula in their head.
  const pressureAmplified = clamp(
    attempt_pressure +
    pressureDelta +
    (flags.has('ATTEMPT_MATH') ? 10 : 0),
  )

  const scores: HiddenScores = {
    purpose_intensity: clamp(dims.purpose_intensity),
    anchor_strength: clamp(dims.anchor_strength),
    emotional_volatility: clamp(dims.emotional_volatility),
    cognitive_clarity: clamp(dims.cognitive_clarity),
    execution_friction: clamp(dims.execution_friction),
    distraction_risk: clamp(dims.distraction_risk),
    self_belief_type: belief,
    marathon_consistency: clamp(dims.marathon_consistency),
    recovery_speed: clamp(dims.recovery_speed),
    prelims_nerve: clamp(dims.prelims_nerve),
    mains_stamina: clamp(dims.mains_stamina),
    attempt_pressure: pressureAmplified,
    resource_chaos: clamp(dims.resource_chaos),
    identity_fusion: clamp(dims.identity_fusion),
    external_pressure: clamp(dims.external_pressure),
    stage_pattern: stage,
    purpose_type: purpose,
    flags: [...flags],
  }

  return { scores, facts }
}
