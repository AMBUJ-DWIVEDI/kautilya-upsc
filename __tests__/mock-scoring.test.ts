import { describe, expect, it } from 'vitest'
import { APP } from '@/lib/config'
import { examShapeForGate, paperKindForGate } from '@/lib/mock/catalog'
import { calculateResult, getVerdict } from '@/lib/mock/scoring'
import type { Answers } from '@/lib/mock/types'
import { makeCsatPaper, makeGsPaper, makeQuestion } from './helpers/mock-question'

describe('mock scoring', () => {
  describe('examShapeForGate', () => {
    it('returns GS marking shape for gate 1 (+2 / −0.66)', () => {
      expect(paperKindForGate(1)).toBe('gs')
      expect(examShapeForGate(1)).toEqual(APP.exam.prelimsGS)
      expect(examShapeForGate(1).perQuestion).toBe(2)
      expect(examShapeForGate(1).negative).toBe(0.66)
    })

    it('returns CSAT marking shape for gate 3 (+2.5 / −0.83)', () => {
      expect(paperKindForGate(3)).toBe('csat')
      expect(examShapeForGate(3)).toEqual(APP.exam.csat)
      expect(examShapeForGate(3).perQuestion).toBe(2.5)
      expect(examShapeForGate(3).negative).toBe(0.83)
    })
  })

  describe('calculateResult — GS marking', () => {
    it('applies +2 for correct and −0.66 for wrong on GS gates', () => {
      const questions = makeGsPaper(2)
      const answers: Answers = {
        [questions[0].question_id]: { choice: 'A', marked: false, sure: true, time_sec: 60, visits: 1 },
        [questions[1].question_id]: { choice: 'A', marked: false, sure: false, time_sec: 60, visits: 1 },
      }
      const result = calculateResult(1, questions, answers, 'user-1', 30)

      expect(result.score).toBe(1.3)
      expect(result.max_score).toBe(4)
      expect(result.questions[0].marks).toBe(2)
      expect(result.questions[1].marks).toBe(-0.66)
    })
  })

  describe('calculateResult — CSAT content + skill params', () => {
    it('builds 4 CSAT content sections and 3 skill params', () => {
      const questions = makeCsatPaper()
      const answers: Answers = Object.fromEntries(
        questions.map(q => [q.question_id, { choice: q.answer, marked: false, sure: true, time_sec: 50, visits: 1 }]),
      )
      const result = calculateResult(3, questions, answers, 'user-1', 60)

      expect(result.sections).toHaveLength(4)
      expect(result.sections.map(s => s.subject).sort()).toEqual(
        ['Maths', 'Misc', 'ReadingComprehension', 'Reasoning'].sort(),
      )
      expect(result.skill_params).toHaveLength(3)
      expect(result.skill_params.map(p => p.key).sort()).toEqual(['Guessing', 'Smartness', 'Speed'])
      expect(result.max_score).toBe(questions.length * APP.exam.csat.perQuestion)
    })

    it('applies +2.5 / −0.83 CSAT marking', () => {
      const questions = [makeQuestion({ subject: 'Maths', answer: 'B' })]
      const answers: Answers = {
        [questions[0].question_id]: { choice: 'A', marked: false, sure: null, time_sec: 40, visits: 1 },
      }
      const result = calculateResult(3, questions, answers, 'user-1', 10)

      expect(result.questions[0].marks).toBe(-0.83)
      expect(result.score).toBe(-0.8)
    })
  })

  describe('getVerdict — CSAT qualifying', () => {
    const max = 200

    it('flags danger zone well below 33%', () => {
      const v = getVerdict(45, max, 'csat')
      expect(v.verdict).toBe('CSAT Danger Zone')
    })

    it('flags below qualifying line under 33%', () => {
      const v = getVerdict(65, max, 'csat')
      expect(v.verdict).toBe('Below Qualifying Line')
    })

    it('clears qualifying with little margin between 33% and ~46%', () => {
      const v = getVerdict(70, max, 'csat')
      expect(v.verdict).toBe('Qualifying Cleared')
    })

    it('marks safe qualifier above ~46%', () => {
      const v = getVerdict(100, max, 'csat')
      expect(v.verdict).toBe('Safe Qualifier')
    })
  })
})
