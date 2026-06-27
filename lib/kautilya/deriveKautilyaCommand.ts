import type { KautilyaCommandType } from './commandTypes'

export interface KautilyaCommandInput {
  resourceChaosScore: number
  prelimsNerveScore: number
  mainsArchitectureScore: number
  currentAffairsIntegrationScore: number
  optionalStabilityScore: number
  missedDays: number
}

export function deriveKautilyaCommand(input: KautilyaCommandInput): KautilyaCommandType {
  if (input.missedDays >= 2) return 'recovery'
  if (input.resourceChaosScore >= 70) return 'source_reduction'
  if (input.prelimsNerveScore >= 70) return 'prelims'
  if (input.mainsArchitectureScore <= 40) return 'mains'
  if (input.currentAffairsIntegrationScore <= 40) return 'current_affairs'
  if (input.optionalStabilityScore <= 40) return 'optional'
  return 'weekly'
}
