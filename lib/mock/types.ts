// ============================================================
// KAUTILYA UPSC — Prelims Test Types
// Shared across scoring engine, TestEngine, and result pages.
// All exam numbers come from APP.exam — never hardcoded here.
// ============================================================

export type Subject =
  // GS Paper I subjects
  | 'Polity' | 'History' | 'Geography' | 'Economy'
  | 'Environment' | 'SciTech' | 'CurrentAffairs'
  // CSAT Paper II content parameters
  | 'ReadingComprehension' | 'Maths' | 'Reasoning' | 'Misc'

export type Difficulty = 'Easy' | 'Medium' | 'Hard'
export type Option = 'A' | 'B' | 'C' | 'D'

export type QuestionFormat =
  | 'single'             // classic single-correct
  | 'statements_count'   // "how many of the above are correct"
  | 'match_pairs'        // match List-I with List-II
  | 'assertion_reason'   // A/R format

export type ScoreLeak =
  | 'Concept Gap'
  | 'Memory Gap'
  | 'Statement Trap'
  | 'Elimination Miss'
  | 'Time Trap'
  | 'Panic / Guessing'
  | 'Revision Gap'

/** Full question — stored server-side in data/question-bank/paper-NN.json */
export interface PrelimsQuestion {
  question_id: string               // "P01-POL-001"
  num: number                       // 1–100
  subject: Subject
  topic: string
  subtopic: string
  format: QuestionFormat
  statements?: string[]             // for statements_count / match_pairs rows
  difficulty: Difficulty
  expected_time_sec: number
  text: string
  options: Record<Option, string>
  answer: Option                    // ⚠️  NEVER sent to client
  explanation: string
  /** The technique narration — how a smart guesser gets this right without full knowledge. */
  elimination_path: string
  diagnoses: string[]               // weak-topic + technique tags
}

/** What the TestEngine receives — answer/explanation/elimination stripped for security */
export type ClientQuestion = Omit<PrelimsQuestion, 'answer' | 'explanation' | 'elimination_path'>

/** Per-question state during a live test (client-side) */
export interface AnswerState {
  choice: Option | null
  marked: boolean
  /** Self-declared confidence at answer time: true = sure shot, false = calculated gamble. */
  sure: boolean | null
  time_sec: number
  visits: number
}

export type Answers = Record<string, AnswerState>

// ── Post-submission result types (computed server-side) ──────────

export interface QuestionResult {
  q: PrelimsQuestion
  choice: Option | null
  sure: boolean | null
  correct: boolean
  unattempted: boolean
  marks: number          // +perQuestion / −negative / 0 (from APP.exam)
  time_sec: number
  time_trap: boolean
  leak: ScoreLeak | null
  /** Solvable via elimination_path but left blank or wrong. */
  elimination_miss: boolean
}

export interface SubjectResult {
  subject: Subject
  label: string
  score: number
  max: number
  attempted: number
  correct: number
  wrong: number
  unattempted: number
  accuracy_pct: number
  negative_marks: number
  time_sec: number
  verdict: string
}

export interface WeakTopic {
  topic: string
  subject: Subject
  wrong: number
  total: number
  accuracy_pct: number
}

/** UPSC-native analytics: attempt structure vs the 47-sure / 35-gamble framework. */
export interface GuessingDiscipline {
  score: number               // 0–100
  sure_count: number
  gamble_count: number
  undeclared_count: number
  blank_count: number
  sure_accuracy_pct: number
  gamble_accuracy_pct: number
  ideal_sure: number          // framework numbers scaled to paper size
  ideal_gamble: number
  verdict: string
}

export interface EliminationAnalysis {
  score: number               // 0–100 — written to demonstrated_dimensions
  eliminable_total: number    // questions with a usable elimination_path
  misses: number              // eliminable but blank or wrong
  missed_question_nums: number[]
}

/** Pace analytics — how many attempts were solved without over-spending time. */
export interface SpeedAnalysis {
  score: number               // 0–100
  on_pace: number             // attempts within ~1.25× expected time
  slow: number                // attempts that ran long
  attempt_rate_pct: number
  verdict: string
}

/** A cross-cutting CSAT skill parameter (Speed / Guessing / Smartness). */
export interface SkillParam {
  key: 'Speed' | 'Guessing' | 'Smartness'
  label: string
  score: number               // 0–100
  verdict: string
}

export interface MockResult {
  gate: number
  user_id: string
  score: number
  max_score: number
  accuracy_pct: number
  attempt_rate_pct: number
  time_minutes: number
  negative_loss: number
  easy_missed: number
  hard_solved: number
  verdict: string
  verdict_desc: string
  sections: SubjectResult[]
  questions: QuestionResult[]
  leak_breakdown: Record<ScoreLeak, number>
  weak_topics: WeakTopic[]
  guessing: GuessingDiscipline
  elimination: EliminationAnalysis
  speed: SpeedAnalysis
  /** The 3 cross-cutting skill parameters (Speed / Guessing / Smartness) — featured for CSAT. */
  skill_params: SkillParam[]
  seven_day_plan: string[]
  at: string
}

// ── Subject metadata (shared constants) ─────────────────────────

export const SUBJECT_META: Record<Subject, { label: string; color: string }> = {
  // GS Paper I
  Polity:         { label: 'Polity & Governance',     color: 'text-indigo' },
  History:        { label: 'History & Culture',       color: 'text-copper' },
  Geography:      { label: 'Geography',               color: 'text-sage' },
  Economy:        { label: 'Economy',                 color: 'text-copper' },
  Environment:    { label: 'Environment & Ecology',   color: 'text-sage' },
  SciTech:        { label: 'Science & Technology',    color: 'text-indigo' },
  CurrentAffairs: { label: 'Current Affairs',         color: 'text-clay' },
  // CSAT Paper II — content parameters
  ReadingComprehension: { label: 'Reading Comprehension', color: 'text-indigo' },
  Maths:                { label: 'Maths',                 color: 'text-copper' },
  Reasoning:            { label: 'Reasoning',             color: 'text-sage' },
  Misc:                 { label: 'Misc',                  color: 'text-clay' },
}

export const ALL_LEAKS: ScoreLeak[] = [
  'Concept Gap', 'Memory Gap', 'Statement Trap', 'Elimination Miss',
  'Time Trap', 'Panic / Guessing', 'Revision Gap',
]

export const FORMAT_LABELS: Record<QuestionFormat, string> = {
  single: 'Single correct',
  statements_count: 'Statement count',
  match_pairs: 'Match the pairs',
  assertion_reason: 'Assertion–Reason',
}
