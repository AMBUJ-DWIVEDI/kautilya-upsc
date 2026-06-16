// ============================================================
// KAUTILYA UPSC — Paper Catalog
// Mirrors the mock_tests seed in kautilya_001_core.sql.
// Papers 1–50: full Prelims GS (APP.exam.prelimsGS shape).
// Drills 51–100: subject drills (Polity/History/Geography/Economy).
// ============================================================

import { APP } from '@/lib/config'
import type { Subject } from './types'

export type TestType = 'full_length' | 'sectional'
export type UnlockPlan = 'free' | 'warrior'
export type PaperKind = 'gs' | 'csat'

export interface MockCatalogItem {
  gate_number: number
  title: string
  test_type: TestType
  section: Subject | null
  duration_mins: number
  total_questions: number
  max_score: number
  is_baseline: boolean
  unlock_plan: UnlockPlan
  topic_tags: string[]
  /** Which exam paper this gate emulates — decides marking scheme & subject set. */
  paper_kind: PaperKind
}

const DRILL_SUBJECTS: Subject[] = ['Polity', 'History', 'Geography', 'Economy']

const FULL_LENGTH_TITLES = [
  'KAUTILYA IAS Baseline Mock 01',
  'Statement Discipline',
  'Elimination Drill',
  'Polity Density',
  'Recall Checkpoint',
  'Pressure Simulation',
  'Repair Area Hunt',
  'Cutoff Push',
  'Final Repair',
  'Command Diagnosis',
]

const GS = APP.exam.prelimsGS
const CSAT = APP.exam.csat

// ── Hand-curated overrides for the baseline gates ──────────────
// Gate 1 = the REAL UPSC 2026 Prelims GS-I (official paper + provisional key),
//          loaded from paper-01.json. This is the primary baseline diagnosis mock:
//          attempters review their real performance, new aspirants gauge their level.
// Gate 2 = the original synthetic KAUTILYA baseline mock (paper-02.json), kept as a
//          secondary, optional practice paper — also free so anyone can take it.
const GATE_OVERRIDES: Partial<Record<number, Partial<MockCatalogItem>>> = {
  1: {
    title: 'Paper 1 — UPSC 2026 Prelims GS-I (Official)',
    is_baseline: true,
    unlock_plan: 'free',
    topic_tags: ['full-length', 'official-2026', 'baseline', 'gs-paper-1'],
  },
  2: {
    title: 'Paper 2 — KAUTILYA Baseline Mock (Practice)',
    is_baseline: false,
    unlock_plan: 'free',
    topic_tags: ['full-length', 'practice', 'optional'],
  },
  // Gate 3 = the REAL UPSC 2026 CSAT Paper II (official paper + VisionIAS key),
  //          loaded from paper-03.json. Free baseline so aspirants can review
  //          their real CSAT attempt or gauge their aptitude level.
  3: {
    title: 'Paper 3 — UPSC 2026 CSAT Paper II (Official)',
    is_baseline: true,
    unlock_plan: 'free',
    paper_kind: 'csat',
    total_questions: CSAT.questions,
    max_score: CSAT.marks,
    duration_mins: CSAT.minutes,
    topic_tags: ['csat', 'official-2026', 'baseline', 'paper-2'],
  },
}

export const MOCK_CATALOG: MockCatalogItem[] = Array.from({ length: 100 }, (_, i) => {
  const gate = i + 1
  const isFull = gate <= 50
  const subject = isFull ? null : DRILL_SUBJECTS[(gate - 51) % DRILL_SUBJECTS.length]
  const fullTitle = FULL_LENGTH_TITLES[(gate - 1) % FULL_LENGTH_TITLES.length]
  const drillRound = Math.floor((gate - 51) / DRILL_SUBJECTS.length) + 1

  const base: MockCatalogItem = {
    gate_number: gate,
    title: isFull
      ? `Paper ${gate} — ${fullTitle}`
      : `Drill ${gate} — ${subject} ${drillRound}`,
    test_type: isFull ? 'full_length' : 'sectional',
    section: subject,
    duration_mins: isFull ? GS.minutes : 30,
    total_questions: isFull ? GS.questions : 25,
    max_score: isFull ? GS.marks : Math.round(25 * GS.perQuestion),
    is_baseline: gate === 1,
    unlock_plan: gate === 1 ? 'free' : 'warrior',
    topic_tags: isFull ? ['full-length', fullTitle.toLowerCase()] : ['drill', subject!.toLowerCase()],
    paper_kind: 'gs',
  }

  return { ...base, ...GATE_OVERRIDES[gate] }
})

export function getMockCatalogItem(gate: number): MockCatalogItem | undefined {
  return MOCK_CATALOG.find(item => item.gate_number === gate)
}

export function bankFileForGate(gate: number): string {
  return `paper-${gate.toString().padStart(2, '0')}.json`
}

/** Which exam paper a gate emulates (defaults to GS for any unknown gate). */
export function paperKindForGate(gate: number): PaperKind {
  return getMockCatalogItem(gate)?.paper_kind ?? 'gs'
}

/** The marking shape ({ questions, marks, perQuestion, negative, minutes }) for a gate. */
export function examShapeForGate(gate: number) {
  return paperKindForGate(gate) === 'csat' ? APP.exam.csat : APP.exam.prelimsGS
}
