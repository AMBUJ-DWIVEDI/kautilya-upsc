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
      personal_laws: [{ law_name: 'Final Source', law: 'One source speaks', detail: 'Revise before adding' }],
    })

    expect(result.cognitiveArchetype).toBe('Fragmented Maximalist')
    expect(result.emotionalVault.fightingFor).toBe('Family')
    expect(result.source).toBe('diagnosis_report')
  })

  it('returns stable pending values when card evidence is absent', () => {
    const snapshot = extractAnchorSnapshot(null)
    expect(snapshot.cognitiveArchetype).toBe('Diagnosis pending')
    expect(snapshot.emotionalVault.fightingFor).toBe('')
  })
})
