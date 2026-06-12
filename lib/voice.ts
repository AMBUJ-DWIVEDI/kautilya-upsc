/**
 * KAUTILYA voice constants.
 * Verdict-first. Philosophical-strategic. Fierce at the system, never at the aspirant.
 * Reuse these strings; do not improvise tone inside components.
 */

export const VOICE = {
  /** Re-entry after a missed day. Recovery is retention design — never shame. */
  reentry: {
    headline: 'Yesterday is archived.',
    body: "Today's command is lighter. Begin.",
    cta: 'Begin again',
  },

  /** Empty states */
  empty: {
    notes: 'The library is being inked. The first Polity issues arrive shortly.',
    commands: 'Your command for today is being drawn up. One moment.',
    mocks: 'No battle records yet. The first mock writes the first map.',
    review: 'Your first weekly review is sealed on Sunday night. Work the week; the verdict will come.',
  },

  /** Errors — fierce at the system, never the aspirant */
  error: {
    generic: 'The system slipped, not you. Try once more.',
    save: 'Your work is safe on this device. The sync will catch up.',
    network: 'The connection broke mid-sentence. Your progress is held; reload when ready.',
  },

  /** Daily seal — variable-reward insight pool. One line is drawn at random on a sealed day. */
  sealedInsights: [
    'A day fully executed outweighs a week half-planned.',
    'The syllabus is finite. Your discipline just made it smaller.',
    'Rank is decided in the unglamorous hours. This was one of them.',
    'You did not study today. You governed today.',
    'Integration, not accumulation. Today you integrated.',
    'The exam rewards the calm. Today you practiced calm.',
    'One sealed day is a brick. The wall is coming.',
  ],

  /** Landing + ceremony anchors */
  brandLines: {
    hero: 'Knowledge is not enough. Judgement selects.',
    subHero: 'KAUTILYA studies how you prepare before it tells you what to prepare.',
    diagnosis: 'Fifty-two cards. Eight levels. The system maps the aspirant before the syllabus.',
  },
} as const

export type SealedInsight = (typeof VOICE.sealedInsights)[number]

export function randomSealedInsight(): string {
  return VOICE.sealedInsights[Math.floor(Math.random() * VOICE.sealedInsights.length)]
}
