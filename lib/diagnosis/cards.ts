// ============================================================
// KAUTILYA UPSC - Diagnosis Instrument v1
// 50 cards - 8 levels - one card per screen - max 6 options.
//
// Adapted from the product instrument attachment. The attachment
// used a compact v1 shape; this file normalizes that shape into
// the app's typed scoring contract without changing the engine.
// ============================================================

import type {
  Card,
  CardLevel,
  CardOption,
  Dimension,
  ProfileFacts,
  PurposeType,
  SelfBeliefType,
  StagePattern,
} from './types'

type LegacyDimension = Dimension | 'attempt_pressure'
type LegacySelfBelief = 'EARNED' | 'BORROWED' | 'BROKEN' | 'UNTESTED'

type LegacyBands = {
  employed?: boolean
  prep_years_band?: 0 | 1 | 2 | 3 | 4
  attempts_band?: 0 | 1 | 2 | 3 | 4
  age_band?: 0 | 1 | 2 | 3
}

type LegacyCardOption = {
  key: string
  label: string
  weights?: Partial<Record<LegacyDimension, number>>
  sets?: LegacyBands & {
    stage_pattern?: StagePattern
    purpose_type?: PurposeType
    self_belief?: LegacySelfBelief
  }
  flags?: string[]
}

type RawCard = {
  id: string
  level: CardLevel
  question: string
  microcopy?: string
  options: LegacyCardOption[]
}

const RAW_LEVELS = [
  { level: 1, name: 'The Journey So Far',  subtitle: 'Facts first. No judgment lives here.', cards: 7 },
  { level: 2, name: 'The Why',             subtitle: 'The engine under the engine.',          cards: 6 },
  { level: 3, name: 'The Daily Reality',   subtitle: 'The war as it actually is.',            cards: 6 },
  { level: 4, name: 'The Resource Map',    subtitle: 'Count everything. Honestly.',           cards: 6 },
  { level: 5, name: 'The Mind Under Fire', subtitle: 'The exam hall lives in the mind.',      cards: 8 },
  { level: 6, name: 'The Emotional Core',  subtitle: 'What results do to you.',               cards: 7 },
  { level: 7, name: 'The Anchor',          subtitle: 'What holds you when nothing else does.',cards: 5 },
  { level: 8, name: 'The Mirror',          subtitle: 'The bravest five minutes of this app.', cards: 5 },
] as const

type LevelMetaField = 'name' | 'subtitle'

function levelRecord(field: LevelMetaField): Record<CardLevel, string> {
  const record = {} as Record<CardLevel, string>
  for (const level of RAW_LEVELS) {
    record[level.level as CardLevel] = level[field]
  }
  return record
}

export const LEVEL_NAMES: Record<CardLevel, string> = levelRecord('name')
export const LEVEL_SUBTITLES: Record<CardLevel, string> = levelRecord('subtitle')

const PREP_YEARS_BY_BAND: Record<NonNullable<LegacyBands['prep_years_band']>, number> = {
  0: 0.5,
  1: 1.5,
  2: 2.5,
  3: 3.5,
  4: 5,
}

const ATTEMPTS_BY_BAND: Record<NonNullable<LegacyBands['attempts_band']>, number> = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
}

const AGE_BY_BAND: Record<NonNullable<LegacyBands['age_band']>, number> = {
  0: 23,
  1: 26,
  2: 29,
  3: 31,
}

const SELF_BELIEF_MAP: Record<LegacySelfBelief, SelfBeliefType> = {
  EARNED: 'high',
  BORROWED: 'volatile',
  BROKEN: 'low',
  UNTESTED: 'medium',
}

const FLAG_ALIASES: Record<string, string[]> = {
  GHOST_CANDIDATE: ['GHOST_CANDIDATE', 'VETERAN_GHOST'],
  NEWSPAPER_COLLECTOR: ['NEWSPAPER_COLLECTOR', 'NEWSPAPER_PROXY'],
}

const RAW_CARDS: RawCard[] = [

  // ═══════════════ LEVEL 1 — THE JOURNEY SO FAR (7) ═══════════════

  {
    id: 'L1-01', level: 1,
    question: 'How long has UPSC been part of your life — not preparation hours, but the dream itself living in your head?',
    options: [
      { key: 'a', label: 'Less than a year. The dream is new.', sets: { prep_years_band: 0 } },
      { key: 'b', label: 'One to two years.', sets: { prep_years_band: 1 } },
      { key: 'c', label: 'Two to three years. It has roots now.', sets: { prep_years_band: 2 }, weights: { identity_fusion: 5 } },
      { key: 'd', label: 'Three to four years. It has shaped who I am.', sets: { prep_years_band: 3 }, weights: { identity_fusion: 10 } },
      { key: 'e', label: 'More than four years. I don\'t remember who I was before it.', sets: { prep_years_band: 4 }, weights: { identity_fusion: 18 }, flags: ['GHOST_CANDIDATE'] },
    ],
  },
  {
    id: 'L1-02', level: 1,
    question: 'How many Prelims have you actually sat for — admit card in hand, hall entered?',
    options: [
      { key: 'a', label: 'None yet. My first is ahead of me.', sets: { attempts_band: 0 } },
      { key: 'b', label: 'One.', sets: { attempts_band: 1 } },
      { key: 'c', label: 'Two.', sets: { attempts_band: 2 } },
      { key: 'd', label: 'Three.', sets: { attempts_band: 3 } },
      { key: 'e', label: 'Four or more.', sets: { attempts_band: 4 }, weights: { attempt_pressure: 10 } },
    ],
  },
  {
    id: 'L1-03', level: 1,
    question: 'How far has the war taken you so far?',
    options: [
      { key: 'a', label: 'Haven\'t taken Prelims yet.', sets: { stage_pattern: 'FRESH' } },
      { key: 'b', label: 'Attempted Prelims. Haven\'t cleared it yet.', sets: { stage_pattern: 'PRELIMS_WALL' } },
      { key: 'c', label: 'Cleared Prelims. Mains is my wall.', sets: { stage_pattern: 'MAINS_PLATEAU' }, flags: ['PLATEAU_CANDIDATE'] },
      { key: 'd', label: 'Reached the interview. Missed the list.', sets: { stage_pattern: 'INTERVIEW_EDGE' }, flags: ['HEARTBREAK_CANDIDATE'] },
      { key: 'e', label: 'In a service already — fighting for a higher one.', sets: { stage_pattern: 'CLEARED_LOWER' } },
      { key: 'f', label: 'I left preparation for a while. I\'m back.', sets: { stage_pattern: 'RETURNING' } },
    ],
  },
  {
    id: 'L1-04', level: 1,
    question: 'Mains — the nine papers, the writing marathon. How many times have you faced it?',
    options: [
      { key: 'a', label: 'Never reached it yet.' },
      { key: 'b', label: 'Once. I know its taste now.' },
      { key: 'c', label: 'Twice — and my score barely moved between them.', weights: { mains_stamina: -5 }, flags: ['PLATEAU_CANDIDATE'] },
      { key: 'd', label: 'Twice or more — and I improved each time.', weights: { recovery_speed: 8, mains_stamina: 5 } },
      { key: 'e', label: 'Three or more times. The wall knows my name.', flags: ['PLATEAU_CANDIDATE'], weights: { attempt_pressure: 8 } },
    ],
  },
  {
    id: 'L1-05', level: 1,
    question: 'Was there ever a season you stepped away from preparation completely — months where the books stayed closed?',
    options: [
      { key: 'a', label: 'No. I\'ve been continuous since I started.', weights: { marathon_consistency: 8 } },
      { key: 'b', label: 'A short break — weeks, to breathe. Then back.', weights: { recovery_speed: 5 } },
      { key: 'c', label: 'Yes — a job, a duty, a life chapter took me away. I\'ve returned.', sets: { stage_pattern: 'RETURNING' } },
      { key: 'd', label: 'Yes — I broke after a result and stayed away a long time.', weights: { recovery_speed: -10 } },
      { key: 'e', label: 'I\'m technically "preparing" but honestly half-away right now.', weights: { marathon_consistency: -12, execution_friction: 8 } },
    ],
  },
  {
    id: 'L1-06', level: 1,
    question: 'Where are you on the eligibility runway? (Used only for planning math — never shown back to you.)',
    options: [
      { key: 'a', label: '24 or younger. Long runway.', sets: { age_band: 0 } },
      { key: 'b', label: '25 to 27. Mid-runway.', sets: { age_band: 1 } },
      { key: 'c', label: '28 to 30. The window is real now.', sets: { age_band: 2 }, weights: { attempt_pressure: 8 } },
      { key: 'd', label: '31 or beyond / final attempts territory.', sets: { age_band: 3 }, weights: { attempt_pressure: 15 } },
    ],
  },
  {
    id: 'L1-07', level: 1,
    question: 'Think of your last result — Prelims, Mains, or the final list. What did the following MONTH of preparation look like?',
    options: [
      { key: 'a', label: 'I haven\'t had a result yet.' },
      { key: 'b', label: 'Back at the desk within days, plan adjusted, moving.', weights: { recovery_speed: 18, marathon_consistency: 5 } },
      { key: 'c', label: 'Two or three weeks of fog, then I rebuilt.', weights: { recovery_speed: 5 } },
      { key: 'd', label: 'The month was a write-off. Recovery took a season.', weights: { recovery_speed: -12 } },
      { key: 'e', label: 'Honestly — I\'m still not fully back from it.', weights: { recovery_speed: -20, emotional_volatility: 8 } },
    ],
  },

  // ═══════════════ LEVEL 2 — THE WHY (6) ═══════════════

  {
    id: 'L2-01', level: 2,
    question: 'Finish the sentence with the answer that is true at 2 a.m., not the one for interviews: "I want to clear UPSC because…"',
    options: [
      { key: 'a', label: '…there are specific things broken in this country I want my hands on.', sets: { purpose_type: 'SERVICE' }, weights: { purpose_intensity: 15 } },
      { key: 'b', label: '…my family\'s sacrifices deserve a destination.', sets: { purpose_type: 'RESTORATION' }, weights: { purpose_intensity: 12, external_pressure: 8 } },
      { key: 'c', label: '…I cannot spend my life in the job/life I\'m currently in.', sets: { purpose_type: 'ESCAPE' }, weights: { purpose_intensity: 8 } },
      { key: 'd', label: '…the respect, the position, the name. I want to matter.', sets: { purpose_type: 'STATUS' }, weights: { purpose_intensity: 8 } },
      { key: 'e', label: '…someone said I couldn\'t. I intend to correct them.', sets: { purpose_type: 'PROOF' }, weights: { purpose_intensity: 10 } },
      { key: 'f', label: '…honestly, I\'ve never examined it. It arrived before the reasons did.', sets: { purpose_type: 'UNTESTED' }, weights: { purpose_intensity: -5 } },
    ],
  },
  {
    id: 'L2-02', level: 2,
    question: 'Trace the dream to its birth. Whose was it first?',
    options: [
      { key: 'a', label: 'Mine — a specific moment, person, or injustice lit it.', weights: { purpose_intensity: 12, anchor_strength: 5 } },
      { key: 'b', label: 'It grew slowly out of my own reading and conviction.', weights: { purpose_intensity: 8 } },
      { key: 'c', label: 'My family planted it. I adopted it and made it mine.', weights: { external_pressure: 5 } },
      { key: 'd', label: 'My family planted it. I\'m still deciding if it\'s mine.', sets: { purpose_type: 'UNTESTED' }, weights: { purpose_intensity: -8, external_pressure: 10 } },
      { key: 'e', label: 'A topper\'s story / the aura of the service pulled me in.', weights: { purpose_intensity: -3 } },
    ],
  },
  {
    id: 'L2-03', level: 2,
    question: 'Selection happens tomorrow. Your name, the list, real. The first feeling — before celebration — would be:',
    options: [
      { key: 'a', label: 'Relief. The weight finally off.', weights: { external_pressure: 8, identity_fusion: 5 } },
      { key: 'b', label: 'Vindication. Faces flash before my eyes.', weights: { purpose_intensity: 5 } },
      { key: 'c', label: 'Hunger — straight to "now the real work begins."', weights: { purpose_intensity: 12 } },
      { key: 'd', label: 'My family\'s faces. Nothing else for the first hour.', weights: { anchor_strength: 10 } },
      { key: 'e', label: 'Honestly… emptiness scares me. What would I chase next?', weights: { identity_fusion: 15 }, flags: ['FUSION_WATCH'] },
    ],
  },
  {
    id: 'L2-04', level: 2,
    question: 'A friend who loves you asks: "Why not state PCS, SSC, a corporate job — the easier doors?" Your honest internal answer:',
    options: [
      { key: 'a', label: 'Because the work I want to do only exists behind this door.', weights: { purpose_intensity: 15 } },
      { key: 'b', label: 'Because I\'d regret not trying for the top, forever.', weights: { purpose_intensity: 10 } },
      { key: 'c', label: 'I have considered them. They\'re my honest plan B, and that\'s okay.', weights: { recovery_speed: 5 } },
      { key: 'd', label: 'Because stepping down now would feel like a verdict on me.', weights: { identity_fusion: 12 } },
      { key: 'e', label: 'The question rattles me more than I admit.', weights: { purpose_intensity: -8 } },
    ],
  },
  {
    id: 'L2-05', level: 2,
    question: 'Which scene do you replay more often in your head?',
    options: [
      { key: 'a', label: 'Me in the field — a district, a crisis, a decision that helps real people.', sets: { purpose_type: 'SERVICE' }, weights: { purpose_intensity: 10 } },
      { key: 'b', label: 'The result moment — my name, the calls, the celebration.', weights: { purpose_intensity: 3 } },
      { key: 'c', label: 'Walking into my old neighbourhood after selection.', sets: { purpose_type: 'PROOF' } },
      { key: 'd', label: 'My parents\' faces when the news lands.', sets: { purpose_type: 'RESTORATION' }, weights: { anchor_strength: 8 } },
      { key: 'e', label: 'I mostly replay past failures, not future wins.', weights: { emotional_volatility: 10, recovery_speed: -5 } },
    ],
  },
  {
    id: 'L2-06', level: 2,
    question: 'Strange question. If UPSC vanished tomorrow — exam abolished — who would you be?',
    options: [
      { key: 'a', label: 'The same person, pointed at a different mountain within a month.', weights: { identity_fusion: -10, recovery_speed: 10 } },
      { key: 'b', label: 'Disoriented for a while, but I\'d find a path.', weights: { identity_fusion: 0 } },
      { key: 'c', label: 'Honestly lost. This exam is my entire architecture.', weights: { identity_fusion: 20 }, flags: ['FUSION_WATCH'] },
      { key: 'd', label: 'Relieved — and that answer surprises me.', weights: { purpose_intensity: -10, external_pressure: 10 } },
      { key: 'e', label: 'I refuse to think about this.', weights: { identity_fusion: 15 }, flags: ['FUSION_WATCH'] },
    ],
  },

  // ═══════════════ LEVEL 3 — THE DAILY REALITY (6) ═══════════════

  {
    id: 'L2-07', level: 2,
    question: 'When you picture the work after selection, which chair are you actually preparing to earn?',
    options: [
      { key: 'a', label: 'IAS: field administration, policy, and executive responsibility.', weights: { purpose_intensity: 8, cognitive_clarity: 3 } },
      { key: 'b', label: 'IPS: command, public order, and institutional leadership.', weights: { purpose_intensity: 8, cognitive_clarity: 3 } },
      { key: 'c', label: 'IFS: diplomacy, negotiation, and representing India abroad.', weights: { purpose_intensity: 8, cognitive_clarity: 3 } },
      { key: 'd', label: 'Revenue or economic services: taxation, finance, trade, or regulation.', weights: { purpose_intensity: 6, cognitive_clarity: 3 } },
      { key: 'e', label: 'Another Group A service whose work fits me better than its prestige.', weights: { purpose_intensity: 6, cognitive_clarity: 5 } },
      { key: 'f', label: 'I want selection first; I have not chosen a service honestly yet.', weights: { cognitive_clarity: -3 } },
    ],
  },
  {
    id: 'L2-08', level: 2,
    question: 'Strip away polite modesty. What rank band is the campaign in your head built to pursue?',
    options: [
      { key: 'a', label: 'Top 10. I am preparing for first-choice certainty.', weights: { purpose_intensity: 8 } },
      { key: 'b', label: 'Top 50. My target assumes a very high service allocation.', weights: { purpose_intensity: 6 } },
      { key: 'c', label: 'Top 100. I want a strong chance at a preferred service.', weights: { purpose_intensity: 5 } },
      { key: 'd', label: 'A rank that secures my chosen service, whatever that number becomes.', weights: { cognitive_clarity: 5 } },
      { key: 'e', label: 'Any place in the final list would change the war.', weights: { external_pressure: 5 } },
      { key: 'f', label: 'I have never converted the dream into a rank target.', weights: { cognitive_clarity: -4 } },
    ],
  },
  {
    id: 'L2-09', level: 2,
    question: 'Which numerical line is most real in your preparation plan right now?',
    options: [
      { key: 'a', label: 'A repeatable Prelims GS score with a clear safety margin above recent cutoffs.', weights: { prelims_nerve: 5, cognitive_clarity: 4 } },
      { key: 'b', label: 'A CSAT score that makes qualification boring rather than frightening.', weights: { prelims_nerve: 5, cognitive_clarity: 4 } },
      { key: 'c', label: 'A Mains written score strong enough that the interview is not a rescue mission.', weights: { mains_stamina: 5, cognitive_clarity: 4 } },
      { key: 'd', label: 'A final aggregate benchmark tied to my preferred service and rank.', weights: { cognitive_clarity: 6 } },
      { key: 'e', label: 'I track improvement and safety margin, not one permanent number.', weights: { cognitive_clarity: 4 } },
      { key: 'f', label: 'No score line is written down yet.', weights: { cognitive_clarity: -5, execution_friction: 3 } },
    ],
  },

  {
    id: 'L3-01', level: 3,
    question: 'Your current life structure, as it actually is:',
    options: [
      { key: 'a', label: 'Full-time preparation. The exam is my job.', sets: { employed: false } },
      { key: 'b', label: 'Full-time job + preparation in the margins.', sets: { employed: true }, weights: { external_pressure: 10 } },
      { key: 'c', label: 'College/degree + preparation alongside.', sets: { employed: false } },
      { key: 'd', label: 'Family responsibilities + preparation — caregiving, business, duties.', weights: { external_pressure: 12 } },
      { key: 'e', label: 'Part-time work / teaching to fund the preparation itself.', sets: { employed: true }, weights: { external_pressure: 8 } },
    ],
  },
  {
    id: 'L3-02', level: 3,
    question: 'Averaged over the last 30 days — not your best day, the average — your real deep-study hours:',
    options: [
      { key: 'a', label: 'Under 2 hours. The margins are thin right now.', weights: { marathon_consistency: -8 } },
      { key: 'b', label: '2–4 hours, mostly protected.', weights: { marathon_consistency: 5 } },
      { key: 'c', label: '4–7 hours, fairly consistent.', weights: { marathon_consistency: 12 } },
      { key: 'd', label: '7+ hours, machine mode.', weights: { marathon_consistency: 15 } },
      { key: 'e', label: 'Wildly inconsistent — 9 hours one day, zero for three.', weights: { marathon_consistency: -15, emotional_volatility: 8 } },
    ],
  },
  {
    id: 'L3-03', level: 3,
    question: 'The money question, privately: how long can your current arrangement sustain this preparation?',
    options: [
      { key: 'a', label: 'Years if needed. Runway is not my constraint.', weights: { external_pressure: -8 } },
      { key: 'b', label: 'Comfortably through the next attempt cycle.', weights: { external_pressure: 0 } },
      { key: 'c', label: 'About a year. After that, hard conversations.', weights: { external_pressure: 12 } },
      { key: 'd', label: 'Months. The clock is loud.', weights: { external_pressure: 20 } },
      { key: 'e', label: 'I\'m funding it myself, paycheck to preparation.', weights: { external_pressure: 15 } },
    ],
  },
  {
    id: 'L3-04', level: 3,
    question: 'The conversation about your preparation at home is best described as:',
    options: [
      { key: 'a', label: 'Full backing. They\'d fund a decade if I asked.', weights: { external_pressure: -10, anchor_strength: 5 } },
      { key: 'b', label: 'Supportive, with a quietly ticking clock underneath.', weights: { external_pressure: 8 } },
      { key: 'c', label: 'Conditional — "this attempt, then we talk."', weights: { external_pressure: 18 } },
      { key: 'd', label: 'They don\'t fully know how serious / how hard this is.', weights: { external_pressure: 8 }, flags: ['ISOLATION'] },
      { key: 'e', label: 'Tense. The topic itself is a wound at home.', weights: { external_pressure: 20, emotional_volatility: 5 } },
    ],
  },
  {
    id: 'L3-05', level: 3,
    question: 'The other timelines — marriage talk, peer salaries, "settle down" pressure. How loud are they in your head?',
    options: [
      { key: 'a', label: 'Silent. I\'ve fenced them off completely.', weights: { external_pressure: -5 } },
      { key: 'b', label: 'Background hum. Noticed, not steering.', weights: { external_pressure: 5 } },
      { key: 'c', label: 'Loud during result seasons and weddings.', weights: { external_pressure: 10, emotional_volatility: 5 } },
      { key: 'd', label: 'Constant. Every life update from peers costs me focus.', weights: { external_pressure: 15, distraction_risk: 8 } },
      { key: 'e', label: 'It\'s become the real opponent — louder than the syllabus.', weights: { external_pressure: 22 } },
    ],
  },
  {
    id: 'L3-06', level: 3,
    question: 'Last 90 days. On how many of them did you genuinely study — even one focused hour counts?',
    options: [
      { key: 'a', label: '80+. The rhythm holds.', weights: { marathon_consistency: 18 } },
      { key: 'b', label: '60–80. Solid, with human gaps.', weights: { marathon_consistency: 10 } },
      { key: 'c', label: '40–60. Stop-start. Momentum keeps escaping.', weights: { marathon_consistency: -5, execution_friction: 8 } },
      { key: 'd', label: 'Under 40. The plan exists; the days don\'t obey it.', weights: { marathon_consistency: -15, execution_friction: 12 } },
      { key: 'e', label: 'I genuinely cannot estimate — I\'ve stopped tracking.', weights: { marathon_consistency: -10 }, flags: ['REVISION_COLLAPSER'] },
    ],
  },

  // ═══════════════ LEVEL 4 — THE RESOURCE MAP (6) ═══════════════

  {
    id: 'L4-01', level: 4,
    question: 'Open your phone in your mind. How many UPSC-related Telegram channels and WhatsApp groups live there right now?',
    options: [
      { key: 'a', label: 'Zero to two. Curated and quiet.', weights: { resource_chaos: -10, distraction_risk: -5 } },
      { key: 'b', label: 'Three to seven. Manageable noise.', weights: { resource_chaos: 8 } },
      { key: 'c', label: 'Eight to fifteen. The forwards never stop.', weights: { resource_chaos: 18, distraction_risk: 10 } },
      { key: 'd', label: 'Fifteen to thirty. I\'ve muted most, deleted none.', weights: { resource_chaos: 28, distraction_risk: 15 } },
      { key: 'e', label: 'I\'ve lost count. Joining them feels like preparation.', weights: { resource_chaos: 35, distraction_risk: 18 }, flags: ['NEWSPAPER_COLLECTOR'] },
    ],
  },
  {
    id: 'L4-02', level: 4,
    question: 'Count honestly: how many sources do you currently follow for Polity alone?',
    options: [
      { key: 'a', label: 'One. Locked.', weights: { resource_chaos: 0 } },
      { key: 'b', label: 'Two — a book and a PDF.', weights: { resource_chaos: 15 } },
      { key: 'c', label: 'Three to four.', weights: { resource_chaos: 35 } },
      { key: 'd', label: 'Five or more.', weights: { resource_chaos: 55 } },
      { key: 'e', label: 'I\'ve genuinely lost count.', weights: { resource_chaos: 70, execution_friction: 10 } },
    ],
  },
  {
    id: 'L4-03', level: 4,
    question: 'Note systems — notebooks, Notion, Evernote, loose sheets, that one beautiful register. How many have you started and abandoned?',
    options: [
      { key: 'a', label: 'One system, still alive, still growing.', weights: { resource_chaos: -8, execution_friction: -5 } },
      { key: 'b', label: 'Two. One died; its successor survives.', weights: { resource_chaos: 5 } },
      { key: 'c', label: 'Three or four graveyards so far.', weights: { resource_chaos: 15, execution_friction: 10 }, flags: ['NOTES_HOARDER'] },
      { key: 'd', label: 'Five-plus. Starting fresh notes IS my coping ritual.', weights: { resource_chaos: 25, execution_friction: 18 }, flags: ['NOTES_HOARDER'] },
      { key: 'e', label: 'I mostly collect others\' notes and never make my own.', weights: { resource_chaos: 20, execution_friction: 12 }, flags: ['NOTES_HOARDER'] },
    ],
  },
  {
    id: 'L4-04', level: 4,
    question: 'A new topper-strategy video drops — "How I cleared in my first attempt." You:',
    options: [
      { key: 'a', label: 'Rarely watch them anymore. My system is set.', weights: { execution_friction: -8 } },
      { key: 'b', label: 'Watch occasionally, extract one tactic, move on.', weights: { cognitive_clarity: 5 } },
      { key: 'c', label: 'Watch most of them "for motivation."', weights: { distraction_risk: 8, execution_friction: 5 } },
      { key: 'd', label: 'Watch, take notes on the strategy, redesign my plan. Again.', weights: { execution_friction: 18 }, flags: ['STRATEGY_CONSUMER'] },
      { key: 'e', label: 'I know toppers\' timetables better than my own subjects.', weights: { execution_friction: 22, distraction_risk: 10 }, flags: ['STRATEGY_CONSUMER'] },
    ],
  },
  {
    id: 'L4-05', level: 4,
    question: 'Your current-affairs stack, described without mercy:',
    options: [
      { key: 'a', label: 'One newspaper OR one monthly magazine. Done daily/monthly. Closed loop.', weights: { resource_chaos: -8 } },
      { key: 'b', label: 'Newspaper + one compilation. Mostly current.', weights: { resource_chaos: 5 } },
      { key: 'c', label: 'Newspaper + 2-3 monthlies + daily quiz + YouTube analysis.', weights: { resource_chaos: 18 }, flags: ['NEWSPAPER_COLLECTOR'] },
      { key: 'd', label: 'A growing pile of unread monthlies that judges me from the shelf.', weights: { resource_chaos: 22, execution_friction: 10 }, flags: ['NEWSPAPER_COLLECTOR'] },
      { key: 'e', label: 'I\'ve abandoned CA out of overwhelm. I\'ll "cover it before Prelims."', weights: { resource_chaos: 15, prelims_nerve: -8 } },
    ],
  },
  {
    id: 'L4-06', level: 4,
    question: 'Thought experiment: tonight you must delete every source except ONE per subject. The feeling in your chest is:',
    options: [
      { key: 'a', label: 'Relief. Please. Someone make me do it.', weights: { resource_chaos: 5, purpose_intensity: 5 } },
      { key: 'b', label: 'Acceptance — I basically already live this way.', weights: { resource_chaos: -10 } },
      { key: 'c', label: 'Anxiety — what if the dropped source had THE question?', weights: { resource_chaos: 15, emotional_volatility: 8 } },
      { key: 'd', label: 'Resistance. My collection feels like my preparation.', weights: { resource_chaos: 22 }, flags: ['NOTES_HOARDER'] },
      { key: 'e', label: 'I\'d agree, then quietly re-download everything by Friday.', weights: { resource_chaos: 18, execution_friction: 8 } },
    ],
  },

  // ═══════════════ LEVEL 5 — THE MIND UNDER FIRE (8) ═══════════════

  {
    id: 'L5-01', level: 5,
    question: 'A full 3-hour Mains test paper is scheduled for tomorrow morning. Tonight, your honest pattern:',
    options: [
      { key: 'a', label: 'I\'ll sit it fully. Writing tests is non-negotiable in my week.', weights: { mains_stamina: 18 } },
      { key: 'b', label: 'I\'ll sit it, though my hand and mind fade by hour three.', weights: { mains_stamina: 8 } },
      { key: 'c', label: 'I\'ll probably convert it into "reading the questions and framing mentally."', weights: { mains_stamina: -10 }, flags: ['MAINS_AVOIDER'] },
      { key: 'd', label: 'I\'ll postpone it — one more revision round first. Always one more.', weights: { mains_stamina: -15, execution_friction: 10 }, flags: ['MAINS_AVOIDER'] },
      { key: 'e', label: 'Full honesty: I haven\'t written a complete timed paper yet.', weights: { mains_stamina: -20 }, flags: ['MAINS_AVOIDER'] },
    ],
  },
  {
    id: 'L5-02', level: 5,
    question: 'A 10-marker stares at you. You know maybe 60% of it. The clock is moving. You:',
    options: [
      { key: 'a', label: 'Write immediately — structure first, fill with what I have, move on.', weights: { mains_stamina: 15, prelims_nerve: 5 } },
      { key: 'b', label: 'Take a minute to frame, then write a decent 60% answer.', weights: { mains_stamina: 10 } },
      { key: 'c', label: 'Stall — the imperfection of what I\'d write paralyzes the pen.', weights: { mains_stamina: -12, execution_friction: 8 } },
      { key: 'd', label: 'Skip it, promise to return, usually don\'t.', weights: { mains_stamina: -15 } },
      { key: 'e', label: 'Over-write it to compensate, and bleed time from three other answers.', weights: { mains_stamina: -8, emotional_volatility: 5 } },
    ],
  },
  {
    id: 'L5-03', level: 5,
    question: '"Consider the following statements… How many of the above are correct?" Your gut, the moment you see this format:',
    options: [
      { key: 'a', label: 'Good. Each statement is a separate true/false battle. I like the structure.', weights: { prelims_nerve: 15, cognitive_clarity: 8 } },
      { key: 'b', label: 'Steady. Slower than direct questions, but I have a method.', weights: { prelims_nerve: 8 } },
      { key: 'c', label: 'Mild dread — one slippery statement poisons the whole question.', weights: { prelims_nerve: -8 } },
      { key: 'd', label: 'This format is personally responsible for my Prelims scores.', weights: { prelims_nerve: -15 } },
      { key: 'e', label: 'I still haven\'t built a method for these. I improvise each time.', weights: { prelims_nerve: -10, cognitive_clarity: -5 } },
    ],
  },
  {
    id: 'L5-04', level: 5,
    question: 'Your Prelims attempt-count philosophy — the real one you executed last time, not the ideal:',
    options: [
      { key: 'a', label: 'Around 85–95 attempted. Calculated aggression with elimination.', weights: { prelims_nerve: 15 } },
      { key: 'b', label: '75–85. Sure ones plus disciplined 50-50 gambles.', weights: { prelims_nerve: 10 } },
      { key: 'c', label: 'Under 70. I only touch what I\'m certain of. The −0.66 haunts me.', weights: { prelims_nerve: -15 } },
      { key: 'd', label: 'It varies wildly with my mood in the hall.', weights: { prelims_nerve: -8, emotional_volatility: 12 } },
      { key: 'e', label: 'Haven\'t sat a real Prelims yet — my strategy is theoretical.', weights: { prelims_nerve: -5 } },
    ],
  },
  {
    id: 'L5-05', level: 5,
    question: 'You read a strong editorial on, say, federal tensions. What does your mind do with it?',
    options: [
      { key: 'a', label: 'Auto-links it — Finance Commission, Governor\'s role, a Mains question forms itself.', weights: { cognitive_clarity: 18 } },
      { key: 'b', label: 'I understand it fully and file it mentally under its topic.', weights: { cognitive_clarity: 10 } },
      { key: 'c', label: 'I understand it while reading; it evaporates by evening.', weights: { cognitive_clarity: -5 }, flags: ['REVISION_COLLAPSER'] },
      { key: 'd', label: 'I highlight it, screenshot it, save it to the pile. The pile.', weights: { cognitive_clarity: -3, resource_chaos: 10 }, flags: ['NEWSPAPER_COLLECTOR'] },
      { key: 'e', label: 'Editorials feel like a foreign language I\'m pretending to read.', weights: { cognitive_clarity: -12 } },
    ],
  },
  {
    id: 'L5-06', level: 5,
    question: 'Prelims hall. Question 71. You\'ve eliminated two options; two remain. 40 seconds. What happens in your body?',
    options: [
      { key: 'a', label: 'Calm coin-flip with logic — I take the shot.', weights: { prelims_nerve: 20 } },
      { key: 'b', label: 'I mark it for review and never come back.', weights: { prelims_nerve: -10, execution_friction: 5 } },
      { key: 'c', label: 'I freeze, burn 3 minutes, guess in panic.', weights: { prelims_nerve: -20 } },
      { key: 'd', label: 'I skip — I only answer when 100% sure.', weights: { prelims_nerve: -15 } },
      { key: 'e', label: 'Depends entirely on how the first 70 went.', weights: { emotional_volatility: 15 } },
    ],
  },
  {
    id: 'L5-07', level: 5,
    question: 'CSAT. The qualifying paper that disqualifies thousands. Your honest relationship with it:',
    options: [
      { key: 'a', label: 'Comfortable. I clear it with margin in every mock.', weights: { prelims_nerve: 5 } },
      { key: 'b', label: 'Respectful — I give it weekly time because I\'ve seen it kill.', weights: { marathon_consistency: 5, prelims_nerve: 5 } },
      { key: 'c', label: 'Uneasy. Comprehension is fine; maths makes my hands cold.', weights: { prelims_nerve: -8 } },
      { key: 'd', label: 'I ignore it and pray. "It\'s just qualifying."', weights: { prelims_nerve: -12, execution_friction: 8 } },
      { key: 'e', label: 'CSAT has already cost me an attempt.', weights: { prelims_nerve: -10, attempt_pressure: 8 } },
    ],
  },
  {
    id: 'L5-08', level: 5,
    question: 'You studied a topic thoroughly last week. Today someone asks you to explain it in two minutes. What comes out?',
    options: [
      { key: 'a', label: 'A clean, structured two minutes — intro, three points, close.', weights: { cognitive_clarity: 15, mains_stamina: 5 } },
      { key: 'b', label: 'The substance, in slightly tangled order.', weights: { cognitive_clarity: 8 } },
      { key: 'c', label: 'Fragments — I recognize everything they say but can\'t produce it myself.', weights: { cognitive_clarity: -8 }, flags: ['REVISION_COLLAPSER'] },
      { key: 'd', label: 'Honestly, a week is enough for most of it to vanish without revision.', weights: { cognitive_clarity: -5, marathon_consistency: -5 }, flags: ['REVISION_COLLAPSER'] },
      { key: 'e', label: 'I\'d deflect — explaining aloud exposes me, so I avoid it.', weights: { mains_stamina: -8 }, flags: ['ISOLATION'] },
    ],
  },

  // ═══════════════ LEVEL 6 — THE EMOTIONAL CORE (7) ═══════════════

  {
    id: 'L6-01', level: 6,
    question: 'A mock result lands 30 marks below what you expected. Trace the next 48 hours honestly:',
    options: [
      { key: 'a', label: 'Two hours of sting → error analysis that same night → adjusted plan by morning.', weights: { recovery_speed: 18, emotional_volatility: -5 } },
      { key: 'b', label: 'A dark evening, then back at the desk next day.', weights: { recovery_speed: 10 } },
      { key: 'c', label: 'Two or three days of fog before I can look at the paper again.', weights: { recovery_speed: -8, emotional_volatility: 8 } },
      { key: 'd', label: 'I question the entire preparation, the dream, and myself. For a week.', weights: { recovery_speed: -15, emotional_volatility: 15 } },
      { key: 'e', label: 'I stopped taking mocks partly to avoid exactly this.', weights: { recovery_speed: -10, prelims_nerve: -8 }, flags: ['MAINS_AVOIDER'] },
    ],
  },
  {
    id: 'L6-02', level: 6,
    question: 'Result day. The PDF is out. How do you actually check?',
    options: [
      { key: 'a', label: 'Open it myself, immediately, alone and steady.', weights: { emotional_volatility: -8 } },
      { key: 'b', label: 'Open it myself after an hour of pacing.', weights: { emotional_volatility: 5 } },
      { key: 'c', label: 'Someone else checks while I sit elsewhere, heart hammering.', weights: { emotional_volatility: 12 } },
      { key: 'd', label: 'I delay for hours — sometimes a full day — until I\'m "ready."', weights: { emotional_volatility: 15 } },
      { key: 'e', label: 'I\'ve learned my results from other people\'s condolence messages.', weights: { emotional_volatility: 18 } },
    ],
  },
  {
    id: 'L6-03', level: 6,
    question: 'Your deepest preparation wound so far — the result or moment that cut worst. How healed is it, truly?',
    options: [
      { key: 'a', label: 'Fully metabolized. It teaches now instead of bleeding.', weights: { recovery_speed: 15 } },
      { key: 'b', label: 'Mostly healed. It aches in result season only.', weights: { recovery_speed: 8 } },
      { key: 'c', label: 'Scarred over but I route around it — certain topics, certain dates.', weights: { recovery_speed: -5 } },
      { key: 'd', label: 'Open. It sits in the room while I study.', weights: { recovery_speed: -15, emotional_volatility: 10 } },
      { key: 'e', label: 'No real wound yet — my journey is young.', weights: {} },
    ],
  },
  {
    id: 'L6-04', level: 6,
    question: 'A batchmate\'s name appears in this year\'s final list. The honest first feeling?',
    options: [
      { key: 'a', label: 'Pure fuel — my turn is coming.', weights: { recovery_speed: 15 }, sets: { self_belief: 'EARNED' } },
      { key: 'b', label: 'Happy for them, hollow for me.', weights: { identity_fusion: 10 } },
      { key: 'c', label: 'I avoided everyone for a week.', weights: { emotional_volatility: 20 }, flags: ['ISOLATION'] },
      { key: 'd', label: 'Did the math on my remaining attempts.', weights: { attempt_pressure: 12 } },
      { key: 'e', label: 'Felt nothing. That scared me more.', weights: { identity_fusion: 10 }, flags: ['GHOST_CANDIDATE'] },
    ],
  },
  {
    id: 'L6-05', level: 6,
    question: 'A relative at a function asks, "So beta, what do you do?" Your current answer:',
    options: [
      { key: 'a', label: 'I say it plainly — "I\'m preparing for UPSC" — and hold their gaze.', weights: { identity_fusion: 5, anchor_strength: 5 } },
      { key: 'b', label: 'I say it with a joke attached, armor pre-installed.', weights: { emotional_volatility: 5 } },
      { key: 'c', label: 'I mention a course/degree/job and leave UPSC out.', weights: { external_pressure: 8 }, flags: ['ISOLATION'] },
      { key: 'd', label: 'I avoid functions during preparation seasons entirely.', weights: { external_pressure: 10, identity_fusion: 8 }, flags: ['ISOLATION'] },
      { key: 'e', label: 'My family answers for me before I can speak. That says everything.', weights: { external_pressure: 12 } },
    ],
  },
  {
    id: 'L6-06', level: 6,
    question: 'During result weeks — yours or the batch\'s — your screen time:',
    options: [
      { key: 'a', label: 'Unchanged. I fence the noise out.', weights: { distraction_risk: -8, emotional_volatility: -5 } },
      { key: 'b', label: 'Rises — checking discussions, cutoffs, analysis threads.', weights: { distraction_risk: 8, emotional_volatility: 5 } },
      { key: 'c', label: 'Explodes — refresh loops, comparison spirals, 2 a.m. forums.', weights: { distraction_risk: 18, emotional_volatility: 12 } },
      { key: 'd', label: 'I go fully dark — uninstall everything until the storm passes.', weights: { emotional_volatility: 10 } },
      { key: 'e', label: 'Result weeks cost me the following two study weeks. Every time.', weights: { recovery_speed: -12, distraction_risk: 10 } },
    ],
  },
  {
    id: 'L6-07', level: 6,
    question: 'Sit with this sentence: "My rank will decide what I am worth." Your truthful reaction:',
    options: [
      { key: 'a', label: 'False. The exam measures preparation, not my worth. I actually believe this.', weights: { identity_fusion: -15 } },
      { key: 'b', label: 'I know it\'s false. I don\'t always feel it\'s false.', weights: { identity_fusion: 8 } },
      { key: 'c', label: 'On bad days, it is simply true.', weights: { identity_fusion: 15 } },
      { key: 'd', label: 'It is true, and everyone pretending otherwise hasn\'t lived this.', weights: { identity_fusion: 25 }, flags: ['FUSION_WATCH'] },
      { key: 'e', label: 'Reading that sentence made my chest tight.', weights: { identity_fusion: 18, emotional_volatility: 8 }, flags: ['FUSION_WATCH'] },
    ],
  },

  // ═══════════════ LEVEL 7 — THE ANCHOR (5) ═══════════════

  {
    id: 'L6-08', level: 6,
    question: 'Which thought has the most reliable key to the room you do not show people?',
    options: [
      { key: 'a', label: '"What if the years amount to nothing?"', weights: { identity_fusion: 8, emotional_volatility: 5 } },
      { key: 'b', label: '"What if I disappoint the people who carried me?"', weights: { external_pressure: 8, anchor_strength: 5 } },
      { key: 'c', label: '"What if others move ahead and I remain here?"', weights: { emotional_volatility: 8, distraction_risk: 4 } },
      { key: 'd', label: '"What if I am financially dependent for too long?"', weights: { external_pressure: 10 } },
      { key: 'e', label: '"What if failure proves I was never as capable as I believed?"', weights: { identity_fusion: 10, emotional_volatility: 6 } },
      { key: 'f', label: '"What if nobody really understands what this preparation is costing me?"', weights: { emotional_volatility: 7, recovery_speed: -3 } },
    ],
  },

  {
    id: 'L7-01', level: 7,
    question: 'On the worst day of this journey so far, what actually kept you in the fight?',
    options: [
      { key: 'a', label: 'A person — their face ended the quitting thought.', weights: { anchor_strength: 18 } },
      { key: 'b', label: 'A vow I made — to myself or someone — that I refuse to break.', weights: { anchor_strength: 15, purpose_intensity: 8 } },
      { key: 'c', label: 'The vision of the work itself — the officer I intend to be.', weights: { anchor_strength: 12, purpose_intensity: 10 } },
      { key: 'd', label: 'Inertia, honestly. Continuing was easier than deciding to stop.', weights: { anchor_strength: -10, identity_fusion: 8 } },
      { key: 'e', label: 'Nothing held me. I left for a while.', weights: { anchor_strength: -8, recovery_speed: 5 } },
    ],
  },
  {
    id: 'L7-02', level: 7,
    question: 'The reason you started and the reason you continue — are they still the same reason?',
    options: [
      { key: 'a', label: 'Same fire, now with deeper roots.', weights: { anchor_strength: 12, purpose_intensity: 8 } },
      { key: 'b', label: 'It evolved — the early reason matured into a truer one.', weights: { anchor_strength: 10, cognitive_clarity: 5 } },
      { key: 'c', label: 'The original reason faded. A newer, thinner one took its place.', weights: { anchor_strength: -8 } },
      { key: 'd', label: 'I continue mostly because I\'ve already come this far.', weights: { anchor_strength: -12, identity_fusion: 12 }, flags: ['GHOST_CANDIDATE'] },
      { key: 'e', label: 'I\'ve never audited this. The question itself is uncomfortable.', weights: { purpose_intensity: -5 } },
    ],
  },
  {
    id: 'L7-03', level: 7,
    question: 'When the quitting thought visits — and it visits everyone — what kills it?',
    options: [
      { key: 'a', label: 'My anchor appears, and the thought has no oxygen.', weights: { anchor_strength: 18 } },
      { key: 'b', label: 'Logic — I re-derive why this path beats the alternatives.', weights: { cognitive_clarity: 8, anchor_strength: 8 } },
      { key: 'c', label: 'Fear of the "what will people say" aftermath.', weights: { external_pressure: 12, anchor_strength: -5 } },
      { key: 'd', label: 'The sunk years. Quitting would mean they meant nothing.', weights: { identity_fusion: 15, anchor_strength: -8 }, flags: ['GHOST_CANDIDATE'] },
      { key: 'e', label: 'It doesn\'t fully die anymore. It lives here now, quietly.', weights: { anchor_strength: -12, purpose_intensity: -8 } },
    ],
  },
  {
    id: 'L7-04', level: 7,
    question: 'Is there a person you cannot disappoint — whose face appears uninvited during low moments?',
    options: [
      { key: 'a', label: 'Yes. They power me. The thought of their pride is fuel.', weights: { anchor_strength: 15 }, sets: { purpose_type: 'RESTORATION' } },
      { key: 'b', label: 'Yes — and it\'s equal parts fuel and weight.', weights: { anchor_strength: 10, external_pressure: 10 } },
      { key: 'c', label: 'Yes — and honestly, it\'s mostly weight now.', weights: { external_pressure: 18, anchor_strength: -5 } },
      { key: 'd', label: 'No single person. My anchor is internal.', weights: { anchor_strength: 8 } },
      { key: 'e', label: 'The person I can\'t disappoint is my younger self.', weights: { anchor_strength: 12, purpose_intensity: 8 } },
    ],
  },
  {
    id: 'L7-05', level: 7,
    question: 'Hold your anchor in your mind for five full seconds. What did holding it just create in your body?',
    options: [
      { key: 'a', label: 'Energy. A literal straightening of the spine.', weights: { anchor_strength: 18 } },
      { key: 'b', label: 'Warmth and steadiness. Quiet fuel.', weights: { anchor_strength: 12 } },
      { key: 'c', label: 'A complicated mix — love and pressure tangled together.', weights: { anchor_strength: 5, external_pressure: 8 } },
      { key: 'd', label: 'Heaviness. The anchor has become cargo.', weights: { anchor_strength: -10, external_pressure: 12 } },
      { key: 'e', label: 'Honestly — nothing. And I noticed the nothing.', weights: { anchor_strength: -15 }, flags: ['GHOST_CANDIDATE'] },
    ],
  },

  // ═══════════════ LEVEL 8 — THE MIRROR (5) ═══════════════

  {
    id: 'L7-06', level: 7,
    question: 'When the fight becomes private, whose presence has the strongest claim on your courage?',
    options: [
      { key: 'a', label: 'My mother.', weights: { anchor_strength: 12 } },
      { key: 'b', label: 'My father.', weights: { anchor_strength: 12 } },
      { key: 'c', label: 'My parents or family as a whole; separating one person would be false.', weights: { anchor_strength: 12 } },
      { key: 'd', label: 'My partner, sibling, or closest friend.', weights: { anchor_strength: 10 } },
      { key: 'e', label: 'A teacher, mentor, or senior who saw something in me.', weights: { anchor_strength: 10 } },
      { key: 'f', label: 'No single person. My strongest anchor is not human.', weights: { anchor_strength: 5 } },
    ],
  },
  {
    id: 'L7-07', level: 7,
    question: 'What does that person or circle actually do inside your preparation?',
    options: [
      { key: 'a', label: 'Their sacrifice turns quitting into a debt I refuse to leave unpaid.', weights: { anchor_strength: 12, external_pressure: 5 } },
      { key: 'b', label: 'They believed before there was evidence, and I protect that belief.', weights: { anchor_strength: 14 } },
      { key: 'c', label: 'They calm my nervous system when the exam makes everything feel unstable.', weights: { anchor_strength: 12, recovery_speed: 5 } },
      { key: 'd', label: 'They hold me accountable and do not let my excuses become a lifestyle.', weights: { anchor_strength: 10, execution_friction: -4 } },
      { key: 'e', label: 'They represent the life and security I want to build after selection.', weights: { anchor_strength: 10, purpose_intensity: 5 } },
      { key: 'f', label: 'They are part of a memory or legacy I carry forward.', weights: { anchor_strength: 12, purpose_intensity: 5 } },
      { key: 'g', label: 'My anchor is not a person, so none of these is the closest truth.', weights: { anchor_strength: 3 } },
    ],
  },
  {
    id: 'L7-08', level: 7,
    question: 'When you need to remember the kind of person this war is meant to build, which figure do you reach for?',
    options: [
      { key: 'a', label: 'A constitutional public servant known for courage and administrative integrity.', weights: { purpose_intensity: 7, anchor_strength: 7 } },
      { key: 'b', label: 'A reformer or freedom fighter who accepted a long struggle.', weights: { purpose_intensity: 7, anchor_strength: 7 } },
      { key: 'c', label: 'A strategist, thinker, or historical leader whose discipline steadies me.', weights: { cognitive_clarity: 5, anchor_strength: 7 } },
      { key: 'd', label: 'A family elder whose character matters more to me than public fame.', weights: { anchor_strength: 9 } },
      { key: 'e', label: 'A mentor, senior, or selected aspirant whose conduct feels attainable.', weights: { anchor_strength: 7 } },
      { key: 'f', label: 'No borrowed figure. I work best from my own principles.', weights: { cognitive_clarity: 5 } },
    ],
  },
  {
    id: 'L7-09', level: 7,
    question: 'If applause, comparison, and family expectations went silent for one year, what would still make you return to the desk?',
    options: [
      { key: 'a', label: 'The work itself: I want responsibility over problems that matter.', sets: { purpose_type: 'SERVICE' }, weights: { purpose_intensity: 12 } },
      { key: 'b', label: 'Restoration: I want to change what is possible for my family.', sets: { purpose_type: 'RESTORATION' }, weights: { purpose_intensity: 10, anchor_strength: 5 } },
      { key: 'c', label: 'Proof: I need to know what my full capacity can do.', sets: { purpose_type: 'PROOF' }, weights: { purpose_intensity: 9 } },
      { key: 'd', label: 'Freedom: the career would give me agency, security, and a larger life.', sets: { purpose_type: 'ESCAPE' }, weights: { purpose_intensity: 8 } },
      { key: 'e', label: 'Mastery: becoming capable enough for this exam has meaning of its own.', weights: { purpose_intensity: 9, cognitive_clarity: 4 } },
      { key: 'f', label: 'Recognition: I want the authority and standing that selection brings.', sets: { purpose_type: 'STATUS' }, weights: { purpose_intensity: 7 } },
      { key: 'g', label: 'A promise: something unfinished would remain unfinished if I walked away.', weights: { purpose_intensity: 10, anchor_strength: 8 } },
    ],
  },

  {
    id: 'L8-01', level: 8,
    question: 'The naked question. Beneath strategy, beneath hope: do you believe you will clear this exam?',
    options: [
      { key: 'a', label: 'Yes — and I can point to evidence: scores, growth, work done.', sets: { self_belief: 'EARNED' }, weights: { purpose_intensity: 8 } },
      { key: 'b', label: 'Yes — though if I\'m honest, it\'s faith more than evidence.', sets: { self_belief: 'BORROWED' } },
      { key: 'c', label: 'I believed once. Results have been eroding it.', sets: { self_belief: 'BROKEN' }, weights: { recovery_speed: -8 } },
      { key: 'd', label: 'I don\'t know — I\'ve never been tested at this scale.', sets: { self_belief: 'UNTESTED' } },
      { key: 'e', label: 'Some weeks yes, some weeks no. Belief follows my last mock score.', sets: { self_belief: 'BORROWED' }, weights: { emotional_volatility: 12 } },
    ],
  },
  {
    id: 'L8-02', level: 8,
    question: 'Wherever that belief stands — what is it actually built on?',
    options: [
      { key: 'a', label: 'Track record — I\'ve done hard things before and this is the next one.', weights: { recovery_speed: 8 }, sets: { self_belief: 'EARNED' } },
      { key: 'b', label: 'Work evidence — my mock trajectory and answer growth are real.', weights: { cognitive_clarity: 5 }, sets: { self_belief: 'EARNED' } },
      { key: 'c', label: 'Other people\'s belief in me. They see something; I borrow it.', sets: { self_belief: 'BORROWED' }, weights: { anchor_strength: 5 } },
      { key: 'd', label: 'Necessity — I believe because the alternative is unthinkable.', weights: { identity_fusion: 12, external_pressure: 8 } },
      { key: 'e', label: 'Honestly examined: I\'m not sure it\'s built on anything yet.', sets: { self_belief: 'UNTESTED' } },
    ],
  },
  {
    id: 'L8-03', level: 8,
    question: 'The last time you identified a real weakness in yourself — not a topic, a pattern — what happened in the following two weeks?',
    options: [
      { key: 'a', label: 'I built a counter-system and it largely worked.', weights: { execution_friction: -12, recovery_speed: 8 } },
      { key: 'b', label: 'I addressed it partially. Progress, not victory.', weights: { execution_friction: -5 } },
      { key: 'c', label: 'I planned the fix beautifully. The plan is still waiting.', weights: { execution_friction: 15 }, flags: ['STRATEGY_CONSUMER'] },
      { key: 'd', label: 'I noted it, felt bad, and changed nothing.', weights: { execution_friction: 12 } },
      { key: 'e', label: 'I avoid the self-audit entirely. It costs too much morale.', weights: { execution_friction: 10, emotional_volatility: 8 } },
    ],
  },
  {
    id: 'L8-04', level: 8,
    question: 'In a moment, KAUTILYA will tell you things about yourself that may be uncomfortable. Your honest posture toward that:',
    options: [
      { key: 'a', label: 'Bring it. Accurate and harsh beats kind and useless.', weights: { recovery_speed: 8, purpose_intensity: 5 } },
      { key: 'b', label: 'Ready — as long as it comes with a repair path.', weights: { cognitive_clarity: 5 } },
      { key: 'c', label: 'Nervous, but I\'d rather know than not.', weights: {} },
      { key: 'd', label: 'I\'ll read it, defend against it internally, accept it three days later.', weights: { execution_friction: 8 } },
      { key: 'e', label: 'If it\'s too dark, I may not come back to this app. Being honest.', weights: { emotional_volatility: 12 }, flags: ['FUSION_WATCH'] },
    ],
  },
  {
    id: 'L8-05', level: 8,
    question: 'Does this journey have a walk-away line — a point where you\'d choose a different life with pride?',
    options: [
      { key: 'a', label: 'Yes — a defined attempt/age line, decided calmly, in writing.', sets: { self_belief: 'EARNED' }, weights: { identity_fusion: -10 } },
      { key: 'b', label: 'I refuse to think about it.', weights: { identity_fusion: 20 }, flags: ['FUSION_WATCH'] },
      { key: 'c', label: 'My family\'s investment makes quitting impossible.', weights: { external_pressure: 20 }, sets: { purpose_type: 'RESTORATION' } },
      { key: 'd', label: 'This exam IS the plan. There is no other me.', weights: { identity_fusion: 30 }, flags: ['FUSION_WATCH'] },
      { key: 'e', label: 'I had one. I crossed it already.', weights: { identity_fusion: 15, attempt_pressure: 10 }, flags: ['GHOST_CANDIDATE'] },
    ],
  },
  {
    id: 'L8-06', level: 8,
    question: 'Which law, obeyed for the next 90 days, would protect you from your most predictable self-sabotage?',
    options: [
      { key: 'a', label: 'One final source per subject; repetition outranks collection.', weights: { resource_chaos: -8, cognitive_clarity: 5 } },
      { key: 'b', label: 'A daily minimum survives even when the ideal schedule collapses.', weights: { marathon_consistency: 6, execution_friction: -4 } },
      { key: 'c', label: 'Testing and retrieval happen before I feel perfectly prepared.', weights: { prelims_nerve: 5, mains_stamina: 5, execution_friction: -4 } },
      { key: 'd', label: 'Every week ends with evidence, review, and one corrected command.', weights: { cognitive_clarity: 6, marathon_consistency: 5 } },
      { key: 'e', label: 'A bad result earns analysis and recovery, never disappearance.', weights: { recovery_speed: 7, emotional_volatility: -3 } },
      { key: 'f', label: 'Plans are written from available hours and energy, not fantasy.', weights: { cognitive_clarity: 6, execution_friction: -4 } },
      { key: 'g', label: 'I know my weakness, but I have not yet chosen the law that governs it.', weights: { execution_friction: 5 } },
    ],
  },
  {
    id: 'L8-07', level: 8,
    question: 'Under real pressure, which operating rhythm produces your best work most consistently?',
    options: [
      { key: 'a', label: 'Quiet repetition: stable hours, fixed sources, low drama.', weights: { marathon_consistency: 7, resource_chaos: -4 } },
      { key: 'b', label: 'Structured sprints: intense blocks followed by deliberate recovery.', weights: { recovery_speed: 5, marathon_consistency: 4 } },
      { key: 'c', label: 'Deadline command: clear tests and public dates sharpen me.', weights: { execution_friction: -4, mains_stamina: 4 } },
      { key: 'd', label: 'Human accountability: I execute better when someone expects evidence.', weights: { execution_friction: -4, anchor_strength: 4 } },
      { key: 'e', label: 'Protected solitude: deep work improves when messages and comparison disappear.', weights: { distraction_risk: -5, cognitive_clarity: 4 } },
      { key: 'f', label: 'Energy-aware adaptation: I need different tasks for high- and low-energy windows.', weights: { cognitive_clarity: 5, recovery_speed: 4 } },
      { key: 'g', label: 'I keep borrowing rhythms from others and have not found my own.', weights: { execution_friction: 5, cognitive_clarity: -4 } },
    ],
  },
]

function normalizeWeights(weights?: LegacyCardOption['weights']): {
  weights?: Partial<Record<Dimension, number>>
  attemptPressureDelta?: number
} {
  if (!weights) return {}

  const normalized: Partial<Record<Dimension, number>> = {}
  let attemptPressureDelta = 0

  for (const [dimension, delta] of Object.entries(weights)) {
    if (typeof delta !== 'number') continue
    if (dimension === 'attempt_pressure') {
      attemptPressureDelta += delta
      continue
    }
    normalized[dimension as Dimension] = delta
  }

  return {
    weights: Object.keys(normalized).length > 0 ? normalized : undefined,
    attemptPressureDelta: attemptPressureDelta !== 0 ? attemptPressureDelta : undefined,
  }
}

function normalizeProfile(sets?: LegacyCardOption['sets']): ProfileFacts | undefined {
  if (!sets) return undefined

  const profile: ProfileFacts = {}
  if (typeof sets.employed === 'boolean') profile.employed = sets.employed
  if (sets.prep_years_band != null) profile.prep_years = PREP_YEARS_BY_BAND[sets.prep_years_band]
  if (sets.attempts_band != null) profile.attempts_taken = ATTEMPTS_BY_BAND[sets.attempts_band]
  if (sets.age_band != null) profile.age = AGE_BY_BAND[sets.age_band]

  return Object.keys(profile).length > 0 ? profile : undefined
}

function normalizeFlags(flags?: string[]): string[] | undefined {
  if (!flags || flags.length === 0) return undefined

  const normalized = new Set<string>()
  for (const flag of flags) {
    const aliases = FLAG_ALIASES[flag] ?? [flag]
    aliases.forEach(alias => normalized.add(alias))
  }

  return [...normalized]
}

function normalizeOption(option: LegacyCardOption): CardOption {
  const { weights, attemptPressureDelta } = normalizeWeights(option.weights)
  const profile = normalizeProfile(option.sets)
  const flags = normalizeFlags(option.flags)
  const sets: CardOption['sets'] = {}

  if (option.sets?.stage_pattern) sets.stage_pattern = option.sets.stage_pattern
  if (option.sets?.purpose_type) sets.purpose_type = option.sets.purpose_type
  if (option.sets?.self_belief) sets.self_belief = SELF_BELIEF_MAP[option.sets.self_belief]
  if (profile) sets.profile = profile
  if (flags) sets.flags = flags
  if (attemptPressureDelta) sets.attempt_pressure_delta = attemptPressureDelta

  return {
    key: option.key,
    label: option.label,
    weights,
    sets: Object.keys(sets).length > 0 ? sets : undefined,
  }
}

export const CARDS: Card[] = RAW_CARDS.map(card => ({
  ...card,
  options: card.options.map(normalizeOption),
}))

export const FREE_DIAGNOSIS_CARD_IDS = new Set<string>([
  'L1-01', 'L1-02', 'L1-03', 'L1-06', 'L1-07',
  'L2-01', 'L2-02', 'L2-03', 'L2-04', 'L2-06', 'L2-07',
  'L3-01', 'L3-02', 'L3-03', 'L3-04', 'L3-06',
  'L4-02', 'L4-03', 'L4-05', 'L4-06',
  'L5-01', 'L5-03', 'L5-04', 'L5-06', 'L5-08',
  'L6-01', 'L6-03', 'L6-04', 'L6-07', 'L6-08',
  'L7-01', 'L7-03', 'L7-04', 'L7-06', 'L7-09',
  'L8-01', 'L8-03', 'L8-05', 'L8-06', 'L8-07',
])

export const FREE_DIAGNOSIS_CARDS: Card[] = CARDS.filter(card => FREE_DIAGNOSIS_CARD_IDS.has(card.id))
export const PAID_DIAGNOSIS_CARDS: Card[] = CARDS

export function isLastCardOfLevel(index: number, cards: Card[]): boolean {
  const next = cards[index + 1]
  return !next || next.level !== cards[index].level
}

export function getCardById(id: string): Card | undefined {
  return CARDS.find(c => c.id === id)
}
