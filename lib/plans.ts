import { APP } from '@/lib/config'

/**
 * Plan storage values: 'free' (Scout tier), 'prelims' (Warrior), 'gs' (Commander).
 * 'warrior' survives only as the internal unlock token meaning "any paid tier"
 * (mock catalog + DB check constraint use it for gating).
 */
export type PlanType = 'free' | 'prelims' | 'gs'

export function isPaidPlan(plan?: string | null): plan is 'prelims' | 'gs' {
  return plan === 'prelims' || plan === 'gs'
}

/** Full Smart Notes vault — Commander tier only. */
export function hasGsPlan(plan?: string | null): plan is 'gs' {
  return plan === 'gs'
}

export function canAccessPlan(userPlan: string | null | undefined, required: 'free' | 'warrior'): boolean {
  if (required === 'free') return true
  return isPaidPlan(userPlan)
}

export function planLabel(plan?: string | null): string {
  const tier = APP.pricing.tiers.find(t => (t.price === 0 ? plan === 'free' : t.id === plan))
  return tier?.label ?? 'Scout'
}
