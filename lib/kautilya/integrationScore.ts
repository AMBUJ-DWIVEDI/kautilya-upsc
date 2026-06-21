import { integrationScore as scoreFromResourceChaos } from '@/lib/diagnosis/scoring'
import type { ResourceState } from '@/types/kautilya'

/** Bump when the integration formula or ResourceState inputs change. */
export const INTEGRATION_SCORE_VERSION = 1 as const

/**
 * User-visible integration score from resource state.
 * Today: inverted resource_chaos from diagnosis (lib/diagnosis/scoring.ts).
 * Future: may incorporate named sources once the Source model ships.
 */
export function computeIntegrationScore(state: ResourceState): number | null {
  if (state.resourceChaos == null) return null
  return scoreFromResourceChaos(state.resourceChaos)
}
