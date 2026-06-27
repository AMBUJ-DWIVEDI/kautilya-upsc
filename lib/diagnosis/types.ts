// ============================================================
// KAUTILYA UPSC — Diagnosis Instrument Types
// 60-card full instrument, with a curated 40-card Scout subset.
// Dimensions score silently; nothing here is mirrored back raw.
// ============================================================

/** The 13 numeric dimensions weights can touch (0–100 after clamping).
 *  attempt_pressure is COMPUTED in scoring.ts, never weighted directly. */
export type Dimension =
  | 'purpose_intensity'
  | 'anchor_strength'
  | 'emotional_volatility'
  | 'cognitive_clarity'
  | 'execution_friction'
  | 'distraction_risk'
  | 'marathon_consistency'
  | 'recovery_speed'
  | 'prelims_nerve'
  | 'mains_stamina'
  | 'resource_chaos'
  | 'identity_fusion'
  | 'external_pressure'

export type StagePattern =
  | 'FRESH'
  | 'PRELIMS_WALL'
  | 'MAINS_PLATEAU'
  | 'INTERVIEW_EDGE'
  | 'CLEARED_LOWER'
  | 'RETURNING'

export type PurposeType =
  | 'SERVICE'
  | 'RESTORATION'
  | 'ESCAPE'
  | 'STATUS'
  | 'PROOF'
  | 'UNTESTED'

export type SelfBeliefType = 'high' | 'medium' | 'low' | 'volatile'

/** Factual profile fields harvested by L1 — used in math, NEVER mirrored back as labels. */
export interface ProfileFacts {
  attempts_taken?: number
  attempts_mains?: number
  prep_years?: number
  employed?: boolean
  age?: number
  optional_subject?: string
}

export interface CardOption {
  key: string
  label: string
  /** Additive deltas applied to the silent dimensions. */
  weights?: Partial<Record<Dimension, number>>
  /** Factual routing — enums, flags, profile facts, belief type. */
  sets?: {
    stage_pattern?: StagePattern
    purpose_type?: PurposeType
    self_belief?: SelfBeliefType
    /** Additive post-compute pressure nudge; attempt_pressure is still never weighted directly. */
    attempt_pressure_delta?: number
    flags?: string[]
    profile?: ProfileFacts
  }
}

export type CardLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export interface Card {
  id: string                 // 'L4-02'
  level: CardLevel
  question: string
  microcopy?: string
  /** Reserved for future free-text diagnosis cards. Identity capture lives before the diagnosis scan. */
  input?: 'text'
  placeholder?: string
  options: CardOption[]
}

/** Answers map: card id → selected option key (or free text for input cards). */
export type Answers = Record<string, string>

/** The full silent score sheet produced by scoring.ts. */
export interface HiddenScores {
  purpose_intensity: number
  anchor_strength: number
  emotional_volatility: number
  cognitive_clarity: number
  execution_friction: number
  distraction_risk: number
  self_belief_type: SelfBeliefType
  marathon_consistency: number
  recovery_speed: number
  prelims_nerve: number
  mains_stamina: number
  attempt_pressure: number
  resource_chaos: number
  identity_fusion: number
  external_pressure: number
  stage_pattern: StagePattern
  purpose_type: PurposeType
  flags: string[]
}

export type ArchetypeId =
  | 'COMEBACK_WARRIOR'
  | 'PRELIMS_TRAP_SCHOLAR'
  | 'WORKING_PROFESSIONAL_SPLITTER'
  | 'FRAGMENTED_MAXIMALIST'
  | 'FIRST_FLIGHT_IDEALIST'

export type WarPatternTag =
  | 'NOTES_HOARDER'
  | 'MAINS_AVOIDER'
  | 'NEWSPAPER_COLLECTOR'
  | 'REVISION_COLLAPSER'
  | 'STRATEGY_CONSUMER'

export interface DiagnosisOutcome {
  scores: HiddenScores
  facts: ProfileFacts
  archetype: ArchetypeId
  warPatternTags: WarPatternTag[]
  /** Includes routing flags such as V11_CANDIDATE for non-launch wounds. */
  storedTags: string[]
  integrationScore: number
}

export type DiagnosisPhase =
  | { type: 'intro' }
  | { type: 'level-start'; level: CardLevel }
  | { type: 'card'; index: number }
  | { type: 'generating' }
