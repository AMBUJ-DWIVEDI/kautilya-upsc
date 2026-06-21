import type { StagePattern } from '@/lib/diagnosis/types'

export type SourceRole = 'final' | 'secondary' | 'parked' | 'dead'

export interface Source {
  id: string
  name: string
  subject?: string
  role: SourceRole
  reason: string
  action: string
}

/** DB row shape for kautilya_sources (server-side mapping only). */
export interface KautilyaSourceRow {
  id: string
  user_id: string
  name: string
  subject: string | null
  role: SourceRole
  reason: string
  created_at: string
  updated_at: string
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
