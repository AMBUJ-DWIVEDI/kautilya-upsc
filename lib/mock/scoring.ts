// ============================================================
// KAUTILYA UPSC — Prelims scoring (server-side only)
// +perQuestion / −negative from APP.exam.prelimsGS. Adds the two
// UPSC-native analytics: Guessing Discipline & Elimination Misses.
// ============================================================

import { APP } from '@/lib/config'
import type {
  PrelimsQuestion, Answers, AnswerState, MockResult, QuestionResult,
  SubjectResult, WeakTopic, ScoreLeak, Subject,
  GuessingDiscipline, EliminationAnalysis, SpeedAnalysis, SkillParam,
} from './types'
import { ALL_LEAKS, SUBJECT_META } from './types'
import { examShapeForGate, paperKindForGate } from './catalog'

const GS_SUBJECT_ORDER: Subject[] = [
  'Polity', 'History', 'Geography', 'Economy', 'Environment', 'SciTech', 'CurrentAffairs',
]
const CSAT_SUBJECT_ORDER: Subject[] = [
  'ReadingComprehension', 'Maths', 'Reasoning', 'Misc',
]

/** The 47-sure / 35-gamble attempt framework, expressed per 100 questions. */
const FRAMEWORK = { surePer100: 47, gamblePer100: 35 }

function detectLeak(q: PrelimsQuestion, s: AnswerState): ScoreLeak {
  if (s.time_sec > q.expected_time_sec * 2.5) return 'Time Trap'
  if (s.time_sec < 10 && s.visits <= 1) return 'Panic / Guessing'
  if (q.format === 'statements_count' || q.format === 'match_pairs') return 'Statement Trap'

  switch (q.subject) {
    case 'CurrentAffairs':
      return q.difficulty === 'Easy' ? 'Revision Gap' : 'Memory Gap'
    case 'History':
      return q.difficulty === 'Easy' ? 'Revision Gap' : 'Memory Gap'
    default:
      return q.difficulty === 'Easy' ? 'Revision Gap' : 'Concept Gap'
  }
}

export function getVerdict(
  score: number,
  maxScore: number,
  kind: 'gs' | 'csat' = 'gs',
): { verdict: string; desc: string } {
  const pct = maxScore > 0 ? score / maxScore : 0

  if (kind === 'csat') {
    // CSAT is qualifying: clearing 33% (≈66/200) is the only real bar.
    const qual = APP.exam.csat.qualifyingPct / 100
    if (pct < qual * 0.7) return {
      verdict: 'CSAT Danger Zone',
      desc: 'Well below the 33% qualifying line. CSAT can sink an otherwise strong GS score — this needs dedicated practice, not neglect.',
    }
    if (pct < qual) return {
      verdict: 'Below Qualifying Line',
      desc: 'You are short of the 33% bar. A handful of secure comprehension and reasoning marks would flip this — target the leaks, not the whole paper.',
    }
    if (pct < qual * 1.4) return {
      verdict: 'Qualifying Cleared',
      desc: 'You clear the bar, but with little margin. Lock in the comprehension and decision-making marks so a hard quant set never threatens it.',
    }
    return {
      verdict: 'Safe Qualifier',
      desc: 'Comfortably past the CSAT bar. Maintain this with light upkeep and reinvest the hours into GS Paper I.',
    }
  }

  // Cutoff bands calibrated to the GS paper: recent cutoffs hover near 44–50% of 200.
  if (pct < 0.25) return {
    verdict: 'Foundation Rebuild Required',
    desc: 'Coverage, accuracy, and attempt structure all need work. The system starts at the base.',
  }
  if (pct < 0.38) return {
    verdict: 'Scattered Preparation',
    desc: 'Knowledge exists in patches. Integration, not more sources, is the prescription.',
  }
  if (pct < 0.47) return {
    verdict: 'Approaching the Wall',
    desc: 'You are within reach of the cutoff band. Elimination technique and attempt discipline decide it now.',
  }
  if (pct < 0.55) return {
    verdict: 'Cutoff Crosser',
    desc: 'This attempt structure crosses most years. Protect it under pressure; stop leaking sure marks.',
  }
  return {
    verdict: 'Comfortable Margin',
    desc: 'Clear of the cutoff band. Maintain calibration; shift surplus hours to Mains.',
  }
}

function subjectVerdict(score: number, max: number): string {
  const pct = max > 0 ? score / max : 0
  if (pct >= 0.55) return 'Stable'
  if (pct >= 0.38) return 'Repair priority'
  return 'Immediate repair area'
}

function computeGuessingDiscipline(qResults: QuestionResult[], negative: number): GuessingDiscipline {
  const total = qResults.length
  const scale = total / 100
  const idealSure = Math.round(FRAMEWORK.surePer100 * scale)
  const idealGamble = Math.round(FRAMEWORK.gamblePer100 * scale)

  const attempted = qResults.filter(r => !r.unattempted)
  const sure = attempted.filter(r => r.sure === true)
  const gamble = attempted.filter(r => r.sure === false)
  const undeclared = attempted.filter(r => r.sure === null)
  const blanks = total - attempted.length

  const sureCorrect = sure.filter(r => r.correct).length
  const gambleCorrect = gamble.filter(r => r.correct).length
  const sureAcc = sure.length > 0 ? (sureCorrect / sure.length) * 100 : 0
  const gambleAcc = gamble.length > 0 ? (gambleCorrect / gamble.length) * 100 : 0

  // Component 1 (50%): sure-shot accuracy. A "sure" answer below 90% accuracy
  // means miscalibration — the deadliest leak under −0.66.
  const calibration = sure.length > 0 ? Math.min(1, sureAcc / 90) : 0.5

  // Component 2 (30%): attempt structure distance from the framework.
  const sureDist = idealSure > 0 ? Math.min(1, Math.abs(sure.length - idealSure) / idealSure) : 0
  const gambleDist = idealGamble > 0 ? Math.min(1, Math.abs(gamble.length - idealGamble) / idealGamble) : 0
  const structure = 1 - (sureDist + gambleDist) / 2

  // Component 3 (20%): declaration discipline — undeclared attempts mean the
  // aspirant is not tracking their own certainty.
  const declared = attempted.length > 0 ? 1 - undeclared.length / attempted.length : 0

  const score = Math.round(100 * (0.5 * calibration + 0.3 * structure + 0.2 * declared))

  let verdict: string
  if (score >= 75) verdict = 'Disciplined attempt structure. The framework is working for you.'
  else if (score >= 50) verdict = 'Workable, but your sure/gamble split drifts from the framework. Tighten it.'
  else if (sure.length < idealSure * 0.6) verdict = 'You are leaving sure marks in the paper — the −0.66 fear is taxing you more than the negative marking ever would.'
  else verdict = 'Your "sure" answers are not sure. Calibration drills before more content.'

  return {
    score: Math.max(0, Math.min(100, score)),
    sure_count: sure.length,
    gamble_count: gamble.length,
    undeclared_count: undeclared.length,
    blank_count: blanks,
    sure_accuracy_pct: round1(sureAcc),
    gamble_accuracy_pct: round1(gambleAcc),
    ideal_sure: idealSure,
    ideal_gamble: idealGamble,
    verdict,
  }
}

function computeSpeed(qResults: QuestionResult[]): SpeedAnalysis {
  const total = qResults.length
  const attempted = qResults.filter(r => !r.unattempted)
  // "On pace" = solved within ~1.25× the question's expected time.
  const onPace = attempted.filter(r => r.time_sec <= r.q.expected_time_sec * 1.25).length
  const slow = attempted.length - onPace
  const attemptRate = total > 0 ? attempted.length / total : 0
  // 70% pace within attempts, 30% how much of the paper was reached.
  const paceRatio = attempted.length > 0 ? onPace / attempted.length : 0
  const score = Math.round(100 * (0.7 * paceRatio + 0.3 * attemptRate))

  let verdict: string
  if (score >= 75) verdict = 'Strong pace — you reach the paper and rarely overspend time on a question.'
  else if (score >= 50) verdict = 'Workable pace, but a few questions are eating minutes. Set a per-question ceiling.'
  else if (attemptRate < 0.7) verdict = 'You are running out of time before finishing — practise sectioning the paper and skipping fast.'
  else verdict = 'You finish, but too many questions run long. Drill timed sets to build solving speed.'

  return {
    score: Math.max(0, Math.min(100, score)),
    on_pace: onPace,
    slow,
    attempt_rate_pct: round1(attemptRate * 100),
    verdict,
  }
}

function computeElimination(qResults: QuestionResult[]): EliminationAnalysis {
  const eliminable = qResults.filter(r => r.q.elimination_path.trim().length > 0)
  const misses = eliminable.filter(r => r.elimination_miss)
  const score = eliminable.length > 0
    ? Math.round(100 * (1 - misses.length / eliminable.length))
    : 50
  return {
    score: Math.max(0, Math.min(100, score)),
    eliminable_total: eliminable.length,
    misses: misses.length,
    missed_question_nums: misses.map(r => r.q.num),
  }
}

function build7DayPlan(
  weak: WeakTopic[],
  sections: SubjectResult[],
  guessing: GuessingDiscipline,
  elimination: EliminationAnalysis,
): string[] {
  const sortedSec = [...sections].sort((a, b) => (a.score / a.max) - (b.score / b.max))
  const t = (i: number) => weak[i]?.topic
  const weakestSubject = sortedSec[0]?.label ?? 'your weakest subject'

  return [
    `Day 1 - Root cause: repair-read "${t(0) ?? weakestSubject}" through its Smart Note, then re-attempt every question you lost there.`,
    `Day 2 - Elimination drill: rework the ${elimination.misses || 'missed'} eliminable questions from this paper using only the option structure. No recall allowed.`,
    `Day 3 - ${weakestSubject} density block: 45 minutes of reading, then 25 timed questions.`,
    `Day 4 - Calibration: 25 questions, declare sure/gamble before checking. Target 90%+ on the sure pile (you ran ${guessing.sure_accuracy_pct}%).`,
    `Day 5 - Statement-format day: only "how many of the above" and match-the-pairs questions, untimed, technique first.`,
    `Day 6 - ${sortedSec[1]?.label ?? 'second repair area'} consolidation: one recall cycle and 20 questions.`,
    'Day 7 - Half-paper simulation: 50 questions, 60 minutes, full attempt framework, then complete review.',
  ]
}

export function calculateResult(
  gate: number,
  questions: PrelimsQuestion[],
  answers: Answers,
  userId: string,
  timeMins: number,
): MockResult {
  const kind = paperKindForGate(gate)
  const { perQuestion, negative } = examShapeForGate(gate)
  const SUBJECT_ORDER = kind === 'csat' ? CSAT_SUBJECT_ORDER : GS_SUBJECT_ORDER

  const qResults: QuestionResult[] = questions.map(q => {
    const s: AnswerState = answers[q.question_id] ?? { choice: null, marked: false, sure: null, time_sec: 0, visits: 0 }
    const unattempted = s.choice === null
    const correct = !unattempted && s.choice === q.answer
    const wrong = !unattempted && !correct
    const marks = unattempted ? 0 : correct ? perQuestion : -negative
    const time_trap = s.time_sec > q.expected_time_sec * 2.5
    const leak = wrong ? detectLeak(q, s) : null
    const elimination_miss = q.elimination_path.trim().length > 0 && (unattempted || wrong)
    return {
      q, choice: s.choice, sure: s.sure ?? null, correct, unattempted,
      marks, time_sec: s.time_sec, time_trap, leak, elimination_miss,
    }
  })

  const presentSubjects = SUBJECT_ORDER.filter(sub => questions.some(q => q.subject === sub))
  const sections: SubjectResult[] = presentSubjects.map(sub => {
    const sQs = qResults.filter(r => r.q.subject === sub)
    const attempted = sQs.filter(r => !r.unattempted).length
    const correct = sQs.filter(r => r.correct).length
    const wrong = sQs.filter(r => !r.correct && !r.unattempted).length
    const unattempted = sQs.filter(r => r.unattempted).length
    const score = round1(sQs.reduce((s, r) => s + r.marks, 0))
    const max = sQs.length * perQuestion
    return {
      subject: sub,
      label: SUBJECT_META[sub].label,
      score,
      max,
      attempted,
      correct,
      wrong,
      unattempted,
      accuracy_pct: round1(attempted > 0 ? (correct / attempted) * 100 : 0),
      negative_marks: round1(wrong * negative),
      time_sec: sQs.reduce((s, r) => s + r.time_sec, 0),
      verdict: subjectVerdict(score, max),
    }
  })

  const score = round1(qResults.reduce((s, r) => s + r.marks, 0))
  const totalAttempted = qResults.filter(r => !r.unattempted).length
  const totalCorrect = qResults.filter(r => r.correct).length
  const totalWrong = qResults.filter(r => !r.correct && !r.unattempted).length
  const maxScore = questions.length * perQuestion
  const accuracy_pct = round1(totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0)
  const attempt_rate_pct = round1(questions.length > 0 ? (totalAttempted / questions.length) * 100 : 0)
  const negative_loss = round1(totalWrong * negative)
  const easy_missed = qResults.filter(r => r.q.difficulty === 'Easy' && (r.unattempted || !r.correct)).length
  const hard_solved = qResults.filter(r => r.q.difficulty === 'Hard' && r.correct).length

  const leak_breakdown = Object.fromEntries(ALL_LEAKS.map(l => [l, 0])) as Record<ScoreLeak, number>
  qResults.forEach(r => { if (r.leak) leak_breakdown[r.leak]++ })
  // Elimination misses on wrong answers upgrade the leak tag.
  qResults.forEach(r => {
    if (r.elimination_miss && !r.unattempted && !r.correct) leak_breakdown['Elimination Miss']++
  })

  const topicMap: Record<string, { subject: Subject; wrong: number; total: number }> = {}
  questions.forEach((q, i) => {
    const key = `${q.subject}::${q.topic}`
    if (!topicMap[key]) topicMap[key] = { subject: q.subject, wrong: 0, total: 0 }
    topicMap[key].total++
    if (!qResults[i].correct) topicMap[key].wrong++
  })
  const weak_topics: WeakTopic[] = Object.entries(topicMap)
    .filter(([, v]) => v.wrong > 0)
    .map(([key, v]) => ({
      topic: key.split('::')[1],
      subject: v.subject,
      wrong: v.wrong,
      total: v.total,
      accuracy_pct: round1(((v.total - v.wrong) / v.total) * 100),
    }))
    .sort((a, b) => a.accuracy_pct - b.accuracy_pct)
    .slice(0, 10)

  const guessing = computeGuessingDiscipline(qResults, negative)
  const elimination = computeElimination(qResults)
  const speed = computeSpeed(qResults)
  const { verdict, desc: verdict_desc } = getVerdict(score, maxScore, kind)
  const seven_day_plan = build7DayPlan(weak_topics, sections, guessing, elimination)

  // The 3 cross-cutting CSAT skill parameters. Guessing = guessing discipline,
  // Smartness = elimination technique, Speed = pace. Featured in the CSAT report.
  const skill_params: SkillParam[] = [
    { key: 'Speed', label: 'Speed', score: speed.score, verdict: speed.verdict },
    { key: 'Guessing', label: 'Guessing', score: guessing.score, verdict: guessing.verdict },
    { key: 'Smartness', label: 'Smartness', score: elimination.score,
      verdict: elimination.misses === 0
        ? 'Sharp — you converted the eliminable questions instead of leaving them blank.'
        : `${elimination.misses} eliminable question${elimination.misses === 1 ? '' : 's'} slipped — solvable by option structure alone, but lost.` },
  ]

  return {
    gate,
    user_id: userId,
    score,
    max_score: maxScore,
    accuracy_pct,
    attempt_rate_pct,
    time_minutes: round1(timeMins),
    negative_loss,
    easy_missed,
    hard_solved,
    verdict,
    verdict_desc,
    sections,
    questions: qResults,
    leak_breakdown,
    weak_topics,
    guessing,
    elimination,
    speed,
    skill_params,
    seven_day_plan,
    at: new Date().toISOString(),
  }
}

function round1(n: number) {
  return Math.round(n * 10) / 10
}
