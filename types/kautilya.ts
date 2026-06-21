import type { StagePattern } from '@/lib/diagnosis/types'

export type SourceRole = 'final' | 'secondary' | 'parked' | 'dead'

export interface Source {
  id: string
  name: string
  role: SourceRole
  reason: string
  action: string
}

/** Named sources plus the silent resource_chaos dimension from diagnosis. */
export interface ResourceState {
  sources: Source[]
  resourceChaos: number | null
}

export interface LongWarDiagnosis {
  archetype: string
  stagePattern: StagePattern
  hasCompletedDiagnosis: boolean
  resourceChaos: number | null
  integrationScore: number | null
  prelimsNerve: number | null
  mainsStamina: number | null
}

export interface WeeklyCommand {
  weekSignal: string
  primaryLeak: string
  doMore: string[]
  doLess: string[]
  mustIntegrate: string[]
  mustWrite: string[]
  mustRevise: string[]
}
