/**
 * KAUTILYA-DECISION: MVP ships one playable 100Q baseline paper (Paper 1).
 * Content is synthetic but UPSC-shaped: statement formats, elimination paths,
 * subject weightage. Full bank generation is a content-ops task post-MVP.
 */
import { writeFileSync } from 'fs'
import { join } from 'path'
import type { PrelimsQuestion, Subject, QuestionFormat } from '../lib/mock/types'

// This generator only ever produced GS Paper I content; scope its maps to the GS subjects.
type GSSubject = 'Polity' | 'History' | 'Geography' | 'Economy' | 'Environment' | 'SciTech' | 'CurrentAffairs'

const SUBJECTS: GSSubject[] = [
  'Polity', 'History', 'Geography', 'Economy',
  'Environment', 'SciTech', 'CurrentAffairs',
]

const SUBJECT_COUNTS: Record<GSSubject, number> = {
  Polity: 18,
  History: 16,
  Geography: 14,
  Economy: 14,
  Environment: 14,
  SciTech: 10,
  CurrentAffairs: 14,
}

const CODES: Record<GSSubject, string> = {
  Polity: 'POL', History: 'HIS', Geography: 'GEO', Economy: 'ECO',
  Environment: 'ENV', SciTech: 'SCI', CurrentAffairs: 'CA',
}

const TOPICS: Record<GSSubject, string[]> = {
  Polity: ['Fundamental Rights', 'DPSP', 'Parliament', 'Judiciary', 'Federalism', 'Constitutional Amendments'],
  History: ['Ancient India', 'Medieval India', 'Modern India', 'Art & Culture', 'Bhakti Movement', 'Freedom Struggle'],
  Geography: ['Physical Geography', 'Indian Geography', 'Climate', 'Resources', 'Agriculture', 'Disasters'],
  Economy: ['Monetary Policy', 'Fiscal Policy', 'Banking', 'Inflation', 'External Sector', 'Agriculture Economy'],
  Environment: ['Biodiversity', 'Climate Change', 'Pollution', 'Conservation', 'International Conventions', 'Ecosystems'],
  SciTech: ['Space', 'Biotechnology', 'IT & AI', 'Defence Tech', 'Health Science', 'Energy'],
  CurrentAffairs: ['Government Schemes', 'International Relations', 'Reports & Indices', 'Appointments', 'Summits', 'Legislation'],
}

const FORMATS: QuestionFormat[] = ['single', 'statements_count', 'assertion_reason', 'match_pairs']

function difficultyForNum(n: number): 'Easy' | 'Medium' | 'Hard' {
  if (n % 5 === 0) return 'Hard'
  if (n % 3 === 0) return 'Easy'
  return 'Medium'
}

function expectedTime(d: 'Easy' | 'Medium' | 'Hard'): number {
  if (d === 'Easy') return 50
  if (d === 'Medium') return 75
  return 100
}

function buildQuestion(num: number, subject: GSSubject, subIdx: number): PrelimsQuestion {
  const code = CODES[subject]
  const topic = TOPICS[subject][subIdx % TOPICS[subject].length]
  const format = FORMATS[num % FORMATS.length]
  const difficulty = difficultyForNum(num)
  const correct = (['A', 'B', 'C', 'D'] as const)[num % 4]

  const statements =
    format === 'single' ? undefined :
    format === 'assertion_reason' ? [
      `Assertion (A): ${topic} is directly linked to a constitutional or statutory provision tested in Prelims.`,
      `Reason (R): The linkage is established through a landmark judgment or committee report on ${topic}.`,
    ] :
    format === 'match_pairs' ? [
      `List-I (Concept) — 1. ${topic} A  2. ${topic} B  3. ${topic} C`,
      `List-II (Feature) — 1. Feature X  2. Feature Y  3. Feature Z`,
    ] :
    [
      `Statement 1: ${topic} has a direct constitutional or policy anchor relevant to UPSC Prelims.`,
      `Statement 2: A common trap in ${subject} questions is confusing ${topic} with an adjacent concept.`,
      `Statement 3: The 'only / all / never' extreme in distractors often signals a false statement in ${topic}.`,
    ]

  const stem =
    format === 'single'
      ? `With reference to ${topic} in ${subject}, which of the following is most accurate?`
      : format === 'statements_count'
      ? 'Consider the following statements: How many of the above statements are correct?'
      : format === 'assertion_reason'
      ? 'In the context of the following, consider Assertion (A) and Reason (R):'
      : 'Consider the following pairs (List-I and List-II): How many pairs are correctly matched?'

  const options =
    format === 'statements_count' || format === 'match_pairs'
      ? { A: 'Only one', B: 'Only two', C: 'All three', D: 'None' }
      : format === 'assertion_reason'
      ? {
          A: 'Both A and R are correct and R is the correct explanation of A',
          B: 'Both A and R are correct but R is NOT the correct explanation of A',
          C: 'A is correct but R is incorrect',
          D: 'A is incorrect but R is correct',
        }
      : {
          A: `${topic}: the provision applies universally without exception`,
          B: `${topic}: the correct position is narrower than the universal claim`,
          C: `${topic}: the concept is purely statutory, not constitutional`,
          D: `${topic}: the concept was abolished after a constitutional amendment`,
        }

  const wrong = (['A', 'B', 'C', 'D'] as const).filter(o => o !== correct)[0]

  return {
    question_id: `P01-${code}-${num.toString().padStart(3, '0')}`,
    num,
    subject,
    topic,
    subtopic: `${topic} — drill variant ${subIdx + 1}`,
    format,
    statements,
    difficulty,
    expected_time_sec: expectedTime(difficulty),
    text: stem,
    options,
    answer: correct,
    explanation: `Option ${correct} is correct for ${topic}. Option ${wrong} is the classic trap — it sounds authoritative but collapses on a single definitional mismatch UPSC examiners design into ${subject} items.`,
    elimination_path: num % 7 === 0
      ? 'NONE'
      : `Eliminate options with absolute words ('only', 'all', 'never') first — UPSC rarely rewards universals in ${subject}. Between the survivors, the pair-logic in statement 2 vs 3 usually leaves ${correct} as the only internally consistent choice.`,
    diagnoses: [topic.toLowerCase().replace(/\s+/g, '_'), subject.toLowerCase(), 'baseline_seed'],
  }
}

function generate(): PrelimsQuestion[] {
  const questions: PrelimsQuestion[] = []
  let num = 1
  for (const subject of SUBJECTS) {
    const count = SUBJECT_COUNTS[subject]
    for (let i = 0; i < count; i++) {
      questions.push(buildQuestion(num, subject, i))
      num++
    }
  }
  return questions
}

const questions = generate()
const out = join(process.cwd(), 'data', 'question-bank', 'paper-01.json')
writeFileSync(out, JSON.stringify({ paper: 1, title: 'Paper 1 — Baseline GS', questions }, null, 2))
console.log(`Wrote ${questions.length} questions → ${out}`)
