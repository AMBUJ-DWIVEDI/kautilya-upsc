export interface KautilyaRankFactors {
  mockPerformance: number
  commandConsistency: number
  integration: number
  answerWriting: number
  recovery: number
}

export type RankConfidence = 'provisional' | 'established'

export const KAUTILYA_RANK_WEIGHTS = {
  mockPerformance: 0.3,
  commandConsistency: 0.25,
  integration: 0.2,
  answerWriting: 0.15,
  recovery: 0.1,
} as const

const clamp = (value: number) => Math.max(0, Math.min(100, value))

export function calculateKautilyaRank(factors: KautilyaRankFactors): number {
  return Math.round(
    clamp(factors.mockPerformance) * KAUTILYA_RANK_WEIGHTS.mockPerformance +
    clamp(factors.commandConsistency) * KAUTILYA_RANK_WEIGHTS.commandConsistency +
    clamp(factors.integration) * KAUTILYA_RANK_WEIGHTS.integration +
    clamp(factors.answerWriting) * KAUTILYA_RANK_WEIGHTS.answerWriting +
    clamp(factors.recovery) * KAUTILYA_RANK_WEIGHTS.recovery,
  )
}

export function getRankConfidence(factors: Array<number | null | undefined>): RankConfidence {
  return factors.filter(value => typeof value === 'number').length >= 3
    ? 'established'
    : 'provisional'
}
