import { existsSync, readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import type { SmartNote, NoteSection, NoteStatus } from './types'
import { ALL_SECTIONS } from './types'
import { resolveNoteContent } from './content'

const LOCAL_NOTES_DIR = join(process.cwd(), 'data', 'smart-notes')
const TEMPLATE_FILE = 'TEMPLATE-note.json'

type RawSmartNote = Partial<SmartNote> & {
  id?: string | null
  status?: NoteStatus | string
}

function localIdFromSlug(slug: string) {
  return `local-${slug}`
}

function validSection(section: unknown): NoteSection {
  return ALL_SECTIONS.includes(section as NoteSection) ? section as NoteSection : 'Polity'
}

function normalizeLocalNote(raw: RawSmartNote, fileName: string): SmartNote | null {
  const slug = typeof raw.slug === 'string' && raw.slug.length > 0
    ? raw.slug
    : fileName.replace(/\.json$/i, '')
  const section = validSection(raw.section)
  const topic = typeof raw.topic === 'string' && raw.topic.length > 0 ? raw.topic : slug
  const now = new Date(0).toISOString()
  const noteForContent = {
    ...raw,
    section,
    slug,
    topic,
    anatomy: raw.anatomy ?? 'upsc12',
  }

  return {
    id: typeof raw.id === 'string' && raw.id.length > 0 ? raw.id : localIdFromSlug(slug),
    section,
    category: raw.category ?? 'General Studies',
    topic,
    subtopic: raw.subtopic,
    slug,
    anatomy: raw.anatomy ?? 'upsc12',
    content: resolveNoteContent(noteForContent),
    story: raw.story,
    core_concept: raw.core_concept,
    mnemonic: raw.mnemonic,
    mindmap_json: raw.mindmap_json,
    key_facts: raw.key_facts ?? [],
    common_traps: raw.common_traps ?? [],
    pyq_refs: raw.pyq_refs ?? [],
    pyq_count: raw.pyq_count ?? raw.pyq_refs?.length ?? 0,
    last_asked: raw.last_asked,
    high_yield: raw.high_yield ?? false,
    read_time_mins: raw.read_time_mins ?? 8,
    difficulty: raw.difficulty ?? 'Medium',
    status: raw.status === 'draft' || raw.status === 'review' || raw.status === 'archived'
      ? raw.status
      : 'published',
    source_type: raw.source_type ?? 'local_seed',
    version: raw.version ?? 1,
    created_at: raw.created_at ?? now,
    updated_at: raw.updated_at ?? now,
  }
}

export function getLocalSmartNotes(): SmartNote[] {
  if (!existsSync(LOCAL_NOTES_DIR)) return []

  return readdirSync(LOCAL_NOTES_DIR)
    .filter(fileName => fileName.endsWith('.json') && fileName !== TEMPLATE_FILE)
    .flatMap(fileName => {
      try {
        const raw = JSON.parse(readFileSync(join(LOCAL_NOTES_DIR, fileName), 'utf8')) as RawSmartNote
        const note = normalizeLocalNote(raw, fileName)
        return note ? [note] : []
      } catch {
        return []
      }
    })
}

export function getLocalPublishedSmartNotes(section?: NoteSection): SmartNote[] {
  return getLocalSmartNotes()
    .filter(note => note.status === 'published')
    .filter(note => !section || note.section === section)
    .sort((a, b) => a.topic.localeCompare(b.topic))
}

export function getLocalSmartNote(section: NoteSection, slug: string): SmartNote | null {
  return getLocalPublishedSmartNotes(section).find(note => note.slug === slug) ?? null
}

export function getLocalSmartNoteById(id: string): SmartNote | null {
  return getLocalPublishedSmartNotes().find(note => note.id === id) ?? null
}

/** Ranked free-sample notes. The top `count` are free for every tier;
 *  the rest are Commander-only. Launch: 3 free samples. */
export function getLocalSampleSmartNotes(count = 3): SmartNote[] {
  return [...getLocalPublishedSmartNotes()].sort((a, b) => {
    const uploadedRank = Number(b.source_type === 'uploaded_sample_pack') - Number(a.source_type === 'uploaded_sample_pack')
    if (uploadedRank !== 0) return uploadedRank

    const flagshipRank = Number(b.id === 'local-pol-001') - Number(a.id === 'local-pol-001')
    if (flagshipRank !== 0) return flagshipRank

    const yieldRank = Number(b.high_yield) - Number(a.high_yield)
    if (yieldRank !== 0) return yieldRank

    const pyqRank = b.pyq_count - a.pyq_count
    if (pyqRank !== 0) return pyqRank

    return a.topic.localeCompare(b.topic)
  }).slice(0, count)
}

export function getLocalSampleSmartNote(): SmartNote | null {
  return getLocalSampleSmartNotes(1)[0] ?? null
}
