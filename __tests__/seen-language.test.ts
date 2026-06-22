import { describe, it, expect } from 'vitest'
import { createSeenCommand, NO_SHAME_BANS, SEEN_VOICE_RULES } from '@/lib/voice/seenLanguage'

describe('seen language', () => {
  it('builds the not-X / actually-Y / cost / command structure', () => {
    const s = createSeenCommand({
      shameInterpretation: 'behind because you know too little',
      truePattern: 'too many sources are fighting for authority in your head',
      cost: '3 hours of revision, scattered',
      command: 'declare one source final, park one, kill one',
    })
    expect(s.mirror).toBe('You are not behind because you know too little.')
    expect(s.reframe).toMatch(/^What is actually happening is too many sources/)
    expect(s.cost).toMatch(/^The cost is 3 hours/)
    expect(s.command).toBe('declare one source final, park one, kill one')
    expect(s.fullText).toContain('Command: declare one source final')
  })

  it('strips a leading "not" from the shame story so it never doubles', () => {
    const s = createSeenCommand({
      shameInterpretation: 'not lazy',
      truePattern: 'your return speed is slow',
      command: 'return faster',
    })
    expect(s.mirror).toBe('You are not lazy.')
  })

  it('omits the cost line when no cost is given', () => {
    const s = createSeenCommand({
      shameInterpretation: 'confused',
      truePattern: 'your sources have no hierarchy',
      command: 'rank them',
    })
    expect(s.cost).toBeUndefined()
    expect(s.fullText).not.toContain('The cost is')
  })

  it('the prompt voice rules ban shame words', () => {
    expect(NO_SHAME_BANS).toContain('lazy')
    expect(SEEN_VOICE_RULES).toContain('not X, actually Y')
  })
})
