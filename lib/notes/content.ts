import type { SmartNote, Upsc12Content } from './types'
import { emptyUpsc12Content } from './types'

/** Normalize DB row → upsc12 content (handles legacy flat columns). */
export function resolveNoteContent(note: Partial<SmartNote> & { content?: Partial<Upsc12Content> | null }): Upsc12Content {
  const raw: Partial<Upsc12Content> = note.content ?? {}
  const base = emptyUpsc12Content()

  if (note.anatomy === 'upsc12' || Object.keys(raw).length > 0) {
    return {
      ...base,
      ...raw,
      dimensions: raw.dimensions ?? base.dimensions,
      argumentsFor: raw.argumentsFor ?? base.argumentsFor,
      argumentsAgainst: raw.argumentsAgainst ?? base.argumentsAgainst,
      mainsExamples: raw.mainsExamples ?? base.mainsExamples,
      prelimsFacts: raw.prelimsFacts ?? base.prelimsFacts,
      revisionBox: raw.revisionBox ?? base.revisionBox,
      answerFramework: {
        ...base.answerFramework,
        ...(raw.answerFramework ?? {}),
        body: raw.answerFramework?.body ?? base.answerFramework.body,
      },
    }
  }

  // KAUTILYA-DECISION: legacy SSC rows map into upsc12 for read-only fallback.
  return {
    ...base,
    issueStory: note.story ?? '',
    coreConcept: note.core_concept ?? '',
    dimensions: note.mindmap_json?.branches?.map(b => b.label) ?? [],
    prelimsFacts: note.key_facts ?? [],
    revisionBox: (note.common_traps ?? []).map(t => ({ prompt: t, answer: '' })),
    pyqLink: (note.pyq_refs ?? [])
      .map(p => `${p.year} ${p.exam}: ${p.question ?? ''} → ${p.answer ?? ''}`)
      .join('\n'),
  }
}

export function isUpsc12Note(note: Partial<SmartNote>): boolean {
  return note.anatomy === 'upsc12' || !!(note.content && Object.keys(note.content).length > 0)
}
