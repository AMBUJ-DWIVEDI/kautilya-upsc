import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { APP } from '@/lib/config'
import type { Option, PrelimsQuestion } from '@/lib/mock/types'

interface PaperFile {
  paper: number
  title: string
  questions: PrelimsQuestion[]
}

const BANK_DIR = join(__dirname, '../data/question-bank')
const OPTIONS: Option[] = ['A', 'B', 'C', 'D']

function loadPaper(filename: string): PaperFile {
  return JSON.parse(readFileSync(join(BANK_DIR, filename), 'utf8')) as PaperFile
}

function parseOfficialGsKey(): Record<number, string> {
  const source = readFileSync(join(BANK_DIR, '_source-2026-gs1.cjs'), 'utf8')
  const match = source.match(/const OFFICIAL = '([^']+)'/)
  if (!match) throw new Error('OFFICIAL key not found in _source-2026-gs1.cjs')
  const keyMap: Record<number, string> = {}
  for (const part of match[1].split(',')) {
    const [n, a] = part.split('-')
    keyMap[Number(n)] = a
  }
  return keyMap
}

function assertPaperShape(paper: PaperFile) {
  for (const q of paper.questions) {
    expect(OPTIONS).toContain(q.answer)
    for (const opt of OPTIONS) {
      expect(q.options[opt]).toBeTruthy()
      expect(typeof q.options[opt]).toBe('string')
    }
    expect(Object.keys(q.options)).toHaveLength(4)
  }
}

describe('question-bank integrity', () => {
  const officialKey = parseOfficialGsKey()

  it('paper-01 (2026 GS-I official) has 100 questions with valid shape', () => {
    const paper = loadPaper('paper-01.json')
    expect(paper.questions).toHaveLength(APP.exam.prelimsGS.questions)
    assertPaperShape(paper)
  })

  it('paper-01 answers match the official key (Q89 dropped)', () => {
    const paper = loadPaper('paper-01.json')
    const byNum = Object.fromEntries(paper.questions.map(q => [q.num, q]))

    for (let n = 1; n <= 100; n++) {
      const key = officialKey[n]
      expect(key, `missing official key for Q${n}`).toBeTruthy()
      const q = byNum[n]
      expect(q, `missing question Q${n}`).toBeTruthy()

      if (key === 'X') {
        expect(n).toBe(89)
        expect(q!.diagnoses).toContain('dropped-by-upsc')
        continue
      }
      expect(q!.answer, `Q${n} answer mismatch`).toBe(key)
    }
  })

  it('paper-02 (KAUTILYA practice GS) has 100 questions with valid shape', () => {
    const paper = loadPaper('paper-02.json')
    expect(paper.questions).toHaveLength(APP.exam.prelimsGS.questions)
    assertPaperShape(paper)
  })

  it('paper-03 (2026 CSAT official) has 80 questions with valid shape', () => {
    const paper = loadPaper('paper-03.json')
    expect(paper.questions).toHaveLength(APP.exam.csat.questions)
    assertPaperShape(paper)

    const csatSubjects = new Set(paper.questions.map(q => q.subject))
    expect(csatSubjects.has('ReadingComprehension')).toBe(true)
    expect(csatSubjects.has('Maths')).toBe(true)
    expect(csatSubjects.has('Reasoning')).toBe(true)
  })
})
