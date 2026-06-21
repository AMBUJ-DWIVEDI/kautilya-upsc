import { describe, expect, it } from 'vitest'
import { CARDS } from '@/lib/diagnosis/cards'
import { deriveOutcome } from '@/lib/diagnosis/archetypes'
import {
  calculateHiddenScores,
  computeAttemptPressure,
  integrationScore,
} from '@/lib/diagnosis/scoring'
import type { Answers, ArchetypeId } from '@/lib/diagnosis/types'

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

const ARCHETYPE_SCENARIOS: { id: ArchetypeId; overrides: Record<string, string> }[] = [
  {
    id: 'COMEBACK_WARRIOR',
    overrides: { 'L1-03': 'f', 'L2-01': 'a', 'L2-03': 'c', 'L2-04': 'a', 'L3-01': 'a' },
  },
  {
    id: 'PRELIMS_TRAP_SCHOLAR',
    overrides: {
      'L1-03': 'b', 'L1-02': 'c', 'L3-01': 'a',
      'L5-03': 'd', 'L5-04': 'c', 'L5-05': 'a', 'L5-06': 'c', 'L5-07': 'd', 'L5-08': 'a',
      'L8-02': 'b', 'L8-04': 'b',
    },
  },
  {
    id: 'WORKING_PROFESSIONAL_SPLITTER',
    overrides: {
      'L1-03': 'b', 'L1-02': 'b', 'L3-01': 'b', 'L2-01': 'b',
      'L3-03': 'd', 'L3-04': 'e', 'L3-05': 'e', 'L7-04': 'c', 'L8-05': 'c',
    },
  },
  {
    id: 'FRAGMENTED_MAXIMALIST',
    overrides: {
      'L1-03': 'b', 'L1-02': 'b', 'L3-01': 'a',
      'L4-01': 'e', 'L4-02': 'e', 'L4-03': 'd', 'L4-04': 'e', 'L4-05': 'd', 'L4-06': 'd',
    },
  },
  {
    id: 'FIRST_FLIGHT_IDEALIST',
    overrides: { 'L1-03': 'a', 'L1-02': 'a', 'L3-01': 'a', 'L4-02': 'a' },
  },
]

describe('diagnosis scoring', () => {
  describe('computeAttemptPressure', () => {
    it('weights attempts slightly more than age', () => {
      const youngFew = computeAttemptPressure(1, 22)
      const olderFew = computeAttemptPressure(1, 30)
      const youngMany = computeAttemptPressure(5, 22)

      expect(youngMany).toBeGreaterThan(youngFew)
      expect(olderFew).toBeGreaterThan(youngFew)
    })

    it('defaults age term when age is undefined', () => {
      expect(computeAttemptPressure(0, undefined)).toBeGreaterThan(0)
    })

    it('clamps to 0–100', () => {
      expect(computeAttemptPressure(99, 99)).toBeLessThanOrEqual(100)
      expect(computeAttemptPressure(0, 21)).toBeGreaterThanOrEqual(0)
    })
  })

  describe('integrationScore', () => {
    it('inverts resource_chaos onto 0–100', () => {
      expect(integrationScore(0)).toBe(100)
      expect(integrationScore(100)).toBe(0)
      expect(integrationScore(40)).toBe(60)
    })
  })

  describe('calculateHiddenScores + deriveOutcome', () => {
    it('clamps dimension scores to 0–100', () => {
      const { scores } = calculateHiddenScores(answersWith({}))
      for (const key of [
        'purpose_intensity', 'anchor_strength', 'emotional_volatility', 'cognitive_clarity',
        'execution_friction', 'distraction_risk', 'marathon_consistency', 'recovery_speed',
        'prelims_nerve', 'mains_stamina', 'attempt_pressure', 'resource_chaos',
        'identity_fusion', 'external_pressure',
      ] as const) {
        expect(scores[key]).toBeGreaterThanOrEqual(0)
        expect(scores[key]).toBeLessThanOrEqual(100)
      }
    })

    it('sets integrationScore from resource_chaos in deriveOutcome', () => {
      const { scores, facts } = calculateHiddenScores(answersWith({ 'L4-02': 'e' }))
      const outcome = deriveOutcome(scores, facts)
      expect(outcome.integrationScore).toBe(integrationScore(scores.resource_chaos))
    })

    it.each(ARCHETYPE_SCENARIOS)('reaches archetype $id via cascade', ({ id, overrides }) => {
      const { scores, facts } = calculateHiddenScores(answersWith(overrides))
      const outcome = deriveOutcome(scores, facts)
      expect(outcome.archetype).toBe(id)
    })

    it('fallback centroid resolves to a launch archetype when no cascade rule fires', () => {
      const { scores, facts } = calculateHiddenScores(answersWith({
        'L1-03': 'b',
        'L1-02': 'b',
        'L3-01': 'a',
        'L4-02': 'b',
        'L3-03': 'a',
      }))
      const outcome = deriveOutcome(scores, facts)
      const launch: ArchetypeId[] = [
        'COMEBACK_WARRIOR', 'PRELIMS_TRAP_SCHOLAR', 'WORKING_PROFESSIONAL_SPLITTER',
        'FRAGMENTED_MAXIMALIST', 'FIRST_FLIGHT_IDEALIST',
      ]
      expect(launch).toContain(outcome.archetype)
    })
  })
})
