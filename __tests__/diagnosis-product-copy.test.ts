import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const CURRENT_OFFER_FILES = [
  'app/diagnosis/components/IntroScreen.tsx',
  'app/reveal/RevealClient.tsx',
  'app/(dashboard)/report/CommandReport.tsx',
  'app/(dashboard)/upgrade/page.tsx',
]

describe('current diagnosis product copy', () => {
  it('advertises 40 free cards and 60 premium cards', () => {
    const copy = CURRENT_OFFER_FILES
      .map(path => readFileSync(resolve(path), 'utf8'))
      .join('\n')

    expect(copy).toMatch(/forty|40-card/)
    expect(copy).toMatch(/sixty|60-card/)
    expect(copy).not.toMatch(/thirty|30-card/)
    expect(copy).not.toMatch(/fifty|50-card/)
  })
})
