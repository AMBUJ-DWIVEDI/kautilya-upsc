export type KautilyaCommandType =
  | 'daily'
  | 'weekly'
  | 'recovery'
  | 'source_reduction'
  | 'prelims'
  | 'mains'
  | 'current_affairs'
  | 'optional'
  | 'revision'

export type KautilyaCommandStatus =
  | 'active'
  | 'sealed'
  | 'completed'
  | 'missed'
  | 'recalibrated'

export interface KautilyaCommandFocusAreas {
  prelims?: string
  mains?: string
  optional?: string
  currentAffairs?: string
  revision?: string
}

export interface KautilyaCommand {
  id: string
  userId: string
  type: KautilyaCommandType
  status: KautilyaCommandStatus
  title: string
  seenText: string
  longWarSignal: string
  primaryLeak: string
  command: string
  doMore: string[]
  doLess: string[]
  focusAreas: KautilyaCommandFocusAreas
  avoidToday?: string
  whyThisMatters: string
  window: 'today' | 'this_week'
  sealedAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface KautilyaCommandReview {
  commandId: string
  completed: boolean
  whatMoved?: string
  whatLeaked?: string
  sourceChaosChange?: string
  prelimsSignal?: string
  mainsSignal?: string
  tomorrowFirstMove: string
}
