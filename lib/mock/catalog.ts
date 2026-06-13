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

export const MOCK_CATALOG: MockCatalogItem[] = Array.from({ length: 100 }, (_, i) => {
  const gate = i + 1
  const isFull = gate <= 50
  const subject = isFull ? null : DRILL_SUBJECTS[(gate - 51) % DRILL_SUBJECTS.length]
  const fullTitle = FULL_LENGTH_TITLES[(gate - 1) % FULL_LENGTH_TITLES.length]
  const drillRound = Math.floor((gate - 51) / DRILL_SUBJECTS.length) + 1

  return {
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
  }
})

export function getMockCatalogItem(gate: number): MockCatalogItem | undefined {
  return MOCK_CATALOG.find(item => item.gate_number === gate)
}

export function bankFileForGate(gate: number): string {
  return `paper-${gate.toString().padStart(2, '0')}.json`
}
