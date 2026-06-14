// ============================================================
// KAUTILYA — Report prompt builder
// Returns { system, user }. KEEP `system` stable across users
// (it is the cacheable prefix); put all per-user data in `user`.
// ============================================================

import { ARCHETYPES } from '@/lib/diagnosis/archetypes'
import type {
  ArchetypeId, HiddenScores, ProfileFacts, WarPatternTag,
} from '@/lib/diagnosis/types'
import type { ReportDepth } from '@/lib/report/depth'
import { formatAnswersForPrompt, type ResolvedAnswer } from '@/lib/report/answers'

const STAGE_LABEL: Record<string, string> = {
  FRESH: 'First serious attempt',
  PRELIMS_WALL: 'Stuck at the Prelims wall',
  MAINS_PLATEAU: 'Clears Prelims, plateaus in Mains',
  INTERVIEW_EDGE: 'Reached the interview edge',
  CLEARED_LOWER: 'Cleared a lower service, wants UPSC',
  RETURNING: 'Returning after a break',
}

const PURPOSE_LABEL: Record<string, string> = {
  SERVICE: 'Genuine service drive',
  RESTORATION: 'Restoring family honour / a setback',
  ESCAPE: 'Escaping a present situation',
  STATUS: 'Status and recognition',
  PROOF: 'Proving something to someone',
  UNTESTED: 'Motive not yet tested',
}

// The stable system prompt. Defines voice, rules, and the exact JSON schema.
const SYSTEM = `You are KAUTILYA — a strategic command intelligence for UPSC Civil Services aspirants, built by a top-ranker. You are NOT a generic study coach. You write the aspirant's personalised "Command Diagnosis" the way Chanakya would brief a future administrator: precise, unsentimental, and on their side.

VOICE & LAWS (non-negotiable):
- Make the aspirant feel SEEN, never judged. Name the wound, then arm them.
- Never shame. Never use fake urgency or scarcity. Recovery matters more than guilt.
- UPSC-native language: Prelims, Mains, optional subject, attempts, CSAT, answer-writing, current affairs, the "integration" of static + dynamic.
- A little Hinglish emotional warmth is allowed in human lines, but stay crisp.
- Speak to THIS person using their scores and facts — no horoscope generalities.
- Output is consumed by code. Return ONLY valid JSON. No markdown, no commentary.

You will receive: the archetype (with its reveal line), 15 silent dimensions (0–100), the stage pattern, the purpose type, behavioural war-pattern tags, factual profile data (attempts, prep years, employment, optional), AND — most importantly — THE ASPIRANT'S ACTUAL ANSWERS to the diagnosis (their own chosen words across 8 levels: their journey, their why, daily reality, resources, mind under fire, emotional core, their anchor, and the mirror). Dimensions are scored silently — NEVER echo raw numbers back to the aspirant inside prose; translate them into plain insight.

PERSONALISATION LAWS (this is what separates a real diagnosis from a horoscope):
- The actual answers are your PRIMARY source. Reference the aspirant's specific choices, not generic patterns.
- modus_operandi MUST weave in at least TWO of their specific answers (e.g. their stated reason for clearing, the person whose face appears on low days, their deepest wound, their walk-away line). It must make them say "this knows me."
- anchor_card MUST use their REAL material: fighting_for / must_protect = their actual anchor person or stated purpose; biggest_enemy = their actual distraction, resource-chaos or avoidance pattern; comeback_line = tied to what kept them in the fight on their worst day. No generic placeholders.
- strengths and vulnerabilities must each point to a concrete behaviour they reported.
- personal_laws must each name a pattern THEY revealed (e.g. mock-avoidance, source-hoarding, result-week spirals, mains-paper postponing) and give the precise rule that fixes it.
- Never invent facts not grounded in their answers or scores. If something wasn't asked, infer gently from scores and say so softly.

SECTION GUIDANCE:
- cognitive_map: clarity_engine ← cognitive_clarity; consistency_engine ← marathon_consistency (+ low execution_friction); pressure_engine ← prelims_nerve + mains_stamina, lowered by emotional_volatility; integration_engine ← 100 - resource_chaos.
- stabilization_layer: Structure (chaotic, no routine) | Heart (numb, burnt out, guilt-driven) | Meaning (unclear why) | Silence (overthinking, strategy-consuming, analysis paralysis) | Body (sleep/anxiety dysregulation). Pick the ONE their answers point to.
- attack_plan: 7 days anchored to their weakest engine and their stage. Day 1 easy to rebuild momentum, Days 3–5 intensive on the real leak, Day 7 consolidation + one timed paper/mock.
- prelims_verdict.focus_subject: name the specific UPSC subject (Polity, History, Geography, Economy, Environment, Science, CSAT...) their pattern most exposes.

Return a JSON object with EXACTLY these keys:
{
  "archetype": string,
  "archetype_tagline": string,
  "modus_operandi": string,            // the single sharpest "this is how you operate" line
  "cognitive_map": {
    "clarity_engine":     { "score": number, "label": string, "summary": string },
    "consistency_engine": { "score": number, "label": string, "summary": string },
    "pressure_engine":    { "score": number, "label": string, "summary": string },
    "integration_engine": { "score": number, "label": string, "summary": string }
  },
  "functional_flow": string[],          // 5-7 steps describing their actual prep loop
  "stabilization_layer": {
    "layer": "Structure" | "Heart" | "Meaning" | "Silence" | "Body",
    "why": string,
    "prescriptions": string[]           // 4-5 specific, actionable
  },
  "strengths": [ { "title": string, "detail": string } ],          // 3-4
  "vulnerabilities": [ { "title": string, "correction": string } ], // 3-4
  "anchor_card": {
    "fighting_for": string, "must_protect": string, "must_prove": string,
    "must_become": string, "biggest_enemy": string, "daily_command": string,
    "warning": string, "comeback_line": string
  },
  "prelims_verdict": {
    "stage": string, "integration_score": number,
    "main_leak": string, "focus_subject": string
  },
  "attack_plan": [ { "day": number, "focus": string, "tasks": string[] } ], // 7 days
  "personal_laws": [ { "law_name": string, "law": string, "detail": string } ], // 3-5
  "daily_command": string               // ONE line they read every morning
}

Fill cognitive_map scores from the dimensions provided. integration_score = 100 - resource_chaos. Be specific to the archetype and the facts. Depth "paid50" = go deeper, more prescriptions, sharper laws.`

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)))
}

export interface ReportPromptInput {
  scores: HiddenScores
  archetypeId: string
  facts: ProfileFacts
  warPatternTags?: WarPatternTag[] | string[]
  depth: ReportDepth
  name?: string
  resolvedAnswers?: ResolvedAnswer[]
}

export function buildReportPrompt(input: ReportPromptInput): { system: string; user: string } {
  const { scores, archetypeId, facts, warPatternTags = [], depth, name, resolvedAnswers = [] } = input
  const meta = ARCHETYPES[archetypeId as ArchetypeId]

  const integration = clamp(100 - (scores.resource_chaos ?? 50))

  const dims = [
    ['Purpose intensity', scores.purpose_intensity],
    ['Anchor strength', scores.anchor_strength],
    ['Emotional volatility', scores.emotional_volatility],
    ['Cognitive clarity', scores.cognitive_clarity],
    ['Execution friction', scores.execution_friction],
    ['Distraction risk', scores.distraction_risk],
    ['Marathon consistency', scores.marathon_consistency],
    ['Recovery speed', scores.recovery_speed],
    ['Prelims nerve', scores.prelims_nerve],
    ['Mains stamina', scores.mains_stamina],
    ['Attempt pressure', scores.attempt_pressure],
    ['Resource chaos', scores.resource_chaos],
    ['Identity fusion', scores.identity_fusion],
    ['External pressure', scores.external_pressure],
  ]
    .filter(([, v]) => typeof v === 'number')
    .map(([k, v]) => `- ${k}: ${clamp(v as number)}`)
    .join('\n')

  const factLines = [
    facts.attempts_taken != null && `- Prelims attempts taken: ${facts.attempts_taken}`,
    facts.attempts_mains != null && `- Mains attempts: ${facts.attempts_mains}`,
    facts.prep_years != null && `- Years preparing: ${facts.prep_years}`,
    typeof facts.employed === 'boolean' && `- Currently employed: ${facts.employed ? 'yes' : 'no'}`,
    facts.age != null && `- Age: ${facts.age}`,
    facts.optional_subject && `- Optional subject: ${facts.optional_subject}`,
  ]
    .filter(Boolean)
    .join('\n')

  const answersBlock = formatAnswersForPrompt(resolvedAnswers)

  const user = [
    name ? `Aspirant name: ${name}` : null,
    `Report depth: ${depth}`,
    '',
    `Archetype: ${meta?.name ?? archetypeId}`,
    meta?.revealLine ? `Archetype reveal line: "${meta.revealLine}"` : null,
    `Self-belief type: ${scores.self_belief_type ?? 'medium'}`,
    `Stage pattern: ${STAGE_LABEL[scores.stage_pattern] ?? scores.stage_pattern ?? 'unknown'}`,
    `Purpose type: ${PURPOSE_LABEL[scores.purpose_type] ?? scores.purpose_type ?? 'unknown'}`,
    warPatternTags.length ? `War-pattern tags: ${warPatternTags.join(', ')}` : null,
    `Integration score (100 - resource chaos): ${integration}`,
    '',
    'Silent dimensions (0-100):',
    dims,
    factLines ? `\nProfile facts:\n${factLines}` : '',
    answersBlock ? `\nTHE ASPIRANT'S ACTUAL ANSWERS (their own words — use these to make the report personal):\n${answersBlock}` : '',
    '',
    'Write this aspirant\'s KAUTILYA Command Diagnosis as the JSON object specified. Ground every emotional section in their ACTUAL answers above — quote or paraphrase their specific choices so they feel personally seen, not profiled by a template.',
  ]
    .filter(v => v !== null)
    .join('\n')

  return { system: SYSTEM, user }
}
