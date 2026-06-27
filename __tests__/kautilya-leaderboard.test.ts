import { describe, expect, it } from 'vitest'
import { calculateKautilyaRank, getRankConfidence } from '@/lib/kautilya/leaderboard'

describe('KAUTILYA composite rank', () => {
  it('uses the approved 30/25/20/15/10 weighting', () => {
    expect(calculateKautilyaRank({
      mockPerformance: 80,
      commandConsistency: 60,
      integration: 70,
      answerWriting: 40,
      recovery: 90,
    })).toBe(68)
  })

  it('clamps every factor before weighting', () => {
    expect(calculateKautilyaRank({
      mockPerformance: 150,
      commandConsistency: -20,
      integration: 100,
      answerWriting: 100,
      recovery: 100,
    })).toBe(75)
  })

  it('marks sparse scores as provisional', () => {
    expect(getRankConfidence([80, null, 70, null, null])).toBe('provisional')
    expect(getRankConfidence([80, 60, 70, null, null])).toBe('established')
  })
})
