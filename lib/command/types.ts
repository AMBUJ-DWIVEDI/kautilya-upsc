// ============================================================
// KAUTILYA UPSC — Daily Command Types
// Five threads a day. Sealed when done. Recovery over streaks.
// ============================================================

export type ThreadType =
  | 'prelims_revision'
  | 'mains_answer'
  | 'current_issue'
  | 'recall_test'
  | 'optional_locked'

export interface CommandThread {
  id: string                 // 't1'..'t5', stable within the day
  type: ThreadType
  title: string
  target: string             // '45 min', '1 question', '10 cards'
  detail?: string            // e.g. the mains question + framework text
  href?: string              // where the work happens
  note_ids: string[]
  locked: boolean
}

export interface DailyCommandRow {
  id: string
  user_id: string
  command_date: string       // 'YYYY-MM-DD'
  threads: CommandThread[]
  completed: string[]        // thread ids
  sealed: boolean
  is_reentry: boolean
  insight: string | null
}

export interface MainsPrompt {
  question: string
  framework: string[]        // the skeleton of a 250-word answer
  rubric: string[]           // self-marking checks
}
