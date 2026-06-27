import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import {
  CARDS,
  FREE_DIAGNOSIS_CARDS,
  PAID_DIAGNOSIS_CARDS,
} from '@/lib/diagnosis/cards'

const LEGACY_COUNTS = [7, 6, 6, 6, 8, 7, 5, 5]
const LEGACY_IDS = LEGACY_COUNTS.flatMap((count, levelIndex) =>
  Array.from(
    { length: count },
    (_, cardIndex) => `L${levelIndex + 1}-${String(cardIndex + 1).padStart(2, '0')}`,
  ),
)

function fingerprint(cards: typeof CARDS): string {
  return createHash('sha256')
    .update(JSON.stringify(cards.map(({
      id,
      level,
      question,
      microcopy,
      input,
      placeholder,
      options,
    }) => ({
      id,
      level,
      question,
      microcopy,
      input,
      placeholder,
      options,
    }))))
    .digest('hex')
}

describe('60-card diagnosis instrument', () => {
  it('contains 60 unique premium cards and 40 unique free cards', () => {
    expect(PAID_DIAGNOSIS_CARDS).toHaveLength(60)
    expect(new Set(PAID_DIAGNOSIS_CARDS.map(card => card.id)).size).toBe(60)
    expect(FREE_DIAGNOSIS_CARDS).toHaveLength(40)
    expect(new Set(FREE_DIAGNOSIS_CARDS.map(card => card.id)).size).toBe(40)
  })

  it('keeps every card multiple choice', () => {
    expect(CARDS.every(card => card.input !== 'text' && card.options.length >= 2)).toBe(true)
  })

  it('covers all eight levels in the free instrument', () => {
    expect([...new Set(FREE_DIAGNOSIS_CARDS.map(card => card.level))]).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8,
    ])
  })

  it('preserves the original 50 cards at the data level', () => {
    const legacyCards = CARDS.filter(card => LEGACY_IDS.includes(card.id))
    expect(legacyCards).toHaveLength(50)
    expect(fingerprint(legacyCards)).toBe(
      '5269daaeed5f38af101fd772936cd16f25e5540fef7c4a62dfc5952f585a0fb7',
    )
  })
})
