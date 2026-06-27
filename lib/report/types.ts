// ============================================================
// KAUTILYA — Diagnosis Command Report (AI narrative layer)
// The silent scoring is rule-based (lib/diagnosis/scoring.ts).
// This is the personalised narrative the gateway generates ON TOP
// of those scores. One cached row per user per depth.
// ============================================================

export interface CognitiveDomain {
  score: number // 0–100
  label: string // e.g. "Strong under fire" | "Unstable but trainable"
  summary: string // one personalised sentence
}

export interface ReportContent {
  // 1 — Archetype
  archetype: string // human name, e.g. "The Prelims-Trap Scholar"
  archetype_tagline: string // one evocative line

  // 2 — Modus Operandi: the sharpest "you" line. Must make them feel seen.
  modus_operandi: string

  // 3 — Cognitive Map (4 UPSC engines)
  cognitive_map: {
    clarity_engine: CognitiveDomain // cognitive_clarity
    consistency_engine: CognitiveDomain // marathon_consistency / discipline
    pressure_engine: CognitiveDomain // prelims_nerve + emotional_volatility
    integration_engine: CognitiveDomain // 100 - resource_chaos
  }

  // 4 — Functional Flow: 5–7 steps describing their specific prep loop
  functional_flow: string[]

  // Structured evidence introduced by the 40/60-card instrument.
  // Optional so historical cached reports remain renderable.
  target_profile?: {
    post: string
    rank: string
    score: string
  }

  emotional_vault?: {
    primary_trigger: string
    pressure_story: string
    protection_rule: string
  }

  anchor_vault?: {
    human_anchor: string
    anchor_role: string
    character_anchor: string
    deepest_motivator: string
    return_point: string
  }

  operating_profile?: {
    rhythm: string
    starts_best_when: string
    sustained_by: string
    disrupted_by: string
    recovery_protocol: string
    protected_environment: string
  }

  // 5 — Stabilization Layer
  stabilization_layer: {
    layer: 'Structure' | 'Heart' | 'Meaning' | 'Silence' | 'Body'
    why: string
    prescriptions: string[] // 4–5 specific, actionable
  }

  // 6 — Strengths
  strengths: Array<{ title: string; detail: string }>

  // 7 — Vulnerabilities
  vulnerabilities: Array<{ title: string; correction: string }>

  // 8 — Anchor Card (the daily identity contract)
  anchor_card: {
    fighting_for: string
    must_protect: string
    must_prove: string
    must_become: string
    biggest_enemy: string
    daily_command: string
    warning: string
    comeback_line: string
  }

  // 9 — Prelims Verdict (where they stand vs the gate)
  prelims_verdict: {
    stage: string // human label for stage_pattern
    integration_score: number // 0–100 (the one user-visible meta-metric)
    main_leak: string
    focus_subject: string // Polity | History | Geography | Economy | ...
  }

  // 10 — 7-Day Attack Plan
  attack_plan: Array<{
    day: number
    focus: string
    tasks: string[]
  }>

  // 11 — Personal Laws
  personal_laws: Array<{
    law_name: string
    law: string
    detail: string
  }>

  // 12 — Daily Command: ONE line they see every morning
  daily_command: string
}
