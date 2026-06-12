// ============================================================
// KAUTILYA UPSC — The 52-Card Instrument
// 8 levels · one card per screen · max 6 options · second person,
// visceral, zero judgment. Dimensions score silently.
// ============================================================

import type { Card, CardLevel } from './types'

export const LEVEL_NAMES: Record<CardLevel, string> = {
  1: 'The Journey So Far',
  2: 'The Why',
  3: 'Daily Reality',
  4: 'The Resource Map',
  5: 'Mind Under Fire',
  6: 'The Emotional Core',
  7: 'The Anchor',
  8: 'The Mirror',
}

export const LEVEL_SUBTITLES: Record<CardLevel, string> = {
  1: 'Where the war has taken you.',
  2: 'Why you are really in it.',
  3: 'Where your day actually goes.',
  4: 'What you carry into battle.',
  5: 'What pressure does to your judgement.',
  6: 'What the journey has done to you.',
  7: 'What holds you up.',
  8: 'What you already know but have not said.',
}

// ── L1 — The Journey So Far (7) ─────────────────────────────────

const L1: Card[] = [
  {
    id: 'L1-01',
    level: 1,
    question: 'What should KAUTILYA call you?',
    microcopy: 'A command system needs to know who it is commanding.',
    input: 'text',
    placeholder: 'Your name, or what you go by',
    options: [],
  },
  {
    id: 'L1-02',
    level: 1,
    question: 'How long have you been preparing — honestly, including the half-hearted months?',
    microcopy: 'The half-hearted months count. They taught you something too.',
    options: [
      { key: 'a', label: 'I have not started yet. I am deciding.', sets: { profile: { prep_years: 0 } } },
      { key: 'b', label: 'Under a year.', sets: { profile: { prep_years: 0.5 } } },
      { key: 'c', label: 'One to two years.', sets: { profile: { prep_years: 1.5 } } },
      { key: 'd', label: 'Two to four years.', sets: { profile: { prep_years: 3 } }, weights: { marathon_consistency: 5 } },
      { key: 'e', label: 'Four years or more. This exam has a wing in my life.', sets: { profile: { prep_years: 5 } }, weights: { identity_fusion: 10 } },
    ],
  },
  {
    id: 'L1-03',
    level: 1,
    question: 'How far has the war taken you so far?',
    microcopy: 'Not where you wanted to be. Where you actually are.',
    options: [
      { key: 'a', label: 'I am starting fresh. No attempt yet.', sets: { stage_pattern: 'FRESH' } },
      { key: 'b', label: 'I have attempted Prelims but never crossed it.', sets: { stage_pattern: 'PRELIMS_WALL' } },
      { key: 'c', label: 'I have written Mains but never been called for the Interview.', sets: { stage_pattern: 'MAINS_PLATEAU' } },
      { key: 'd', label: 'I have faced the Interview board and missed the list.', sets: { stage_pattern: 'INTERVIEW_EDGE' } },
      { key: 'e', label: 'I cleared — but into a service I did not want.', sets: { stage_pattern: 'CLEARED_LOWER' } },
      { key: 'f', label: 'I left the preparation once. I am coming back.', sets: { stage_pattern: 'RETURNING' } },
    ],
  },
  {
    id: 'L1-04',
    level: 1,
    question: 'How many times have you sat in the Prelims hall?',
    microcopy: 'A number, not a verdict. The system uses it in math, not in judgment.',
    options: [
      { key: 'a', label: 'Never. This will be my first.', sets: { profile: { attempts_taken: 0 } } },
      { key: 'b', label: 'Once.', sets: { profile: { attempts_taken: 1 } } },
      { key: 'c', label: 'Twice.', sets: { profile: { attempts_taken: 2 } } },
      { key: 'd', label: 'Three times.', sets: { profile: { attempts_taken: 3 } } },
      { key: 'e', label: 'Four times.', sets: { profile: { attempts_taken: 4 } } },
      { key: 'f', label: 'Five or more.', sets: { profile: { attempts_taken: 5 } } },
    ],
  },
  {
    id: 'L1-05',
    level: 1,
    question: 'And the Mains hall — how many times have you written all nine papers?',
    options: [
      { key: 'a', label: 'Never reached it.', sets: { profile: { attempts_mains: 0 } } },
      { key: 'b', label: 'Once.', sets: { profile: { attempts_mains: 1 } }, weights: { mains_stamina: 10 } },
      { key: 'c', label: 'Twice.', sets: { profile: { attempts_mains: 2 } }, weights: { mains_stamina: 15 } },
      { key: 'd', label: 'Three or more times.', sets: { profile: { attempts_mains: 3 } }, weights: { mains_stamina: 20 } },
      { key: 'e', label: 'I reached Mains once but could not complete all papers.', sets: { profile: { attempts_mains: 1 } }, weights: { mains_stamina: -10, emotional_volatility: 10 } },
    ],
  },
  {
    id: 'L1-06',
    level: 1,
    question: 'Your age, roughly?',
    microcopy: 'Used only to compute what the calendar actually allows. Never shown back to you.',
    options: [
      { key: 'a', label: '21 or younger', sets: { profile: { age: 21 } } },
      { key: 'b', label: '22 to 24', sets: { profile: { age: 23 } } },
      { key: 'c', label: '25 to 27', sets: { profile: { age: 26 } } },
      { key: 'd', label: '28 to 30', sets: { profile: { age: 29 } } },
      { key: 'e', label: '31 or 32', sets: { profile: { age: 31 } } },
      { key: 'f', label: 'Past 32 — I have a category extension', sets: { profile: { age: 34 } } },
    ],
  },
  {
    id: 'L1-07',
    level: 1,
    question: 'Are you fighting this war with a job on your back?',
    options: [
      { key: 'a', label: 'Full-time job. I study around it.', sets: { profile: { employed: true } }, weights: { execution_friction: 10 } },
      { key: 'b', label: 'Part-time or freelance work.', sets: { profile: { employed: true } }, weights: { execution_friction: 5 } },
      { key: 'c', label: 'I left a job for this.', sets: { profile: { employed: false } }, weights: { purpose_intensity: 10, external_pressure: 10 } },
      { key: 'd', label: 'Full-time aspirant. No job yet.', sets: { profile: { employed: false } } },
      { key: 'e', label: 'Still in college, preparing alongside.', sets: { profile: { employed: false } } },
    ],
  },
]

// ── L2 — The Why (6) ────────────────────────────────────────────

const L2: Card[] = [
  {
    id: 'L2-01',
    level: 2,
    question: 'Strip away the answers you give at family functions. Why are you really doing this?',
    options: [
      { key: 'a', label: 'I have seen what bad administration does to people like mine. I want my hands on the levers.', sets: { purpose_type: 'SERVICE' }, weights: { purpose_intensity: 20 } },
      { key: 'b', label: 'My family gave up things for me. This is how I give them back.', sets: { purpose_type: 'RESTORATION' }, weights: { purpose_intensity: 15, external_pressure: 15 } },
      { key: 'c', label: 'I need a way out of the life currently scheduled for me.', sets: { purpose_type: 'ESCAPE' }, weights: { purpose_intensity: 10 } },
      { key: 'd', label: 'The respect. The room going quiet. I want that, and I am not ashamed of it.', sets: { purpose_type: 'STATUS' }, weights: { purpose_intensity: 10 } },
      { key: 'e', label: 'People decided I could not. I am here to correct the record.', sets: { purpose_type: 'PROOF' }, weights: { purpose_intensity: 15, emotional_volatility: 10 } },
      { key: 'f', label: 'Honestly — I have never put it into words.', sets: { purpose_type: 'UNTESTED' }, weights: { purpose_intensity: -10, anchor_strength: -10 } },
    ],
  },
  {
    id: 'L2-02',
    level: 2,
    question: 'Whose face appears when you imagine the final list with your name on it?',
    options: [
      { key: 'a', label: 'My parents. Before anyone else, them.', weights: { external_pressure: 15, anchor_strength: 10 } },
      { key: 'b', label: 'My own. Younger me, who needed this.', weights: { purpose_intensity: 10, identity_fusion: 10 } },
      { key: 'c', label: 'The people from where I grew up.', weights: { purpose_intensity: 15, anchor_strength: 10 } },
      { key: 'd', label: 'The relatives and batchmates who kept score against me.', weights: { emotional_volatility: 10, external_pressure: 10 } },
      { key: 'e', label: 'No face. Just relief — an enormous, silent relief.', weights: { identity_fusion: 15, emotional_volatility: 5 } },
    ],
  },
  {
    id: 'L2-03',
    level: 2,
    question: 'If selection were guaranteed — but only after seven more years — would you stay in?',
    microcopy: 'There is no right answer. There is only your answer.',
    options: [
      { key: 'a', label: 'Yes. The work itself is the point.', weights: { purpose_intensity: 20, marathon_consistency: 10 } },
      { key: 'b', label: 'Yes, but it would hollow me out.', weights: { purpose_intensity: 10, identity_fusion: 15 } },
      { key: 'c', label: 'No. I would build the same impact another way.', weights: { cognitive_clarity: 10, anchor_strength: 10 } },
      { key: 'd', label: 'No. Seven years is a price I refuse to name out loud.', weights: { external_pressure: 10 } },
      { key: 'e', label: 'I genuinely cannot answer this.', weights: { purpose_intensity: -5, anchor_strength: -5 } },
    ],
  },
  {
    id: 'L2-04',
    level: 2,
    question: 'When did the IAS dream actually enter your life?',
    options: [
      { key: 'a', label: 'Childhood. Someone in uniform, or a collector visiting the village. It never left.', weights: { purpose_intensity: 10, identity_fusion: 10 } },
      { key: 'b', label: 'College — I found the work meaningful, not just prestigious.', weights: { purpose_intensity: 10, cognitive_clarity: 5 } },
      { key: 'c', label: 'After my first job. The work felt small; this felt large.', weights: { purpose_intensity: 10 } },
      { key: 'd', label: 'My family chose it before I did. I grew into it.', weights: { external_pressure: 20 } },
      { key: 'e', label: 'A friend started preparing, and the idea caught.', weights: { purpose_intensity: -5, distraction_risk: 5 } },
    ],
  },
  {
    id: 'L2-05',
    level: 2,
    question: 'What fuels the late hours — be precise?',
    options: [
      { key: 'a', label: 'Duty. A debt I intend to pay.', weights: { purpose_intensity: 15, marathon_consistency: 10 } },
      { key: 'b', label: 'Hunger. I want the work, the scale, the room.', weights: { purpose_intensity: 15 } },
      { key: 'c', label: 'Fear. Of becoming ordinary, of wasted years.', weights: { emotional_volatility: 15, identity_fusion: 10 } },
      { key: 'd', label: 'Anger. At someone, or something, that doubted me.', weights: { purpose_intensity: 10, emotional_volatility: 15 } },
      { key: 'e', label: 'Habit. The hours happen because they have always happened.', weights: { marathon_consistency: 10, purpose_intensity: -10 } },
    ],
  },
  {
    id: 'L2-06',
    level: 2,
    question: 'Complete the sentence honestly: "If I clear this exam, my life finally becomes..."',
    options: [
      { key: 'a', label: '...useful at the scale I have always wanted.', weights: { purpose_intensity: 15 } },
      { key: 'b', label: '...secure. For me and everyone leaning on me.', weights: { external_pressure: 10 } },
      { key: 'c', label: '...mine. I finally get to make my own decisions.', weights: { purpose_intensity: 10 } },
      { key: 'd', label: '...justified. Every sacrifice gets its receipt.', weights: { identity_fusion: 20 } },
      { key: 'e', label: '...quiet. The questions stop.', weights: { external_pressure: 15, identity_fusion: 10 } },
    ],
  },
]

// ── L3 — Daily Reality (6) ──────────────────────────────────────

const L3: Card[] = [
  {
    id: 'L3-01',
    level: 3,
    question: 'On a real weekday — not your best one — how many focused hours do you actually get?',
    options: [
      { key: 'a', label: 'Under two. The day eats the rest.', weights: { execution_friction: 15, marathon_consistency: -10 } },
      { key: 'b', label: 'Two to four.', weights: { marathon_consistency: 5 } },
      { key: 'c', label: 'Four to six.', weights: { marathon_consistency: 10 } },
      { key: 'd', label: 'Six to eight.', weights: { marathon_consistency: 15 } },
      { key: 'e', label: 'Eight plus — but I cannot hold it daily.', weights: { marathon_consistency: -5, emotional_volatility: 10 } },
      { key: 'f', label: 'It swings wildly. Some days ten, some days zero.', weights: { marathon_consistency: -15, emotional_volatility: 10 } },
    ],
  },
  {
    id: 'L3-02',
    level: 3,
    question: 'You miss a full study day. What does the next morning look like?',
    options: [
      { key: 'a', label: 'I open the books at the usual time. The missed day is archived.', weights: { recovery_speed: 25, marathon_consistency: 10 } },
      { key: 'b', label: 'I start with guilt, but I start.', weights: { recovery_speed: 15 } },
      { key: 'c', label: 'I overcorrect — a brutal 12-hour plan that collapses by evening.', weights: { recovery_speed: -5, emotional_volatility: 10 } },
      { key: 'd', label: 'One missed day usually becomes three.', weights: { recovery_speed: -15, marathon_consistency: -10 } },
      { key: 'e', label: 'One missed day can become a lost week.', weights: { recovery_speed: -25, marathon_consistency: -15 } },
    ],
  },
  {
    id: 'L3-03',
    level: 3,
    question: 'Where does your phone live while you study?',
    options: [
      { key: 'a', label: 'Another room. We are separated for the duration.', weights: { distraction_risk: -15 } },
      { key: 'b', label: 'On the desk, face down, mostly behaving.', weights: { distraction_risk: 5 } },
      { key: 'c', label: 'On the desk — and it wins more rounds than I admit.', weights: { distraction_risk: 20 } },
      { key: 'd', label: 'In my hand. My "study breaks" are scrolling sessions.', weights: { distraction_risk: 30, execution_friction: 10 } },
      { key: 'e', label: 'I study from the phone, so it is always there — open gates everywhere.', weights: { distraction_risk: 25, resource_chaos: 10 } },
    ],
  },
  {
    id: 'L3-04',
    level: 3,
    question: 'Describe your study space without flattering it.',
    options: [
      { key: 'a', label: 'A fixed desk that knows me. Same place, same hours.', weights: { execution_friction: -10, marathon_consistency: 10 } },
      { key: 'b', label: 'A library or reading room I commute to.', weights: { marathon_consistency: 5 } },
      { key: 'c', label: 'My bed, mostly. We both know it is a problem.', weights: { execution_friction: 15, distraction_risk: 10 } },
      { key: 'd', label: 'Wherever the house allows that day. No territory of my own.', weights: { execution_friction: 20, external_pressure: 5 } },
      { key: 'e', label: 'Cafés, hostels, moving targets. I am a nomad.', weights: { execution_friction: 10, resource_chaos: 5 } },
    ],
  },
  {
    id: 'L3-05',
    level: 3,
    question: 'The hours between intention and action — what fills them?',
    microcopy: 'You sat down to study at 9. It is 9:50. What happened?',
    options: [
      { key: 'a', label: 'Nothing. I started at 9. This is not my war.', weights: { execution_friction: -15 } },
      { key: 'b', label: 'Arranging — the desk, the playlist, the perfect plan for the session.', weights: { execution_friction: 20 } },
      { key: 'c', label: 'One more video about how toppers study.', weights: { execution_friction: 20, distraction_risk: 10 } },
      { key: 'd', label: 'Re-reading the schedule. Re-making the schedule.', weights: { execution_friction: 25, cognitive_clarity: 5 } },
      { key: 'e', label: 'The news cycle, the group chats, the noise.', weights: { distraction_risk: 20 } },
    ],
  },
  {
    id: 'L3-06',
    level: 3,
    question: 'Who controls your daily timetable in practice?',
    options: [
      { key: 'a', label: 'Me. The day runs on my rails.', weights: { execution_friction: -10, marathon_consistency: 10 } },
      { key: 'b', label: 'My job. I study in the spaces it leaves.', weights: { execution_friction: 10 } },
      { key: 'c', label: 'My family. Errands, duties, interruptions arrive unannounced.', weights: { execution_friction: 15, external_pressure: 10 } },
      { key: 'd', label: 'My mood. Good days run; bad days drift.', weights: { emotional_volatility: 15, marathon_consistency: -10 } },
      { key: 'e', label: 'Honestly, no one. The day just happens to me.', weights: { execution_friction: 20, marathon_consistency: -10 } },
    ],
  },
]

// ── L4 — The Resource Map (7) ───────────────────────────────────

const L4: Card[] = [
  {
    id: 'L4-01',
    level: 4,
    question: 'How did you choose your current booklist?',
    options: [
      { key: 'a', label: 'One standard source per subject, chosen once, never reopened.', weights: { resource_chaos: -15, cognitive_clarity: 10 } },
      { key: 'b', label: 'A topper\'s list I trust and follow.', weights: { resource_chaos: -5 } },
      { key: 'c', label: 'I keep upgrading — every recommendation becomes a purchase.', weights: { resource_chaos: 20, execution_friction: 10 } },
      { key: 'd', label: 'Whatever the coaching gave me, plus whatever YouTube added.', weights: { resource_chaos: 15 } },
      { key: 'e', label: 'There is no list. There is a pile.', weights: { resource_chaos: 30 } },
    ],
  },
  {
    id: 'L4-02',
    level: 4,
    question: 'Count honestly: how many sources do you currently follow for Polity alone?',
    microcopy: 'Books, coaching notes, YouTube channels, PDFs, telegram files. All of them.',
    options: [
      { key: 'a', label: 'One. Laxmikanth and I are monogamous.', weights: { resource_chaos: 0 } },
      { key: 'b', label: 'Two — a book and one set of notes.', weights: { resource_chaos: 15 } },
      { key: 'c', label: 'Three or four.', weights: { resource_chaos: 35 } },
      { key: 'd', label: 'Five or six.', weights: { resource_chaos: 55 } },
      { key: 'e', label: 'I have lost count.', weights: { resource_chaos: 70, execution_friction: 10 } },
    ],
  },
  {
    id: 'L4-03',
    level: 4,
    question: 'What is your current-affairs system, truthfully?',
    options: [
      { key: 'a', label: 'One newspaper or one monthly compilation, processed daily. Done.', weights: { resource_chaos: -10, marathon_consistency: 5 } },
      { key: 'b', label: 'The newspaper, read but rarely noted.', weights: { resource_chaos: 5 }, sets: { flags: ['NEWSPAPER_PROXY'] } },
      { key: 'c', label: 'I collect compilations — monthly PDFs stack up faster than I read them.', weights: { resource_chaos: 20, execution_friction: 10 }, sets: { flags: ['NEWSPAPER_PROXY'] } },
      { key: 'd', label: 'Three sources in parallel: paper, channel, compilation. None complete.', weights: { resource_chaos: 25, distraction_risk: 10 }, sets: { flags: ['NEWSPAPER_PROXY'] } },
      { key: 'e', label: 'Current affairs is my biggest backlog and my biggest fear.', weights: { resource_chaos: 15, emotional_volatility: 10 }, sets: { flags: ['NEWSPAPER_PROXY'] } },
    ],
  },
  {
    id: 'L4-04',
    level: 4,
    question: 'Your notes situation — pick the sentence that stings.',
    options: [
      { key: 'a', label: 'One compact set per subject, revised on schedule.', weights: { resource_chaos: -15, marathon_consistency: 10 } },
      { key: 'b', label: 'Good notes for some subjects, chaos for the rest.', weights: { resource_chaos: 10 } },
      { key: 'c', label: 'I make beautiful notes I never revisit.', weights: { resource_chaos: 15, execution_friction: 15 } },
      { key: 'd', label: 'I keep restarting my notes from scratch in a better format.', weights: { resource_chaos: 20, execution_friction: 20 } },
      { key: 'e', label: 'I hoard everyone else\'s notes and trust none of them, including mine.', weights: { resource_chaos: 25, execution_friction: 15 } },
    ],
  },
  {
    id: 'L4-05',
    level: 4,
    question: 'How many full cycles of the Prelims syllabus have you actually completed?',
    microcopy: 'Reading once cover-to-cover counts as one cycle. Be merciless.',
    options: [
      { key: 'a', label: 'None yet. First pass in progress.', weights: { cognitive_clarity: 0 } },
      { key: 'b', label: 'One full cycle.', weights: { cognitive_clarity: 10 } },
      { key: 'c', label: 'Two to three cycles.', weights: { cognitive_clarity: 20, marathon_consistency: 10 } },
      { key: 'd', label: 'Many cycles — the books are annotated like scripture.', weights: { cognitive_clarity: 25, marathon_consistency: 10 } },
      { key: 'e', label: 'Parts of it many times. Other parts never. The map has holes.', weights: { cognitive_clarity: -5, resource_chaos: 15 } },
    ],
  },
  {
    id: 'L4-06',
    level: 4,
    question: 'Test series — how many are you enrolled in right now?',
    options: [
      { key: 'a', label: 'One. I trust it and finish its papers.', weights: { resource_chaos: -10, prelims_nerve: 5 } },
      { key: 'b', label: 'One, but I attempt the papers irregularly.', weights: { marathon_consistency: -10 } },
      { key: 'c', label: 'Two or three, partially attempted.', weights: { resource_chaos: 15 } },
      { key: 'd', label: 'I download every "all India" test floating around. Attempt rate: low.', weights: { resource_chaos: 25, execution_friction: 10 } },
      { key: 'e', label: 'None. Tests scare me more than they should.', weights: { prelims_nerve: -15, emotional_volatility: 10 } },
    ],
  },
  {
    id: 'L4-07',
    level: 4,
    question: 'If KAUTILYA ordered you to delete every source but one per subject — what happens inside you?',
    options: [
      { key: 'a', label: 'Relief. I have been waiting for permission.', weights: { resource_chaos: 5, cognitive_clarity: 10 } },
      { key: 'b', label: 'Agreement, with a private list of exceptions.', weights: { resource_chaos: 10 } },
      { key: 'c', label: 'Panic. What if the discarded one had the question?', weights: { resource_chaos: 20, emotional_volatility: 10 } },
      { key: 'd', label: 'Resistance. More coverage means more safety. It must.', weights: { resource_chaos: 25 } },
      { key: 'e', label: 'I have done it before — and quietly re-downloaded everything within a month.', weights: { resource_chaos: 20, execution_friction: 10 } },
    ],
  },
]

// ── L5 — Mind Under Fire (8) ────────────────────────────────────

const L5: Card[] = [
  {
    id: 'L5-01',
    level: 5,
    question: 'A mock score arrives 18 marks below your average. The next hour of your life looks like —',
    options: [
      { key: 'a', label: 'The error log opens. The post-mortem begins. Feelings wait.', weights: { prelims_nerve: 15, cognitive_clarity: 10 } },
      { key: 'b', label: 'A short, dark spiral — then back to the desk by evening.', weights: { recovery_speed: 10, emotional_volatility: 5 } },
      { key: 'c', label: 'I re-check the answer key hoping the test was wrong.', weights: { emotional_volatility: 10 } },
      { key: 'd', label: 'The day is gone. Maybe the next one too.', weights: { emotional_volatility: 20, recovery_speed: -15 } },
      { key: 'e', label: 'I stop taking mocks for a while after scores like that.', weights: { prelims_nerve: -20, emotional_volatility: 15 } },
    ],
  },
  {
    id: 'L5-02',
    level: 5,
    question: 'A statement-based question: three statements, "how many are correct?" Your first instinct —',
    options: [
      { key: 'a', label: 'Work each statement independently. Verdict per statement, then count.', weights: { cognitive_clarity: 15, prelims_nerve: 10 } },
      { key: 'b', label: 'Find the one statement I am sure about and reverse-engineer the options.', weights: { cognitive_clarity: 15, prelims_nerve: 5 } },
      { key: 'c', label: 'A small dread. These questions are designed against people like me.', weights: { prelims_nerve: -10, emotional_volatility: 10 } },
      { key: 'd', label: 'Read all three, feel 60% on each, and circle the middle option.', weights: { cognitive_clarity: -10 } },
      { key: 'e', label: 'Skip first, return later — they cost too much time up front.', weights: { prelims_nerve: 0, execution_friction: 5 } },
    ],
  },
  {
    id: 'L5-03',
    level: 5,
    question: 'Your relationship with the −0.66 — describe it honestly.',
    options: [
      { key: 'a', label: 'A tax I price in. I attempt 85–90 and accept the bleed.', weights: { prelims_nerve: 20 } },
      { key: 'b', label: 'A calculated enemy. I attempt 75-ish, gambles chosen carefully.', weights: { prelims_nerve: 10, cognitive_clarity: 5 } },
      { key: 'c', label: 'A fear. I attempt only what I am certain of — usually under 65.', weights: { prelims_nerve: -20 } },
      { key: 'd', label: 'A revolving door. Some mocks I attempt 90, some 60. No policy.', weights: { prelims_nerve: -10, emotional_volatility: 15 } },
      { key: 'e', label: 'I honestly do not track my attempt count.', weights: { cognitive_clarity: -10 } },
    ],
  },
  {
    id: 'L5-04',
    level: 5,
    question: 'Last thirty minutes of a Prelims paper. Twenty questions unread. What happens in your body?',
    options: [
      { key: 'a', label: 'Nothing new. The plan has a last-30 protocol and I execute it.', weights: { prelims_nerve: 20, cognitive_clarity: 10 } },
      { key: 'b', label: 'Pace rises, accuracy holds. Controlled burn.', weights: { prelims_nerve: 10 } },
      { key: 'c', label: 'I start gambling on questions I would have skipped at minute 40.', weights: { prelims_nerve: -10, emotional_volatility: 10 } },
      { key: 'd', label: 'My reading comprehension visibly degrades. I re-read lines.', weights: { prelims_nerve: -15 } },
      { key: 'e', label: 'I have never simulated this. My mocks are untimed or loosely timed.', weights: { prelims_nerve: -15, marathon_consistency: -5 } },
    ],
  },
  {
    id: 'L5-05',
    level: 5,
    question: 'How do you review a completed mock?',
    options: [
      { key: 'a', label: 'Every wrong AND every lucky right, tagged by cause, same day.', weights: { cognitive_clarity: 20, marathon_consistency: 10 } },
      { key: 'b', label: 'All wrong answers, when I get time in the week.', weights: { cognitive_clarity: 10 } },
      { key: 'c', label: 'I read the score, feel something, and move on.', weights: { cognitive_clarity: -15 } },
      { key: 'd', label: 'I screenshot explanations into a folder I have never reopened.', weights: { cognitive_clarity: -10, resource_chaos: 15 } },
      { key: 'e', label: 'Depends entirely on the score. Good score, no review.', weights: { emotional_volatility: 10, cognitive_clarity: -5 } },
    ],
  },
  {
    id: 'L5-06',
    level: 5,
    question: 'Prelims hall. Question 71. You have eliminated two options. Forty seconds on the clock. You —',
    microcopy: 'Coin-flip odds, +2 against −0.66. The hall is silent. Your move.',
    options: [
      { key: 'a', label: 'Take the calm 50-50 shot and move. The math favors me.', weights: { prelims_nerve: 20 } },
      { key: 'b', label: 'Mark it for review — and never make it back.', weights: { prelims_nerve: -10, execution_friction: 10 } },
      { key: 'c', label: 'Freeze on it. Lose the forty seconds and the next ninety.', weights: { prelims_nerve: -20 } },
      { key: 'd', label: 'Leave it. I only answer when I am one hundred percent sure.', weights: { prelims_nerve: -15 } },
      { key: 'e', label: 'Depends entirely on how the first seventy questions went.', weights: { emotional_volatility: 15 } },
    ],
  },
  {
    id: 'L5-07',
    level: 5,
    question: 'Mid-study, your mind goes blank on something you revised last week. Your inner voice says —',
    options: [
      { key: 'a', label: '"Normal. Forgetting is the price of a big syllabus. Re-encode and move."', weights: { cognitive_clarity: 15, recovery_speed: 10 } },
      { key: 'b', label: '"Again? Fine. Flag it for the next revision cycle."', weights: { cognitive_clarity: 10 } },
      { key: 'c', label: '"My memory is the problem. Everyone else retains better."', weights: { emotional_volatility: 15 }, sets: { self_belief: 'low' } },
      { key: 'd', label: '"Maybe my source is wrong. Maybe I need a better book for this."', weights: { resource_chaos: 15 } },
      { key: 'e', label: 'Panic, disproportionate and physical.', weights: { emotional_volatility: 20 } },
    ],
  },
  {
    id: 'L5-08',
    level: 5,
    question: 'The night before an exam — any exam — how do you sleep?',
    options: [
      { key: 'a', label: 'Normally. The work is done or it is not; sleep changes neither.', weights: { prelims_nerve: 15, emotional_volatility: -10 } },
      { key: 'b', label: 'A little thin, but functional.', weights: { prelims_nerve: 5 } },
      { key: 'c', label: 'Badly. My brain runs the paper all night.', weights: { prelims_nerve: -10, emotional_volatility: 10 } },
      { key: 'd', label: 'I revise till 2 AM. Sleep is a luxury I cannot justify.', weights: { prelims_nerve: -10, execution_friction: 10 } },
      { key: 'e', label: 'I have lost exams to that night before. It is my known weak point.', weights: { prelims_nerve: -20, emotional_volatility: 15 } },
    ],
  },
]

// ── L6 — The Emotional Core (7) ─────────────────────────────────

const L6: Card[] = [
  {
    id: 'L6-01',
    level: 6,
    question: 'Result day. The PDF loads. Your roll number is not there. What is the very first thing you do?',
    options: [
      { key: 'a', label: 'Search it twice. Close the laptop. Sit very still for a while.', weights: { emotional_volatility: 10 } },
      { key: 'b', label: 'Tell my family before they ask. Get it over with.', weights: { recovery_speed: 10, anchor_strength: 10 } },
      { key: 'c', label: 'Tell no one. Carry it alone for days.', weights: { emotional_volatility: 10 }, sets: { flags: ['ISOLATION'] } },
      { key: 'd', label: 'Open the attempt-math: age, attempts left, the shrinking runway.', weights: { emotional_volatility: 15, identity_fusion: 10 } },
      { key: 'e', label: 'I have lived this. I know my exact sequence, and it is not pretty.', weights: { emotional_volatility: 15, identity_fusion: 10 } },
    ],
  },
  {
    id: 'L6-02',
    level: 6,
    question: 'At a family gathering, a relative asks "so what do you do?" What happens inside?',
    options: [
      { key: 'a', label: 'Nothing. "I am preparing for UPSC." Full stop, steady voice.', weights: { identity_fusion: -5, anchor_strength: 10 } },
      { key: 'b', label: 'A flicker of shame I am practiced at hiding.', weights: { external_pressure: 10, identity_fusion: 10 } },
      { key: 'c', label: 'I pre-empt it — I avoid the gatherings altogether now.', weights: { external_pressure: 15, identity_fusion: 15 }, sets: { flags: ['ISOLATION'] } },
      { key: 'd', label: 'My parents answer for me, and their tone tells its own story.', weights: { external_pressure: 20 } },
      { key: 'e', label: 'I say it with pride. The preparation IS a worthy occupation.', weights: { identity_fusion: 15, purpose_intensity: 5 } },
    ],
  },
  {
    id: 'L6-03',
    level: 6,
    question: 'Your college batchmates are posting promotions, weddings, foreign offices. Scrolling past them, you feel —',
    options: [
      { key: 'a', label: 'Genuinely little. Different races, different tracks.', weights: { emotional_volatility: -10, anchor_strength: 10 } },
      { key: 'b', label: 'A pinch, acknowledged and set down.', weights: { emotional_volatility: 5 } },
      { key: 'c', label: 'A ledger opening: years spent vs. their years compounding.', weights: { identity_fusion: 15, emotional_volatility: 10 } },
      { key: 'd', label: 'I muted or unfollowed most of them long ago.', weights: { emotional_volatility: 10 }, sets: { flags: ['ISOLATION'] } },
      { key: 'e', label: 'Fuel. Their ordinary success sharpens my extraordinary bet.', weights: { purpose_intensity: 10, identity_fusion: 10 } },
    ],
  },
  {
    id: 'L6-04',
    level: 6,
    question: "A batchmate's name appears in this year's final list. The honest first feeling?",
    options: [
      { key: 'a', label: 'Fuel. If they crossed, the wall is crossable.', weights: { recovery_speed: 15, purpose_intensity: 10 } },
      { key: 'b', label: 'Happy for them — and suddenly hollow about myself.', weights: { identity_fusion: 15 } },
      { key: 'c', label: 'I congratulated them and then avoided everyone for a week.', weights: { emotional_volatility: 15 }, sets: { flags: ['ISOLATION'] } },
      { key: 'd', label: 'I did the math: their attempt number versus mine.', weights: { emotional_volatility: 10, identity_fusion: 10 }, sets: { flags: ['ATTEMPT_MATH'] } },
      { key: 'e', label: 'Felt nothing. That frightened me more than envy would have.', weights: { emotional_volatility: 5 }, sets: { flags: ['VETERAN_GHOST'] } },
    ],
  },
  {
    id: 'L6-05',
    level: 6,
    question: 'Take the exam out of the picture for ten seconds. Who are you without it?',
    options: [
      { key: 'a', label: 'A whole person with interests, people, and a fallback I respect.', weights: { identity_fusion: -15, anchor_strength: 15 } },
      { key: 'b', label: 'Mostly intact, though the exam has eaten some rooms of my life.', weights: { identity_fusion: 5 } },
      { key: 'c', label: 'Honestly — I do not remember. It has been the whole sky for years.', weights: { identity_fusion: 25 } },
      { key: 'd', label: 'The question itself makes me defensive.', weights: { identity_fusion: 30, emotional_volatility: 10 } },
      { key: 'e', label: 'Someone my family has invested in. The exam is our project, not mine.', weights: { external_pressure: 20, identity_fusion: 10 } },
    ],
  },
  {
    id: 'L6-06',
    level: 6,
    question: 'How many days in a typical month does your emotional weather decide your output?',
    options: [
      { key: 'a', label: 'Almost none. The work runs on rails, not weather.', weights: { emotional_volatility: -15, marathon_consistency: 10 } },
      { key: 'b', label: 'Two or three. Contained storms.', weights: { emotional_volatility: 5 } },
      { key: 'c', label: 'A week\'s worth, scattered.', weights: { emotional_volatility: 15 } },
      { key: 'd', label: 'Half the month. My mood IS my timetable.', weights: { emotional_volatility: 25, marathon_consistency: -10 } },
      { key: 'e', label: 'I no longer notice. Flatness has replaced the swings.', weights: { emotional_volatility: 10 }, sets: { flags: ['VETERAN_GHOST'] } },
    ],
  },
  {
    id: 'L6-07',
    level: 6,
    question: 'When the preparation hurts most, what do you actually do — not what you intend to do?',
    options: [
      { key: 'a', label: 'Talk to my one person. Then return.', weights: { anchor_strength: 15, recovery_speed: 10 } },
      { key: 'b', label: 'Walk, gym, run — burn it off physically.', weights: { recovery_speed: 15 } },
      { key: 'c', label: 'Scroll for hours. Anesthesia, not rest.', weights: { distraction_risk: 15, recovery_speed: -10 } },
      { key: 'd', label: 'Watch motivation videos about aspirants who almost quit.', weights: { execution_friction: 10, distraction_risk: 10 } },
      { key: 'e', label: 'Nothing. I sit with it alone until it passes or does not.', weights: { emotional_volatility: 10 }, sets: { flags: ['ISOLATION'] } },
    ],
  },
]

// ── L7 — The Anchor (5) ─────────────────────────────────────────

const L7: Card[] = [
  {
    id: 'L7-01',
    level: 7,
    question: 'Is there one person who knows the true state of your preparation — scores, fears, all of it?',
    options: [
      { key: 'a', label: 'Yes. One person has the full map.', weights: { anchor_strength: 20 } },
      { key: 'b', label: 'A few people have pieces. No one has the whole.', weights: { anchor_strength: 5 } },
      { key: 'c', label: 'My family thinks it is going better than it is.', weights: { anchor_strength: -5, external_pressure: 10 } },
      { key: 'd', label: 'No one. I report only headlines, and only good ones.', weights: { anchor_strength: -15 }, sets: { flags: ['ISOLATION'] } },
      { key: 'e', label: 'A fellow aspirant — we hold each other\'s truth.', weights: { anchor_strength: 15 } },
    ],
  },
  {
    id: 'L7-02',
    level: 7,
    question: 'On your worst day this year, what put you back together?',
    options: [
      { key: 'a', label: 'A person. A call, a meal, a presence.', weights: { anchor_strength: 15, recovery_speed: 10 } },
      { key: 'b', label: 'The why itself. I reread my own reasons and stood back up.', weights: { purpose_intensity: 15, anchor_strength: 10 } },
      { key: 'c', label: 'Time. I waited it out, numb, and resumed.', weights: { recovery_speed: -5 } },
      { key: 'd', label: 'Nothing did. I carried it into the next week.', weights: { recovery_speed: -15, emotional_volatility: 10 } },
      { key: 'e', label: 'Work itself. I studied through it; the rhythm rescued me.', weights: { marathon_consistency: 15, recovery_speed: 10 } },
    ],
  },
  {
    id: 'L7-03',
    level: 7,
    question: 'Your belief in your own selection — measure it on a good day and on a bad day.',
    options: [
      { key: 'a', label: 'High on both. The gap between my days is small.', weights: { emotional_volatility: -10 }, sets: { self_belief: 'high' } },
      { key: 'b', label: 'Steady-ish. Good days confident, bad days quietly determined.', sets: { self_belief: 'medium' } },
      { key: 'c', label: 'A pendulum. Topper on Monday, fraud by Thursday.', weights: { emotional_volatility: 15 }, sets: { self_belief: 'volatile' } },
      { key: 'd', label: 'Low on both, if I stop performing confidence.', weights: { purpose_intensity: -5 }, sets: { self_belief: 'low' } },
      { key: 'e', label: 'I avoid measuring it. The measurement itself feels dangerous.', weights: { emotional_volatility: 10, identity_fusion: 10 }, sets: { self_belief: 'volatile' } },
    ],
  },
  {
    id: 'L7-04',
    level: 7,
    question: 'Your body — the instrument carrying the mind through a 5-hour Mains day. How is it?',
    options: [
      { key: 'a', label: 'Maintained. Sleep, movement, food are part of the system.', weights: { marathon_consistency: 10, mains_stamina: 15 } },
      { key: 'b', label: 'Functional, slightly neglected.', weights: { mains_stamina: 5 } },
      { key: 'c', label: 'Deteriorating — weight, posture, sleep drifting the wrong way.', weights: { mains_stamina: -10, marathon_consistency: -5 } },
      { key: 'd', label: 'Sacrificed knowingly. I will fix it "after selection".', weights: { mains_stamina: -15, identity_fusion: 10 } },
      { key: 'e', label: 'It has already sent warnings I am ignoring.', weights: { mains_stamina: -20, emotional_volatility: 10 } },
    ],
  },
  {
    id: 'L7-05',
    level: 7,
    question: 'The money question, plainly: how long can you sustain this preparation?',
    options: [
      { key: 'a', label: 'Years, if needed. Money is not the clock.', weights: { external_pressure: -10 } },
      { key: 'b', label: 'Two more attempts, comfortably.', weights: { external_pressure: 0 } },
      { key: 'c', label: 'This attempt, maybe one more. The runway is visible.', weights: { external_pressure: 15 } },
      { key: 'd', label: 'My family is stretching for this. Every month is borrowed.', weights: { external_pressure: 25 } },
      { key: 'e', label: 'My job funds it — which is also why my hours are besieged.', weights: { external_pressure: 10, execution_friction: 10 } },
    ],
  },
]

// ── L8 — The Mirror (6) ─────────────────────────────────────────

const L8: Card[] = [
  {
    id: 'L8-01',
    level: 8,
    question: 'Give your own preparation the verdict you would give a stranger\'s.',
    options: [
      { key: 'a', label: 'Strong inputs, weak system. The hours deserve better machinery.', weights: { cognitive_clarity: 15 } },
      { key: 'b', label: 'Knowledge adequate, exam temperament untrained.', weights: { cognitive_clarity: 10, prelims_nerve: -10 } },
      { key: 'c', label: 'Honest verdict: scattered. Effort everywhere, accumulation nowhere.', weights: { resource_chaos: 15, cognitive_clarity: 10 } },
      { key: 'd', label: 'Inconsistent. Brilliant fortnights, vanished months.', weights: { marathon_consistency: -15, cognitive_clarity: 10 } },
      { key: 'e', label: 'I cannot judge it. I am too far inside it.', weights: { cognitive_clarity: -10, identity_fusion: 10 } },
    ],
  },
  {
    id: 'L8-02',
    level: 8,
    question: 'What do you consume more of — strategy, or syllabus?',
    options: [
      { key: 'a', label: 'Syllabus. I stopped watching topper talks long ago.', weights: { execution_friction: -10 } },
      { key: 'b', label: 'Mostly syllabus, with an occasional strategy detour.', weights: { execution_friction: 0 } },
      { key: 'c', label: 'I know every topper\'s booklist, timetable, and pen brand. My own mocks are pending.', weights: { execution_friction: 25, cognitive_clarity: 10 } },
      { key: 'd', label: 'Strategy is my comfort food. Watching plans feels like progress.', weights: { execution_friction: 20, distraction_risk: 10 } },
      { key: 'e', label: 'I alternate: strategy binges, then guilt-driven syllabus sprints.', weights: { execution_friction: 15, emotional_volatility: 10 } },
    ],
  },
  {
    id: 'L8-03',
    level: 8,
    question: 'A younger sibling announces they are starting UPSC preparation. The first sentence out of your mouth is —',
    options: [
      { key: 'a', label: '"Good. One source per subject, mock from month two, protect your sleep."', weights: { cognitive_clarity: 15 } },
      { key: 'b', label: '"Think hard about whether you can take the uncertainty."', weights: { emotional_volatility: 10 } },
      { key: 'c', label: '"Don\'t." — said as a joke, meant about 60%.', weights: { identity_fusion: 10, emotional_volatility: 10 } },
      { key: 'd', label: '"Learn from what I did wrong" — and I can name the mistakes precisely.', weights: { cognitive_clarity: 20 } },
      { key: 'e', label: 'I would feel a strange territorial sting before any advice.', weights: { identity_fusion: 15 } },
    ],
  },
  {
    id: 'L8-04',
    level: 8,
    question: 'Which truth about yourself do you most consistently avoid?',
    options: [
      { key: 'a', label: 'My mock scores have a pattern I refuse to read.', weights: { prelims_nerve: -10, cognitive_clarity: 5 } },
      { key: 'b', label: 'I confuse buying and collecting resources with preparing.', weights: { resource_chaos: 20 } },
      { key: 'c', label: 'I avoid Mains answer-writing because the blank page judges me.', weights: { mains_stamina: -20 } },
      { key: 'd', label: 'My revision system collapsed months ago and I am running on first-reads.', weights: { marathon_consistency: -15 } },
      { key: 'e', label: 'I am more tired than I let anyone see, including myself.', weights: { emotional_volatility: 15, identity_fusion: 10 } },
    ],
  },
  {
    id: 'L8-05',
    level: 8,
    question: 'Does this journey have a walk-away line?',
    microcopy: 'A point at which you would stop, chosen by you in advance — not by the calendar.',
    options: [
      { key: 'a', label: 'Yes. I drew it calmly, and it does not frighten me.', weights: { anchor_strength: 15, identity_fusion: -10 } },
      { key: 'b', label: 'I refuse to think about that question.', weights: { identity_fusion: 20 } },
      { key: 'c', label: 'My family has invested too much for that line to exist.', weights: { external_pressure: 20 }, sets: { purpose_type: 'RESTORATION' } },
      { key: 'd', label: 'There is no line because the exam IS the plan. There is no after.', weights: { identity_fusion: 30 } },
      { key: 'e', label: 'I crossed my line already. I am past it, still here.', weights: { identity_fusion: 15, emotional_volatility: 10 }, sets: { flags: ['VETERAN_GHOST'] } },
    ],
  },
  {
    id: 'L8-06',
    level: 8,
    question: 'Last card. If a system told you exactly what to do every morning — would you actually obey it?',
    options: [
      { key: 'a', label: 'Yes. Decision fatigue is half my war. Command me.', weights: { execution_friction: 5, cognitive_clarity: 5 } },
      { key: 'b', label: 'Mostly — I would negotiate with it on bad days.', weights: { emotional_volatility: 5 } },
      { key: 'c', label: 'I would obey for two weeks, then quietly customize it back into chaos.', weights: { resource_chaos: 15, execution_friction: 10 } },
      { key: 'd', label: 'I distrust systems. Mine have betrayed me before.', weights: { emotional_volatility: 10, recovery_speed: -5 } },
      { key: 'e', label: 'I do not know. But what I am doing alone is not working.', weights: { purpose_intensity: 5, cognitive_clarity: 5 } },
    ],
  },
]

export const CARDS: Card[] = [...L1, ...L2, ...L3, ...L4, ...L5, ...L6, ...L7, ...L8]

export function isLastCardOfLevel(index: number, cards: Card[]): boolean {
  const next = cards[index + 1]
  return !next || next.level !== cards[index].level
}

export function getCardById(id: string): Card | undefined {
  return CARDS.find(c => c.id === id)
}
