// ============================================================
// KAUTILYA UPSC — Archetype Derivation
// MVP ships 5 archetypes. The cascade order is law.
// Non-launch wounds are flagged V11_CANDIDATE and routed to the
// nearest launch archetype; their copy ships in v1.1.
// ============================================================

import type {
  ArchetypeId, Dimension, DiagnosisOutcome, HiddenScores,
  ProfileFacts, WarPatternTag,
} from './types'
import { integrationScore } from './scoring'

export interface ArchetypeMeta {
  id: ArchetypeId
  name: string
  /** Verbatim reveal line — the wound named. Do not edit casually. */
  revealLine: string
  /** Softer variant used when identity_fusion >= 80 (design law: soften the harshest paths). */
  revealLineSoft: string
  /** The 3 dimensions highlighted at the reveal. */
  highlightDims: [Dimension, Dimension, Dimension]
}

export const ARCHETYPES: Record<ArchetypeId, ArchetypeMeta> = {
  COMEBACK_WARRIOR: {
    id: 'COMEBACK_WARRIOR',
    name: 'The Comeback Warrior',
    revealLine:
      "You didn't quit. You retreated to survive. There's a difference — and your return is the proof.",
    revealLineSoft:
      "You didn't quit. You retreated to survive. There's a difference — and your return is the proof.",
    highlightDims: ['purpose_intensity', 'recovery_speed', 'marathon_consistency'],
  },
  PRELIMS_TRAP_SCHOLAR: {
    id: 'PRELIMS_TRAP_SCHOLAR',
    name: 'The Prelims-Trap Scholar',
    revealLine:
      "You are a Mains-ranker locked outside the gate. We're not going to teach you Polity. We're going to teach you to shoot under fire.",
    revealLineSoft:
      "You are a Mains-ranker locked outside the gate. The knowledge is already yours — what we will train, gently and relentlessly, is the shot under fire.",
    highlightDims: ['cognitive_clarity', 'prelims_nerve', 'emotional_volatility'],
  },
  WORKING_PROFESSIONAL_SPLITTER: {
    id: 'WORKING_PROFESSIONAL_SPLITTER',
    name: 'The Working-Professional Splitter',
    revealLine:
      "You're fighting with one hand and you've been told that's a weakness. It's not. It's a forcing function — and forced focus beats free time.",
    revealLineSoft:
      "You're fighting with one hand and you've been told that's a weakness. It's not. It's a forcing function — and forced focus beats free time.",
    highlightDims: ['execution_friction', 'external_pressure', 'marathon_consistency'],
  },
  FRAGMENTED_MAXIMALIST: {
    id: 'FRAGMENTED_MAXIMALIST',
    name: 'The Fragmented Maximalist',
    revealLine:
      "You don't have a preparation problem. You have an integration debt — and you're paying interest in months of your life. Today the debt collection stops.",
    revealLineSoft:
      "You don't have a preparation problem. You have an integration debt. It accumulated honestly, from caring too much — and starting today, it stops growing.",
    highlightDims: ['resource_chaos', 'execution_friction', 'cognitive_clarity'],
  },
  FIRST_FLIGHT_IDEALIST: {
    id: 'FIRST_FLIGHT_IDEALIST',
    name: 'The First-Flight Idealist',
    revealLine:
      "You're walking in fresh. Good. KAUTILYA's job is to give you a veteran's map without the veteran's scars.",
    revealLineSoft:
      "You're walking in fresh. Good. KAUTILYA's job is to give you a veteran's map without the veteran's scars.",
    highlightDims: ['purpose_intensity', 'cognitive_clarity', 'distraction_risk'],
  },
}

/**
 * Centroids for the fallback distance match — typical dimension profiles of
 * each launch archetype, derived from the cascade conditions themselves.
 * Used only when no cascade rule fires. Dimensions are on the 0–100 scale.
 */
const CENTROID_DIMS: Dimension[] = [
  'purpose_intensity', 'anchor_strength', 'emotional_volatility', 'cognitive_clarity',
  'execution_friction', 'distraction_risk', 'marathon_consistency', 'recovery_speed',
  'prelims_nerve', 'mains_stamina', 'resource_chaos', 'identity_fusion', 'external_pressure',
]

const CENTROIDS: Record<ArchetypeId, Record<Dimension, number>> = {
  COMEBACK_WARRIOR: {
    purpose_intensity: 85, anchor_strength: 55, emotional_volatility: 50, cognitive_clarity: 55,
    execution_friction: 40, distraction_risk: 35, marathon_consistency: 50, recovery_speed: 65,
    prelims_nerve: 50, mains_stamina: 45, resource_chaos: 35, identity_fusion: 55, external_pressure: 45,
  },
  PRELIMS_TRAP_SCHOLAR: {
    purpose_intensity: 65, anchor_strength: 45, emotional_volatility: 60, cognitive_clarity: 80,
    execution_friction: 40, distraction_risk: 30, marathon_consistency: 60, recovery_speed: 45,
    prelims_nerve: 30, mains_stamina: 60, resource_chaos: 35, identity_fusion: 60, external_pressure: 45,
  },
  WORKING_PROFESSIONAL_SPLITTER: {
    purpose_intensity: 60, anchor_strength: 50, emotional_volatility: 40, cognitive_clarity: 55,
    execution_friction: 65, distraction_risk: 40, marathon_consistency: 45, recovery_speed: 55,
    prelims_nerve: 50, mains_stamina: 45, resource_chaos: 40, identity_fusion: 40, external_pressure: 70,
  },
  FRAGMENTED_MAXIMALIST: {
    purpose_intensity: 55, anchor_strength: 45, emotional_volatility: 50, cognitive_clarity: 50,
    execution_friction: 65, distraction_risk: 55, marathon_consistency: 40, recovery_speed: 45,
    prelims_nerve: 45, mains_stamina: 40, resource_chaos: 85, identity_fusion: 50, external_pressure: 45,
  },
  FIRST_FLIGHT_IDEALIST: {
    purpose_intensity: 65, anchor_strength: 55, emotional_volatility: 35, cognitive_clarity: 50,
    execution_friction: 35, distraction_risk: 40, marathon_consistency: 50, recovery_speed: 55,
    prelims_nerve: 50, mains_stamina: 35, resource_chaos: 25, identity_fusion: 25, external_pressure: 35,
  },
}

function euclideanDistance(scores: HiddenScores, centroid: Record<Dimension, number>): number {
  let sum = 0
  for (const dim of CENTROID_DIMS) {
    const d = (scores[dim] - centroid[dim]) / 100 // normalize to 0..1 per dim
    sum += d * d
  }
  return Math.sqrt(sum)
}

function nearestArchetype(scores: HiddenScores): ArchetypeId {
  let best: ArchetypeId = 'FIRST_FLIGHT_IDEALIST'
  let bestDist = Infinity
  for (const id of Object.keys(CENTROIDS) as ArchetypeId[]) {
    const dist = euclideanDistance(scores, CENTROIDS[id])
    if (dist < bestDist) {
      bestDist = dist
      best = id
    }
  }
  return best
}

/** Cascade order is law. */
export function deriveArchetype(scores: HiddenScores, facts: ProfileFacts, employed: boolean): ArchetypeId {
  const attempts = facts.attempts_taken ?? 0

  if (scores.stage_pattern === 'RETURNING' && scores.purpose_intensity >= 75) {
    return 'COMEBACK_WARRIOR'
  }
  if (
    scores.stage_pattern === 'PRELIMS_WALL' && attempts >= 2 &&
    scores.cognitive_clarity >= 75 && scores.prelims_nerve <= 40
  ) {
    return 'PRELIMS_TRAP_SCHOLAR'
  }
  if (employed && scores.external_pressure >= 60) {
    return 'WORKING_PROFESSIONAL_SPLITTER'
  }
  if (scores.resource_chaos >= 80) {
    return 'FRAGMENTED_MAXIMALIST'
  }
  if (scores.stage_pattern === 'FRESH') {
    return 'FIRST_FLIGHT_IDEALIST'
  }
  return nearestArchetype(scores)
}

/** War-pattern tags from dimension thresholds. Max 3, in priority order. */
export function deriveWarPatternTags(scores: HiddenScores): WarPatternTag[] {
  const tags: WarPatternTag[] = []
  if (scores.resource_chaos >= 60 && scores.execution_friction >= 50) tags.push('NOTES_HOARDER')
  if (scores.mains_stamina <= 35) tags.push('MAINS_AVOIDER')
  // Distraction proxy on the CA cards: the NEWSPAPER_PROXY flag plus general drift.
  if (scores.flags.includes('NEWSPAPER_PROXY') && scores.distraction_risk >= 40) tags.push('NEWSPAPER_COLLECTOR')
  if (scores.marathon_consistency <= 40) tags.push('REVISION_COLLAPSER')
  if (scores.execution_friction >= 70 && scores.cognitive_clarity >= 65) tags.push('STRATEGY_CONSUMER')
  return tags.slice(0, 3)
}

export const WAR_PATTERN_LABELS: Record<WarPatternTag, { label: string; line: string }> = {
  NOTES_HOARDER: {
    label: 'Notes Hoarder',
    line: 'You collect preparation instead of doing it. The archive grows; the recall does not.',
  },
  MAINS_AVOIDER: {
    label: 'Mains Avoider',
    line: 'The blank answer page judges you, so you keep reading instead of writing. We will reverse that.',
  },
  NEWSPAPER_COLLECTOR: {
    label: 'Newspaper Collector',
    line: 'Current affairs became a stockpile, not a system. One issue a day, finished, beats six saved for later.',
  },
  REVISION_COLLAPSER: {
    label: 'Revision Collapser',
    line: 'Your first reads are strong; your second reads never arrive. Memory is scheduled from today.',
  },
  STRATEGY_CONSUMER: {
    label: 'Strategy Consumer',
    line: 'You have studied how to study more than you have studied. The watching ends here.',
  },
}

/**
 * Full outcome: archetype, tags, V11 routing flags, integration score.
 * Non-launch wounds (INTERVIEW_EDGE, MAINS_PLATEAU, CLEARED_LOWER stages, GHOST flags)
 * are detected and stored as V11_CANDIDATE; the aspirant is routed to the nearest
 * launch archetype until v1.1 copy ships.
 */
export function deriveOutcome(scores: HiddenScores, facts: ProfileFacts): DiagnosisOutcome {
  const archetype = deriveArchetype(scores, facts, facts.employed ?? false)
  const warPatternTags = deriveWarPatternTags(scores)

  const storedTags: string[] = [...warPatternTags]
  const v11Wound =
    scores.stage_pattern === 'INTERVIEW_EDGE' ||
    scores.stage_pattern === 'MAINS_PLATEAU' ||
    scores.stage_pattern === 'CLEARED_LOWER' ||
    scores.flags.includes('VETERAN_GHOST')
  if (v11Wound) storedTags.push('V11_CANDIDATE')

  return {
    scores,
    facts,
    archetype,
    warPatternTags,
    storedTags,
    integrationScore: integrationScore(scores.resource_chaos),
  }
}

/** Design law: identity_fusion >= 80 gates the harshest verdict strings. */
export function revealLineFor(outcome: DiagnosisOutcome): string {
  const meta = ARCHETYPES[outcome.archetype]
  return outcome.scores.identity_fusion >= 80 ? meta.revealLineSoft : meta.revealLine
}

export const DIMENSION_HIGHLIGHT_LABELS: Record<Dimension, string> = {
  purpose_intensity: 'Purpose Intensity',
  anchor_strength: 'Anchor Strength',
  emotional_volatility: 'Emotional Weather',
  cognitive_clarity: 'Cognitive Clarity',
  execution_friction: 'Execution Friction',
  distraction_risk: 'Distraction Exposure',
  marathon_consistency: 'Marathon Consistency',
  recovery_speed: 'Recovery Speed',
  prelims_nerve: 'Prelims Nerve',
  mains_stamina: 'Mains Stamina',
  resource_chaos: 'Integration Debt',
  identity_fusion: 'Identity Fusion',
  external_pressure: 'External Pressure',
}
