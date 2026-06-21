import type { PrelimsQuestion, Subject } from '@/lib/mock/types'

let seq = 0

export function makeQuestion(overrides: Partial<PrelimsQuestion> & Pick<PrelimsQuestion, 'subject'>): PrelimsQuestion {
  seq += 1
  const { subject, num: numOverride, ...rest } = overrides
  const num = numOverride ?? seq
  return {
    question_id: `TEST-${String(num).padStart(3, '0')}`,
    num,
    subject,
    topic: 'Test topic',
    subtopic: `Test — Q${num}`,
    format: 'single',
    difficulty: 'Medium',
    expected_time_sec: 75,
    text: 'Test question text?',
    options: { A: 'Option A', B: 'Option B', C: 'Option C', D: 'Option D' },
    answer: 'A',
    explanation: 'Test explanation.',
    elimination_path: '',
    diagnoses: ['test'],
    ...rest,
  }
}

export function makeGsPaper(count = 2): PrelimsQuestion[] {
  const subjects: Subject[] = ['Polity', 'History']
  return Array.from({ length: count }, (_, i) =>
    makeQuestion({
      num: i + 1,
      subject: subjects[i % subjects.length],
      answer: i % 2 === 0 ? 'A' : 'B',
    }),
  )
}

export function makeCsatPaper(): PrelimsQuestion[] {
  const subjects: Subject[] = ['ReadingComprehension', 'Maths', 'Reasoning', 'Misc']
  return subjects.map((subject, i) =>
    makeQuestion({
      num: i + 1,
      subject,
      answer: 'C',
      elimination_path: i % 2 === 0 ? 'Eliminate wrong options first.' : '',
    }),
  )
}
