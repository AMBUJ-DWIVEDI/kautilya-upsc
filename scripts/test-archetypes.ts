/**
 * M3 acceptance test — walks scripted answer paths through the real 60-card
 * paid instrument, and protects the 40-card Scout subset.
 *
 * Run: npx tsx scripts/test-archetypes.ts
 */

import { CARDS, FREE_DIAGNOSIS_CARDS } from '../lib/diagnosis/cards'
import { calculateHiddenScores } from '../lib/diagnosis/scoring'
import { deriveOutcome } from '../lib/diagnosis/archetypes'
import type { Answers, ArchetypeId } from '../lib/diagnosis/types'

let failures = 0

function assert(cond: boolean, label: string) {
  if (cond) {
    console.log(`  PASS  ${label}`)
  } else {
    failures++
    console.error(`  FAIL  ${label}`)
  }
}

/** Base path: neutral-ish answers for every card, overridable per scenario. */
function answersWith(overrides: Record<string, string>): Answers {
  const answers: Answers = {}
  for (const card of CARDS) {
    if (card.input === 'text') {
      answers[card.id] = 'Test Aspirant'
    } else {
      answers[card.id] = card.options[0].key
    }
  }
  return { ...answers, ...overrides }
}

function answersForFreeScan(overrides: Record<string, string> = {}): Answers {
  const answers: Answers = {}
  for (const card of FREE_DIAGNOSIS_CARDS) {
    answers[card.id] = card.options[0].key
  }
  return { ...answers, ...overrides }
}

function run(label: string, overrides: Record<string, string>, expected: ArchetypeId, extraChecks?: (tags: string[]) => void) {
  const { scores, facts } = calculateHiddenScores(answersWith(overrides))
  const outcome = deriveOutcome(scores, facts)
  console.log(`\n${label}`)
  console.log(`  stage=${scores.stage_pattern} purpose=${scores.purpose_type} chaos=${scores.resource_chaos} clarity=${scores.cognitive_clarity} nerve=${scores.prelims_nerve} extPressure=${scores.external_pressure} purposeIntensity=${scores.purpose_intensity}`)
  assert(outcome.archetype === expected, `archetype = ${expected} (got ${outcome.archetype})`)
  extraChecks?.(outcome.storedTags)
}

console.log('KAUTILYA archetype cascade walk — 60-card instrument')
console.log(`cards: ${CARDS.length}`)
assert(CARDS.length === 60, '60 cards in the instrument')

const levelCounts = CARDS.reduce<Record<number, number>>((acc, c) => {
  acc[c.level] = (acc[c.level] ?? 0) + 1
  return acc
}, {})
assert(
  JSON.stringify(levelCounts) === JSON.stringify({ 1: 7, 2: 9, 3: 6, 4: 6, 5: 8, 6: 8, 7: 9, 8: 7 }),
  `level counts 7/9/6/6/8/8/9/7 (got ${JSON.stringify(levelCounts)})`,
)
assert(CARDS.every(c => c.input !== 'text' && c.options.length >= 2 && c.options.length <= 7), 'every card has 2–7 multiple-choice options')
assert(new Set(CARDS.map(c => c.id)).size === 60, 'card ids are unique')
assert(FREE_DIAGNOSIS_CARDS.length === 40, 'Scout scan has exactly 40 cards')
assert(new Set(FREE_DIAGNOSIS_CARDS.map(c => c.id)).size === 40, 'Scout card ids are unique')
assert(FREE_DIAGNOSIS_CARDS.every(c => CARDS.some(full => full.id === c.id)), 'Scout cards are extracted from the full 60')
assert(
  JSON.stringify([...new Set(FREE_DIAGNOSIS_CARDS.map(c => c.level))]) === JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8]),
  'Scout scan covers all 8 levels',
)

{
  const { scores, facts } = calculateHiddenScores(answersForFreeScan())
  const outcome = deriveOutcome(scores, facts)
  assert(
    (['COMEBACK_WARRIOR', 'PRELIMS_TRAP_SCHOLAR', 'WORKING_PROFESSIONAL_SPLITTER', 'FRAGMENTED_MAXIMALIST', 'FIRST_FLIGHT_IDEALIST'] as string[]).includes(outcome.archetype),
    `Scout scan resolves to a launch archetype (got ${outcome.archetype})`,
  )
}

// 1. COMEBACK_WARRIOR: stage=RETURNING && purpose_intensity>=75
run(
  '1. Comeback Warrior — returned after leaving, purpose burning',
  {
    'L1-03': 'f',            // RETURNING
    'L2-01': 'a',            // SERVICE +20 purpose
    'L2-03': 'c',            // +12 purpose
    'L2-04': 'a',            // +15 purpose
    'L3-01': 'a',            // unemployed (skip splitter rule)
  },
  'COMEBACK_WARRIOR',
)

// 2. PRELIMS_TRAP_SCHOLAR: PRELIMS_WALL && attempts>=2 && clarity>=75 && nerve<=40
run(
  '2. Prelims-Trap Scholar — knowledge high, nerve broken at the gate',
  {
    'L1-03': 'b',            // PRELIMS_WALL
    'L1-02': 'c',            // 2 attempts
    'L3-01': 'a',            // unemployed
    'L5-03': 'd',            // -15 nerve
    'L5-04': 'c',            // -15 nerve
    'L5-05': 'a',            // +18 clarity
    'L5-06': 'c',            // -20 nerve
    'L5-07': 'd',            // -12 nerve
    'L5-08': 'a',            // +15 clarity
    'L8-02': 'b',            // +5 clarity
    'L8-04': 'b',            // +5 clarity
  },
  'PRELIMS_TRAP_SCHOLAR',
)

// 3. WORKING_PROFESSIONAL_SPLITTER: employed && external_pressure>=60
run(
  '3. Working-Professional Splitter — job on the back, pressure high',
  {
    'L1-03': 'b',            // not RETURNING/FRESH so earlier rules skip
    'L1-02': 'b',            // 1 attempt, skip prelims-trap rule
    'L3-01': 'b',            // employed full-time
    'L2-01': 'b',            // RESTORATION +8 external
    'L3-03': 'd',            // +20 external
    'L3-04': 'e',            // +20 external
    'L3-05': 'e',            // +22 external
    'L7-04': 'c',            // +18 external
    'L8-05': 'c',            // +20 external
  },
  'WORKING_PROFESSIONAL_SPLITTER',
)

// 4. FRAGMENTED_MAXIMALIST: resource_chaos>=80
run(
  '4. Fragmented Maximalist — integration debt everywhere',
  {
    'L1-03': 'b',            // PRELIMS_WALL but attempts low → rule 2 skips
    'L1-02': 'b',            // 1 attempt
    'L3-01': 'a',            // unemployed
    'L4-01': 'e',            // +35 chaos
    'L4-02': 'e',            // +70 chaos
    'L4-03': 'd',            // +25 chaos, NOTES_HOARDER
    'L4-04': 'e',            // STRATEGY_CONSUMER
    'L4-05': 'd',            // NEWSPAPER_COLLECTOR
    'L4-06': 'd',            // NOTES_HOARDER
  },
  'FRAGMENTED_MAXIMALIST',
)

// 5. FIRST_FLIGHT_IDEALIST: stage=FRESH
run(
  '5. First-Flight Idealist — walking in fresh',
  {
    'L1-03': 'a',            // FRESH
    'L1-02': 'a',            // 0 attempts
    'L3-01': 'a',            // unemployed
    'L4-02': 'a',            // monogamous with Laxmikanth
  },
  'FIRST_FLIGHT_IDEALIST',
)

// 6. Fallback: no cascade rule fires (PRELIMS_WALL, low attempts, employed but
// low pressure, moderate chaos) → nearest centroid.
{
  const overrides: Record<string, string> = {
    'L1-03': 'b',            // PRELIMS_WALL (not RETURNING/FRESH)
    'L1-02': 'b',            // 1 attempt → rule 2 skips
    'L3-01': 'a',            // unemployed → rule 3 skips
    'L4-02': 'b',            // chaos low → rule 4 skips
    'L3-03': 'a',            // external pressure low
  }
  const { scores, facts } = calculateHiddenScores(answersWith(overrides))
  const outcome = deriveOutcome(scores, facts)
  console.log('\n6. Fallback — no cascade rule fires, centroid distance decides')
  console.log(`  stage=${scores.stage_pattern} chaos=${scores.resource_chaos} → ${outcome.archetype}`)
  assert(
    (['COMEBACK_WARRIOR', 'PRELIMS_TRAP_SCHOLAR', 'WORKING_PROFESSIONAL_SPLITTER', 'FRAGMENTED_MAXIMALIST', 'FIRST_FLIGHT_IDEALIST'] as string[]).includes(outcome.archetype),
    'fallback resolves to one of the 5 launch archetypes',
  )
}

// 7. V11 routing: INTERVIEW_EDGE wound is flagged and routed, never dead-ends.
{
  const { scores, facts } = calculateHiddenScores(answersWith({
    'L1-03': 'd', 'L1-02': 'e', 'L1-04': 'e', 'L3-01': 'a',
  }))
  const outcome = deriveOutcome(scores, facts)
  console.log('\n7. V11 candidate — Interview Edge routed to nearest launch archetype')
  console.log(`  stage=${scores.stage_pattern} → ${outcome.archetype}, tags=${outcome.storedTags.join(',')}`)
  assert(
    (['COMEBACK_WARRIOR', 'PRELIMS_TRAP_SCHOLAR', 'WORKING_PROFESSIONAL_SPLITTER', 'FRAGMENTED_MAXIMALIST', 'FIRST_FLIGHT_IDEALIST'] as string[]).includes(outcome.archetype),
    'INTERVIEW_EDGE routed to a launch archetype',
  )
  assert(outcome.storedTags.includes('V11_CANDIDATE'), 'V11_CANDIDATE flag stored for INTERVIEW_EDGE')
  assert(outcome.warPatternTags.length <= 3, 'war pattern tags capped at 3')
}

console.log(`\n${failures === 0 ? 'ALL PASS' : `${failures} FAILURE(S)`}`)
process.exit(failures === 0 ? 0 : 1)
