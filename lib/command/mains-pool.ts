// ============================================================
// KAUTILYA UPSC — Mains prompt pool (MVP)
// Framework + self-mark rubric only. AI evaluation is Phase 3.
// Rotated by day-of-year; content team extends this pool.
// ============================================================

import type { MainsPrompt } from './types'

export const MAINS_POOL: MainsPrompt[] = [
  {
    question:
      '"The Indian Constitution is a living document, not a static rulebook." Discuss with reference to the amendment process and judicial interpretation. (250 words)',
    framework: [
      'Intro: define "living document" in one line — adaptability within a firm basic structure.',
      'Body 1: Article 368 flexibility — cite one socially transformative amendment (e.g., 73rd/74th).',
      'Body 2: judicial interpretation as quiet amendment — Kesavananda, Puttaswamy on Article 21.',
      'Body 3: one counter-view — amendment frequency vs. constitutional stability.',
      'Close: balance line — endurance THROUGH change, not despite it.',
    ],
    rubric: [
      'Did you define the key term in the first two lines?',
      'At least one article number and one case name, used accurately?',
      'A counter-view acknowledged before the conclusion?',
      'Under 260 words, no paragraph over 70?',
    ],
  },
  {
    question:
      'Parliamentary sovereignty in India operates within constitutional limits. Examine how the basic structure doctrine reshapes the balance between Parliament and the judiciary. (250 words)',
    framework: [
      'Intro: contrast UK-style sovereignty with India\'s constitutional supremacy.',
      'Body 1: pre-1973 position — Shankari Prasad, Golak Nath swing.',
      'Body 2: Kesavananda — what the doctrine protects and what it leaves open.',
      'Body 3: working consequence — NJAC verdict as a live example.',
      'Close: tension as a feature — two organs checking, neither absolute.',
    ],
    rubric: [
      'Is the doctrine stated precisely (amend ≠ destroy identity)?',
      'Did you give the chronology in one moving line rather than a list?',
      'One post-2010 example present?',
      'Conclusion takes a position without dismissing either organ?',
    ],
  },
  {
    question:
      'Discuss the role of the Election Commission of India in ensuring free and fair elections, and examine the case for greater financial and functional independence. (250 words)',
    framework: [
      'Intro: Article 324 as a "reservoir of power" — one line.',
      'Body 1: powers in action — MCC, symbol allocation, supervision of machinery.',
      'Body 2: structural gaps — appointment process, expenditure not charged, post-retirement concerns.',
      'Body 3: reform menu — collegium appointment (2023 Act context), charged expenditure.',
      'Close: independence of the referee decides the credibility of the game.',
    ],
    rubric: [
      'Article 324 cited and correctly characterized?',
      'At least two concrete powers AND two concrete gaps?',
      'Did you mention the CEC and ECs appointment law (2023) accurately?',
      'No rhetorical filler — every sentence carries a fact or an argument?',
    ],
  },
  {
    question:
      '"Cooperative federalism in India is more aspiration than architecture." Critically examine with reference to fiscal relations between the Union and the States. (250 words)',
    framework: [
      'Intro: define cooperative federalism vs. the Constitution\'s unitary tilt.',
      'Body 1: architecture that exists — GST Council, Finance Commission, NITI fora.',
      'Body 2: friction points — cesses outside the divisible pool, Article 282 discretion, GST compensation.',
      'Body 3: a working example each way — one cooperation win, one conflict.',
      'Close: verdict with nuance — architecture exists, trust is the missing material.',
    ],
    rubric: [
      'Both sides given real evidence, not adjectives?',
      'One number used (e.g., divisible pool share)?',
      'GST Council treated as evidence, not just name-dropped?',
      'A clear verdict in the final two lines?',
    ],
  },
  {
    question:
      'The Directive Principles of State Policy are neither mere platitudes nor judicially enforceable rights. Examine their constitutional function and their evolving relationship with Fundamental Rights. (250 words)',
    framework: [
      'Intro: Article 37 — non-justiciable yet "fundamental in governance".',
      'Body 1: DPSP as legislative compass — land reform, RTE genealogy (Art 45 → 21A).',
      'Body 2: the conflict era — Champakam Dorairajan to Minerva Mills.',
      'Body 3: harmonization today — courts reading DPSP into Article 21.',
      'Close: rights give the citizen a shield; directives give the state a direction.',
    ],
    rubric: [
      'Article 37 characterized exactly?',
      'The conflict-to-harmony arc told as movement, not a case list?',
      'One example of DPSP becoming enforceable law?',
      'Closing line earns its rhetoric with the body\'s evidence?',
    ],
  },
  {
    question:
      'Examine the significance of the 73rd Constitutional Amendment for democratic decentralisation, and analyse why panchayats remain fiscally dependent despite constitutional status. (250 words)',
    framework: [
      'Intro: 1992 as the third tier\'s birth certificate — one line.',
      'Body 1: what the amendment hard-wired — elections, reservations, State Finance Commissions.',
      'Body 2: the dependence problem — 3Fs (funds, functions, functionaries), Article 243G as enabling not mandating.',
      'Body 3: consequence + fix — own-revenue fraction, property tax reform, activity mapping.',
      'Close: representation was constitutionalised; capacity was left to politics.',
    ],
    rubric: [
      'Did you name at least three specific provisions of the amendment?',
      'The 3F framing (or equivalent) present?',
      'One data point on panchayat own-revenue?',
      'Solutions concrete enough to act on, not "should be strengthened"?',
    ],
  },
  {
    question:
      'Judicial review and judicial activism are distinct constitutional phenomena. Distinguish between them and evaluate when activism shades into overreach. (250 words)',
    framework: [
      'Intro: two-line distinction — review checks legality; activism expands remedies.',
      'Body 1: review\'s anchors — Articles 13, 32, 226.',
      'Body 2: activism\'s instruments — PIL, continuing mandamus, expanded Article 21.',
      'Body 3: the overreach line — policy domains, judicial legislation (e.g., guidelines regimes).',
      'Close: a test — intervention is legitimate when rights fail, suspect when preferences rule.',
    ],
    rubric: [
      'Distinction sharp enough to survive a counter-question?',
      'Each phenomenon given its own articles/instruments?',
      'One example of celebrated activism AND one of criticized overreach?',
      'Your closing test is stated in your own words?',
    ],
  },
]

/** Deterministic daily rotation so the whole user base sees the same prompt per day. */
export function mainsPromptForDate(date: Date): MainsPrompt {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0)
  const dayOfYear = Math.floor((date.getTime() - start) / 86_400_000)
  return MAINS_POOL[dayOfYear % MAINS_POOL.length]
}
