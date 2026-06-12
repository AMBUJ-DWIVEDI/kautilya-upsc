// ============================================================
// KAUTILYA UPSC — Smart Notes Types
// ============================================================

export type NoteSection =
  | 'Polity' | 'History' | 'Geography' | 'Economy'
  | 'Environment' | 'SciTech' | 'CurrentAffairs'

export type NoteAnatomy = 'upsc12' | 'ssc5'
export type NoteStatus  = 'draft' | 'review' | 'published' | 'archived'
export type NoteConfidence = 'Low' | 'Medium' | 'High'
export type NoteLinkType   = 'weak_topic' | 'concept' | 'trap' | 'formula'

export const SECTION_LABELS: Record<NoteSection, string> = {
  Polity:         'Polity & Governance',
  History:        'History & Culture',
  Geography:      'Geography',
  Economy:        'Economy',
  Environment:    'Environment & Ecology',
  SciTech:        'Science & Technology',
  CurrentAffairs: 'Current Affairs',
}

export const ALL_SECTIONS: NoteSection[] = [
  'Polity', 'History', 'Geography', 'Economy',
  'Environment', 'SciTech', 'CurrentAffairs',
]

export const POLITY_CATEGORIES = [
  'Fundamental Rights',
  'DPSP',
  'Parliament',
  'Judiciary',
  'Federalism',
  'Constitutional Amendments',
] as const

// ── Mind map (legacy admin preview; dimensions replace in upsc12) ──

export interface MindMapBranch {
  label: string
  children?: string[]
}

export interface MindMapData {
  center: string
  branches: MindMapBranch[]
}

// ── UPSC 12-block anatomy ─────────────────────────────────────

export type Upsc12BlockKey = keyof Upsc12Content

export interface Upsc12BlockMeta {
  key: Upsc12BlockKey
  label: string
  anchor: string
  pinned?: boolean
}

export interface AnswerFramework {
  intro: string
  body: string[]
  conclusion: string
}

export interface RevisionCard {
  prompt: string
  answer: string
}

export interface Upsc12Content {
  issueStory: string
  coreConcept: string
  dimensions: string[]
  constitutionalLink: string
  dataReport: string
  caseStudy: string
  argumentsFor: string[]
  argumentsAgainst: string[]
  pyqLink: string
  answerFramework: AnswerFramework
  mainsExamples: string[]
  prelimsFacts: string[]
  revisionBox: RevisionCard[]
}

export const UPSC12_BLOCK_ORDER: Upsc12BlockMeta[] = [
  { key: 'issueStory',          label: 'Issue Story',          anchor: 'issue-story' },
  { key: 'coreConcept',         label: 'Core Concept',         anchor: 'core-concept' },
  { key: 'dimensions',          label: 'Dimensions',           anchor: 'dimensions' },
  { key: 'constitutionalLink',  label: 'Constitutional Link',  anchor: 'constitutional-link' },
  { key: 'dataReport',          label: 'Data & Report',        anchor: 'data-report' },
  { key: 'caseStudy',           label: 'Case Study',           anchor: 'case-study' },
  { key: 'argumentsFor',        label: 'Arguments For',        anchor: 'arguments-for' },
  { key: 'argumentsAgainst',    label: 'Arguments Against',    anchor: 'arguments-against' },
  { key: 'pyqLink',             label: 'PYQ Link',             anchor: 'pyq-link' },
  { key: 'answerFramework',     label: 'Answer Framework',     anchor: 'answer-framework', pinned: true },
  { key: 'mainsExamples',       label: 'Mains Examples',       anchor: 'mains-examples' },
  { key: 'prelimsFacts',        label: 'Prelims Facts',        anchor: 'prelims-facts', pinned: true },
  { key: 'revisionBox',         label: 'Revision Box',         anchor: 'revision-box' },
]

// ── PYQ Reference (admin + pyqLink block) ─────────────────────

export interface PYQRef {
  year:         number
  exam:         string
  question?:    string
  answer?:      string
  pattern_note?: string
}

// ── Full Smart Note (DB row) ──────────────────────────────────

export interface SmartNote {
  id:            string
  section:       NoteSection
  category:      string
  topic:         string
  subtopic?:     string
  slug:          string

  anatomy:       NoteAnatomy
  content:       Upsc12Content

  // Legacy SSC flat columns — kept for migration reads only
  story?:        string
  core_concept?: string
  mnemonic?:     string
  mindmap_json?: { center: string; branches: { label: string; children?: string[] }[] }
  key_facts?:    string[]
  common_traps?: string[]

  pyq_refs:      PYQRef[]
  pyq_count:     number
  last_asked?:   number
  high_yield:    boolean
  read_time_mins: number
  difficulty?:   'Easy' | 'Medium' | 'Hard'
  status:        NoteStatus
  source_type:   string
  version:       number
  created_at:    string
  updated_at:    string
}

export interface NoteRevision {
  id:             string
  user_id:        string
  note_id:        string
  revised_at:     string
  revision_count: number
  confidence:     NoteConfidence
  next_due_at?:   string
}

export interface QuestionNoteLink {
  id:          string
  question_id: string
  note_id:     string
  link_type:   NoteLinkType
  created_at:  string
}

export type GeneratedUpsc12Content = Upsc12Content

// Legacy alias for admin UI still importing GeneratedNoteContent
export type GeneratedNoteContent = GeneratedUpsc12Content

export interface ParsedPYQ {
  question:           string
  options:            Record<string, string>
  answer:             string
  year:               number
  exam:               string
  suggested_topic:    string
  suggested_section:  NoteSection
  suggested_category: string
}

export interface ParsedPYQGroup {
  topic:     string
  section:   NoteSection
  category:  string
  questions: ParsedPYQ[]
}

export const CONFIDENCE_INTERVAL: Record<NoteConfidence, number> = {
  Low:    1,
  Medium: 3,
  High:   7,
}

export function nextDueDate(confidence: NoteConfidence): string {
  const d = new Date()
  d.setDate(d.getDate() + CONFIDENCE_INTERVAL[confidence])
  return d.toISOString()
}

export function emptyUpsc12Content(): Upsc12Content {
  return {
    issueStory: '',
    coreConcept: '',
    dimensions: [],
    constitutionalLink: '',
    dataReport: '',
    caseStudy: '',
    argumentsFor: [],
    argumentsAgainst: [],
    pyqLink: '',
    answerFramework: { intro: '', body: [], conclusion: '' },
    mainsExamples: [],
    prelimsFacts: [],
    revisionBox: [],
  }
}
