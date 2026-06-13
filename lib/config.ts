/**
 * KAUTILYA UPSC — central configuration.
 * Single source of truth for every exam-specific and brand-specific value.
 * PRIME DIRECTIVE: engine code reads from APP; nothing exam-shaped is hardcoded elsewhere.
 */

export const APP = {
  brand: {
    name: 'KAUTILYA',
    exam: 'UPSC CSE',
    sibling: 'CHANAKYA SSC',
    tagline: 'Knowledge is not enough. Judgement selects.',
  },

  /**
   * Production URL. Auth redirects derive from the request origin automatically
   * (see app/auth/callback/route.ts); this is only used for absolute links and metadata.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kautilyaias.netlify.app',

  exam: {
    prelimsGS: { questions: 100, marks: 200, perQuestion: 2, negative: 0.66, minutes: 120 },
    csat: { questions: 80, marks: 200, perQuestion: 2.5, negative: 0.83, minutes: 120, qualifyingPct: 33 },
    attemptsGeneral: 6,
    ageCapGeneral: 32,
  },

  dates: {
    // KAUTILYA-DECISION: UPSC CSE Prelims 2027 expected late May; placeholder until notification.
    prelimsExpected: '2027-05-30',
    confirmed: false,
  },

  contact: {
    // KAUTILYA-DECISION: mailbox to be provisioned before launch; mirrors CHANAKYA convention.
    support: 'support@kautilyaupsc.com',
  },

  pricing: {
    tiers: [
      { id: 'scout', label: 'Scout', price: 0 },
      { id: 'prelims', label: 'Warrior', price: 999 },
      { id: 'gs', label: 'Commander', price: 1999 },
    ],
  },
} as const

export type PricingTierId = (typeof APP.pricing.tiers)[number]['id']

export function tierById(id: string) {
  return APP.pricing.tiers.find(t => t.id === id)
}

/** Whole days from `from` until expected Prelims (clamped at 0). */
export function daysUntilPrelims(from: Date = new Date()): number {
  const target = new Date(`${APP.dates.prelimsExpected}T00:00:00`)
  const ms = target.getTime() - from.getTime()
  return Math.max(0, Math.ceil(ms / 86_400_000))
}
