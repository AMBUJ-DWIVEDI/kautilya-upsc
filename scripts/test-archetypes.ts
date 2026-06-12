/**
 * M3 acceptance test — walks scripted answer paths through the real 52-card
 * instrument and asserts every launch archetype (plus the centroid fallback
 * and V11 routing) is reachable.
 *
 * Run: npx tsx scripts/test-archetypes.ts
 */

import { CARDS } from '../lib/diagnosis/cards'
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

function run(label: string, overrides: Record<string, string>, expected: ArchetypeId, extraChecks?: (tags: string[]) => void) {
  const { scores, facts } = calculateHiddenScores(answersWith(overrides))
  const outcome = deriveOutcome(scores, facts)
  console.log(`\n${label}`)
  console.log(`  stage=${scores.stage_pattern} purpose=${scores.purpose_type} chaos=${scores.resource_chaos} clarity=${scores.cognitive_clarity} nerve=${scores.prelims_nerve} extPressure=${scores.external_pressure} purposeIntensity=${scores.purpose_intensity}`)
  assert(outcome.archetype === expected, `archetype = ${expected} (got ${outcome.archetype})`)
  extraChecks?.(outcome.storedTags)
}

console.log('KAUTILYA archetype cascade walk — 52-card instrument')
console.log(`cards: ${CARDS.length}`)
assert(CARDS.length === 52, '52 cards in the instrument')

const levelCounts = CARDS.reduce<Record<number, number>>((acc, c) => {
  acc[c.level] = (acc[c.level] ?? 0) + 1
  return acc
}, {})
assert(
  JSON.stringify(levelCounts) === JSON.stringify({ 1: 7, 2: 6, 3: 6, 4: 7, 5: 8, 6: 7, 7: 5, 8: 6 }),
  `level counts 7/6/6/7/8/7/5/6 (got ${JSON.stringify(levelCounts)})`,
)
assert(CARDS.every(c => c.input === 'text' || (c.options.length >= 2 && c.options.length <= 6)), 'every option card has 2–6 options')
assert(new Set(CARDS.map(c => c.id)).size === 52, 'card ids are unique')

// 1. COMEBACK_WARRIOR: stage=RETURNING && purpose_intensity>=75
run(
  '1. Comeback Warrior — returned after leaving, purpose burning',
  {
    'L1-03': 'f',            // RETURNING
    'L2-01': 'a',            // SERVICE +20 purpose
    'L2-03': 'a',            // +20 purpose
    'L2-05': 'a',            // +15 purpose
    'L1-07': 'd',            // unemployed (skip splitter rule)
  },
  'COMEBACK_WARRIOR',
)

// 2. PRELIMS_TRAP_SCHOLAR: PRELIMS_WALL && attempts>=2 && clarity>=75 && nerve<=40
run(
  '2. Prelims-Trap Scholar — knowledge high, nerve broken at the gate',
  {
    'L1-03': 'b',            // PRELIMS_WALL
    'L1-04': 'd',            // 3 attempts
    'L1-07': 'd',            // unemployed
    'L4-05': 'd',            // +25 clarity (many cycles)
    'L5-05': 'a',            // +20 clarity (review discipline)
    'L8-03': 'd',            // +20 clarity
    'L5-03': 'c',            // -20 nerve (only-100%-sure)
    'L5-06': 'c',            // -20 nerve (freeze)
    'L5-01': 'e',            // -20 nerve (stops mocks)
    'L5-08': 'e',            // -20 nerve (lost exams to the night before)
  },
  'PRELIMS_TRAP_SCHOLAR',
)

// 3. WORKING_PROFESSIONAL_SPLITTER: employed && external_pressure>=60
run(
  '3. Working-Professional Splitter — job on the back, pressure high',
  {
    'L1-03': 'b',            // not RETURNING/FRESH so earlier rules skip
    'L1-07': 'a',            // employed full-time
    'L2-01': 'b',            // RESTORATION +15 external
    'L2-04': 'd',            // +20 external (family chose it)
    'L7-05': 'd',            // +25 external (family stretching)
    'L6-02': 'd',            // +20 external
  },
  'WORKING_PROFESSIONAL_SPLITTER',
)

// 4. FRAGMENTED_MAXIMALIST: resource_chaos>=80
run(
  '4. Fragmented Maximalist — integration debt everywhere',
  {
    'L1-03': 'b',            // PRELIMS_WALL but attempts low → rule 2 skips
    'L1-04': 'b',            // 1 attempt
    'L1-07': 'd',            // unemployed
    'L4-01': 'e',            // +30 chaos (the pile)
    'L4-02': 'e',            // +70 chaos (lost count)
    'L4-03': 'c',            // +20 chaos
    'L4-04': 'e',            // +25 chaos
  },
  'FRAGMENTED_MAXIMALIST',
)

// 5. FIRST_FLIGHT_IDEALIST: stage=FRESH
run(
  '5. First-Flight Idealist — walking in fresh',
  {
    'L1-03': 'a',            // FRESH
    'L1-04': 'a',            // 0 attempts
    'L1-07': 'd',            // unemployed
    'L4-02': 'a',            // monogamous with Laxmikanth
  },
  'FIRST_FLIGHT_IDEALIST',
)

// 6. Fallback: no cascade rule fires (PRELIMS_WALL, low attempts, employed but
// low pressure, moderate chaos) → nearest centroid.
{
  const overrides: Record<string, string> = {
    'L1-03': 'b',            // PRELIMS_WALL (not RETURNING/FRESH)
    'L1-04': 'b',            // 1 attempt → rule 2 skips
    'L1-07': 'd',            // unemployed → rule 3 skips
    'L4-02': 'b',            // chaos low → rule 4 skips
    'L7-05': 'a',            // external pressure low
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
    'L1-03': 'd', 'L1-04': 'e', 'L1-05': 'd', 'L1-07': 'd',
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
