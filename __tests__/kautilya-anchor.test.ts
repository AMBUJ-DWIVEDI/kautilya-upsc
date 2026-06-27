import { describe, expect, it } from 'vitest'
import { extractAnchorSnapshot } from '@/lib/kautilya/anchor'

describe('KAUTILYA Anchor', () => {
  it('extracts a read-only diagnosis snapshot', () => {
    const result = extractAnchorSnapshot({
      archetype: 'Fragmented Maximalist',
      anchor_card: {
        fighting_for: 'Family',
        must_protect: 'Health',
        must_prove: 'Consistency',
        must_become: 'A calm administrator',
        biggest_enemy: 'Expansion',
        daily_command: 'Reduce one source',
        warning: 'Do not collect',
        comeback_line: 'Return to one page',
      },
      target_profile: {
        post: 'IAS: field administration',
        rank: 'Top 100',
        score: 'Prelims safety margin',
      },
      emotional_vault: {
        primary_trigger: 'Fear that the years amount to nothing',
        pressure_story: 'Time becomes a verdict after a poor result',
        protection_rule: 'Separate the result from identity',
      },
      anchor_vault: {
        human_anchor: 'Mother',
        anchor_role: 'Believed before evidence',
        character_anchor: 'Constitutional public servant',
        deepest_motivator: 'The work itself',
        return_point: 'One revised page',
      },
      operating_profile: {
        rhythm: 'Quiet repetition',
        starts_best_when: 'The first task is already chosen',
        sustained_by: 'Visible evidence',
        disrupted_by: 'New-source expansion',
        recovery_protocol: 'Analyse, reduce, return',
        protected_environment: 'A silent first study block',
      },
      personal_laws: [{ law_name: 'Final Source', law: 'One source speaks', detail: 'Revise before adding' }],
    })

    expect(result.cognitiveArchetype).toBe('Fragmented Maximalist')
    expect(result.targets.post).toBe('IAS: field administration')
    expect(result.emotionalVault.primaryTrigger).toBe('Fear that the years amount to nothing')
    expect(result.emotionalVault.fightingFor).toBe('Family')
    expect(result.anchorVault.humanAnchor).toBe('Mother')
    expect(result.operatingProfile.rhythm).toBe('Quiet repetition')
    expect(result.diagnosisLaws[0].name).toBe('Final Source')
    expect(result.source).toBe('diagnosis_report')
  })

  it('returns stable pending values when card evidence is absent', () => {
    const snapshot = extractAnchorSnapshot(null)
    expect(snapshot.cognitiveArchetype).toBe('Diagnosis pending')
    expect(snapshot.targets.post).toBe('')
    expect(snapshot.emotionalVault.fightingFor).toBe('')
    expect(snapshot.anchorVault.humanAnchor).toBe('')
    expect(snapshot.operatingProfile.rhythm).toBe('')
  })
})
