import { describe, expect, it } from 'vitest'
import {
  isFreeDepth,
  isPaidDepth,
  normalizeReportDepth,
  reportDepthLabel,
} from '@/lib/report/depth'

describe('report depth compatibility', () => {
  it.each([
    ['free30', 'free30'],
    ['paid50', 'paid50'],
    ['free40', 'free40'],
    ['paid60', 'paid60'],
    ['unknown', 'free40'],
    [null, 'free40'],
  ])('normalizes %s to %s', (input, expected) => {
    expect(normalizeReportDepth(input)).toBe(expected)
  })

  it('groups historical and current depths by access tier', () => {
    expect(['free30', 'free40'].every(isFreeDepth)).toBe(true)
    expect(['paid50', 'paid60'].every(isPaidDepth)).toBe(true)
  })

  it('labels current card counts without losing historical labels', () => {
    expect(reportDepthLabel('free30')).toContain('30-card')
    expect(reportDepthLabel('paid50')).toContain('50-card')
    expect(reportDepthLabel('free40')).toContain('40-card')
    expect(reportDepthLabel('paid60')).toContain('60-card')
  })
})
