import { describe, expect, it } from 'vitest'
import { getLocalPublishedSmartNotes } from '../lib/notes/local'

describe('Geography secondary-core smart notes', () => {
  const notes = getLocalPublishedSmartNotes('Geography')
  const secondary = notes.filter(note => {
    const number = Number(note.id.replace('local-geo-', ''))
    return number >= 13 && number <= 36
  })

  it('publishes the complete 36-note Geography library', () => {
    expect(notes).toHaveLength(36)
    expect(secondary.map(note => note.id).sort()).toEqual(
      Array.from({ length: 24 }, (_, index) =>
        `local-geo-${String(index + 13).padStart(3, '0')}`
      )
    )
  })

  it('keeps IDs and slugs unique', () => {
    expect(new Set(notes.map(note => note.id)).size).toBe(notes.length)
    expect(new Set(notes.map(note => note.slug)).size).toBe(notes.length)
  })

  it('gives every secondary note the full depth contract', () => {
    for (const note of secondary) {
      expect(note.source_type).toBe('uploaded-geography-static-pyq-secondary')
      expect(note.status).toBe('published')
      expect(note.anatomy).toBe('upsc12')
      expect(note.content.dimensions.length).toBeGreaterThanOrEqual(6)
      expect(note.content.answerFramework.body.length).toBeGreaterThanOrEqual(4)
      expect(note.content.mainsExamples.length).toBeGreaterThanOrEqual(3)
      expect(note.content.prelimsFacts.length).toBeGreaterThanOrEqual(5)
      expect(note.content.revisionBox.length).toBeGreaterThanOrEqual(4)
      expect(note.common_traps?.length).toBeGreaterThanOrEqual(3)
      expect(note.pyq_refs.length).toBeGreaterThanOrEqual(2)
    }
  })
})
