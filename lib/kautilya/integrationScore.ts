import { integrationScore as scoreFromResourceChaos } from '@/lib/diagnosis/scoring'
import type { ResourceState, Source } from '@/types/kautilya'

/** Bump when the integration formula or ResourceState inputs change. */
export const INTEGRATION_SCORE_VERSION = 2 as const

const ROLE_CHAOS_WEIGHT: Record<Source['role'], number> = {
  final: 22,
  secondary: 11,
  parked: 0,
  dead: 0,
}

/** Chaos from named sources: more active fronts → higher chaos. */
export function computeSourceChaos(sources: Source[]): number | null {
  if (sources.length === 0) return null
  const finals = sources.filter(s => s.role === 'final').length
  const weight = sources.reduce((sum, s) => sum + ROLE_CHAOS_WEIGHT[s.role], 0)
  const multiFinalPenalty = Math.max(0, finals - 1) * 14
  return Math.min(100, weight + multiFinalPenalty)
}

/**
 * User-visible integration score from resource state.
 * Diagnosis resource_chaos when no sources are named; blends with source
 * roles once the user has completed a resource audit.
 */
export function computeIntegrationScore(state: ResourceState): number | null {
  const diagnosisScore =
    state.resourceChaos != null ? scoreFromResourceChaos(state.resourceChaos) : null

  if (state.sources.length === 0) {
    return diagnosisScore
  }

  const sourceChaos = computeSourceChaos(state.sources)
  if (sourceChaos == null) return diagnosisScore

  const sourceScore = scoreFromResourceChaos(sourceChaos)
  if (diagnosisScore == null) return sourceScore

  return Math.round(sourceScore * 0.6 + diagnosisScore * 0.4)
}
