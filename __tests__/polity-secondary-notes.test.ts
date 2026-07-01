import { describe, expect, it } from 'vitest'
import { getLocalPublishedSmartNotes } from '../lib/notes/local'

describe('Polity secondary-core smart notes', () => {
  const notes = getLocalPublishedSmartNotes('Polity')
  const secondary = notes.filter(note => {
    const number = Number(note.id.replace('local-pol-', ''))
    return number >= 113 && number <= 144
  })

  it('publishes the complete 49-note Polity library', () => {
    expect(notes).toHaveLength(49)
    expect(secondary.map(note => note.id).sort()).toEqual(
      Array.from({ length: 32 }, (_, index) =>
        `local-pol-${String(index + 113).padStart(3, '0')}`
      )
    )
  })

  it('keeps IDs and slugs unique', () => {
    expect(new Set(notes.map(note => note.id)).size).toBe(notes.length)
    expect(new Set(notes.map(note => note.slug)).size).toBe(notes.length)
  })

  it('gives every secondary note the full depth contract', () => {
    for (const note of secondary) {
      expect(note.source_type).toBe('uploaded-polity-static-pyq-secondary')
      expect(note.status).toBe('published')
      expect(note.anatomy).toBe('upsc12')
      expect(note.content.dimensions.length).toBeGreaterThanOrEqual(6)
      expect(note.content.answerFramework.body.length).toBeGreaterThanOrEqual(4)
      expect(note.content.mainsExamples.length).toBeGreaterThanOrEqual(3)
      expect(note.content.prelimsFacts.length).toBeGreaterThanOrEqual(5)
      expect(note.content.revisionBox.length).toBeGreaterThanOrEqual(4)
      expect(note.common_traps?.length).toBeGreaterThanOrEqual(3)
      expect(note.pyq_refs.length).toBeGreaterThanOrEqual(2)
      expect(note.content.dataReport).toContain('official')
    }
  })
})
