import { describe, expect, it } from 'vitest'
import { buildReportPrompt } from '@/lib/report/prompt'
import { resolveDiagnosisAnswers } from '@/lib/report/answers'
import type { HiddenScores } from '@/lib/diagnosis/types'

const scores: HiddenScores = {
  purpose_intensity: 70,
  anchor_strength: 75,
  emotional_volatility: 45,
  cognitive_clarity: 65,
  execution_friction: 40,
  distraction_risk: 35,
  self_belief_type: 'medium',
  marathon_consistency: 60,
  recovery_speed: 55,
  prelims_nerve: 58,
  mains_stamina: 52,
  attempt_pressure: 45,
  resource_chaos: 30,
  identity_fusion: 35,
  external_pressure: 42,
  stage_pattern: 'PRELIMS_WALL',
  purpose_type: 'SERVICE',
  flags: [],
}

describe('60-card report prompt', () => {
  it('requires supported target, vault, and operating-profile output', () => {
    const resolvedAnswers = resolveDiagnosisAnswers({
      'L2-07': 'a',
      'L2-08': 'c',
      'L2-09': 'a',
      'L6-08': 'a',
      'L7-06': 'a',
      'L7-07': 'b',
      'L7-08': 'a',
      'L7-09': 'a',
      'L8-06': 'a',
      'L8-07': 'a',
    })

    const { system, user } = buildReportPrompt({
      scores,
      archetypeId: 'PRELIMS_TRAP_SCHOLAR',
      facts: { attempts_taken: 2, employed: false },
      depth: 'paid60',
      resolvedAnswers,
    })

    expect(system).toContain('"target_profile"')
    expect(system).toContain('"emotional_vault"')
    expect(system).toContain('"anchor_vault"')
    expect(system).toContain('"operating_profile"')
    expect(system.toLowerCase()).toContain('never invent')
    expect(user).toContain('Report depth: paid60')
    expect(user).toContain('When you picture the work after selection')
    expect(user).toContain('Under real pressure')
  })
})
