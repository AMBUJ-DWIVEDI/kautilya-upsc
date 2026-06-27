import { describe, expect, it } from 'vitest'
import { KAUTILYA_LANDING_SECTIONS, KAUTILYA_PROFILES } from '@/lib/kautilya/landing'

describe('KAUTILYA landing content', () => {
  it('defines ten complete and unique aspirant profiles', () => {
    expect(KAUTILYA_PROFILES).toHaveLength(10)
    expect(new Set(KAUTILYA_PROFILES.map(profile => profile.id)).size).toBe(10)

    for (const profile of KAUTILYA_PROFILES) {
      expect(profile.seenLanguage.length).toBeGreaterThan(20)
      expect(profile.needs.length).toBeGreaterThanOrEqual(4)
      expect(profile.offer.label.length).toBeGreaterThan(5)
      expect(profile.offer.href).toMatch(/^\//)
    }
  })

  it('uses unique section anchors', () => {
    const ids = KAUTILYA_LANDING_SECTIONS.map(section => section.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
