'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import type { SmartNote, NoteSection, ParsedPYQGroup, GeneratedNoteContent, NoteLinkType } from '@/lib/notes/types'
import { ALL_SECTIONS, SECTION_LABELS, POLITY_CATEGORIES } from '@/lib/notes/types'
import { resolveNoteContent } from '@/lib/notes/content'

type Step = 'setup' | 'pyq-upload' | 'reference' | 'generate' | 'preview'

interface MatchedQuestion {
  id: string
  num: number
  gate: number
  gate_title: string
  section: string
  topic: string
  subtopic?: string
  difficulty: string
  text: string
  answer: string
}

interface Props {
  existingNote: SmartNote | null
}

const SECTION_OPTIONS: { value: NoteSection; label: string }[] = ALL_SECTIONS.map(s => ({
  value: s,
  label: SECTION_LABELS[s],
}))

export default function NoteGeneratorUI({ existingNote }: Props) {
  const [step, setStep]               = useState<Step>(existingNote ? 'preview' : 'setup')
  const [section, setSection]         = useState<NoteSection>(existingNote?.section ?? 'Polity')
  const [category, setCategory]       = useState(existingNote?.category ?? 'Fundamental Rights')
  const [topic, setTopic]             = useState(existingNote?.topic ?? '')
  const [subtopic, setSubtopic]       = useState(existingNote?.subtopic ?? '')
  const [referenceText, setRef]       = useState('')
  const [pyqGroups, setPyqGroups]     = useState<ParsedPYQGroup[]>([])
  const [selectedGroup, setSelGroup]  = useState<ParsedPYQGroup | null>(null)
  const [generated, setGenerated]     = useState<GeneratedNoteContent | null>(
    existingNote ? resolveNoteContent(existingNote) : null
  )
  const [noteId, setNoteId]           = useState<string | null>(existingNote?.id ?? null)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState('')
  const [examHint, setExam]           = useState('UPSC Prelims')
  const [yearHint, setYear]           = useState(new Date().getFullYear())
  const pdfRef                        = useRef<HTMLInputElement>(null)

  // ── Link mock questions state ────────────────────────────────
  const [linkType, setLinkType]         = useState<NoteLinkType>('weak_topic')
  const [linkLoading, setLinkLoading]   = useState(false)
  const [linkError, setLinkError]       = useState('')
  const [linkSuccess, setLinkSuccess]   = useState('')
  const [searchResults, setSearchResults] = useState<MatchedQuestion[]>([])
  const [selectedQIds, setSelectedQIds]   = useState<Set<string>>(new Set())
  const [manualQIds, setManualQIds]       = useState('')   // comma-separated IDs typed by admin

  // ── Handlers ────────────────────────────────────────────────

  async function handlePDFUpload() {
    const file = pdfRef.current?.files?.[0]
    if (!file) { setError('Please select a PDF file'); return }
    setLoading(true); setError('')
    try {
      const form = new FormData()
      form.append('pdf',  file)
      form.append('exam', examHint)
      form.append('year', String(yearHint))
      const res  = await fetch('/api/admin/parse-pyqs', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Parse failed'); return }
      setPyqGroups(data.groups ?? [])
      setStep('reference')
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  function handleSkipPDF() {
    setPyqGroups([])
    setSelGroup(null)
    setStep('reference')
  }

  async function handleGenerate() {
    if (!topic.trim() || !section || !category) {
      setError('Topic, section, and category are required'); return
    }
    setLoading(true); setError(''); setSuccess('')
    try {
      const pyqs = selectedGroup?.questions.map(q => ({
        year:    q.year,
        exam:    q.exam,
        question: q.question,
        answer:   q.answer,
      })) ?? []

      const res  = await fetch('/api/admin/generate-note', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ topic, section, category, pyqs, referenceText }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Generation failed'); return }
      setGenerated(data.content)
      setStep('preview')
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(status: 'draft' | 'review' | 'published') {
    if (!generated) return
    setLoading(true); setError(''); setSuccess('')
    try {
      const pyq_refs = selectedGroup?.questions.map(q => ({
        year:     q.year,
        exam:     q.exam,
        question: q.question,
        answer:   q.answer,
      })) ?? existingNote?.pyq_refs ?? []

      const res  = await fetch('/api/admin/save-note', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          id: noteId,
          section, category, topic, subtopic,
          anatomy: 'upsc12',
          content: generated,
          pyq_refs,
          pyq_count:     pyq_refs.length,
          last_asked:    pyq_refs.at(-1)?.year ?? null,
          high_yield:    pyq_refs.length >= 3,
          read_time_mins: 12,
          status,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Save failed'); return }
      if (!noteId) setNoteId(data.id)
      const msg = status === 'published' ? '✓ Published — users can now see this note.'
                : status === 'review'    ? '✓ Saved for review.'
                :                          '✓ Saved as draft.'
      setSuccess(msg)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  // ── Link handlers ───────────────────────────────────────────

  async function handleSearchQuestions() {
    if (!topic || !section) return
    setLinkLoading(true); setLinkError('')
    try {
      const params = new URLSearchParams({ topic, section, gate: 'all' })
      const res  = await fetch(`/api/admin/search-questions?${params}`)
      const data = await res.json()
      if (!res.ok) { setLinkError(data.error || 'Search failed'); return }
      setSearchResults(data.matches ?? [])
    } catch (e) {
      setLinkError(String(e))
    } finally {
      setLinkLoading(false)
    }
  }

  function toggleQId(id: string) {
    setSelectedQIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleSaveLinks() {
    if (!noteId) { setLinkError('Save the note first before linking questions'); return }

    // Combine selected from search + manually typed IDs
    const manualIds = manualQIds.split(',').map(s => s.trim()).filter(Boolean)
    const allIds    = [...new Set([...selectedQIds, ...manualIds])]
    if (allIds.length === 0) { setLinkError('No question IDs selected or entered'); return }

    setLinkLoading(true); setLinkError(''); setLinkSuccess('')
    try {
      const res  = await fetch('/api/admin/link-questions', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ note_id: noteId, question_ids: allIds, link_type: linkType }),
      })
      const data = await res.json()
      if (!res.ok) { setLinkError(data.error || 'Link failed'); return }
      setLinkSuccess(`✓ Linked ${data.count ?? allIds.length} question(s) to this note.`)
      setSelectedQIds(new Set())
      setManualQIds('')
    } catch (e) {
      setLinkError(String(e))
    } finally {
      setLinkLoading(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────

  return (
    <div className="flex-1 px-4 sm:px-6 py-10 max-w-3xl mx-auto w-full">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/notes" className="text-chanakya-text-dim text-sm hover:text-chanakya-gold">
          ← Notes
        </Link>
        <span className="text-chanakya-muted">/</span>
        <h1 className="heading-cinzel text-chanakya-text text-lg font-bold">
          {existingNote ? 'Edit Note' : 'Generate Smart Note'}
        </h1>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
        {(['setup', 'pyq-upload', 'reference', 'generate', 'preview'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setStep(s)}
              className={`text-xs px-3 py-1.5 rounded-full font-mono transition-all ${
                step === s
                  ? 'bg-chanakya-gold text-chanakya-bg font-bold'
                  : 'text-chanakya-text-dim hover:text-chanakya-text'
              }`}
            >
              {i + 1}. {s === 'setup' ? 'Setup' : s === 'pyq-upload' ? 'PYQs' : s === 'reference' ? 'Reference' : s === 'generate' ? 'Generate' : 'Preview'}
            </button>
            {i < 4 && <span className="text-chanakya-muted text-xs">›</span>}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-chanakya-red/10 border border-chanakya-red/30 rounded-lg text-chanakya-red text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-chanakya-green/10 border border-chanakya-green/30 rounded-lg text-chanakya-green text-sm">
          {success}
        </div>
      )}

      {/* ── STEP 1: Setup ─────────────────────────────────── */}
      {step === 'setup' && (
        <div className="space-y-5">
          <h2 className="text-chanakya-gold font-mono text-sm uppercase tracking-wider">
            Step 1 — Note Setup
          </h2>

          <div>
            <label className="text-chanakya-text-dim text-xs uppercase tracking-wider block mb-1">
              Section *
            </label>
            <div className="flex flex-wrap gap-2">
              {SECTION_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSection(opt.value)}
                  className={`px-3 py-2 rounded-lg text-sm border transition-all ${
                    section === opt.value
                      ? 'border-chanakya-gold bg-chanakya-gold/10 text-chanakya-gold'
                      : 'border-chanakya-muted/30 text-chanakya-text-dim hover:border-chanakya-gold/40'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-chanakya-text-dim text-xs uppercase tracking-wider block mb-1">
              Category *
            </label>
            <input
              value={category}
              onChange={e => setCategory(e.target.value)}
              list="category-list"
              placeholder="e.g. Polity, History, Geometry…"
              className="w-full bg-chanakya-bg border border-chanakya-muted/30 rounded-lg px-3 py-2
                         text-chanakya-text text-sm focus:border-chanakya-gold outline-none transition-colors"
            />
            {section === 'Polity' && (
              <datalist id="category-list">
                {POLITY_CATEGORIES.map(c => <option key={c} value={c} />)}
              </datalist>
            )}
          </div>

          <div>
            <label className="text-chanakya-text-dim text-xs uppercase tracking-wider block mb-1">
              Topic * (be specific — this is the note title)
            </label>
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. Article 21 — Right to Life, Mitochondria, Profit & Loss"
              className="w-full bg-chanakya-bg border border-chanakya-muted/30 rounded-lg px-3 py-2
                         text-chanakya-text text-sm focus:border-chanakya-gold outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-chanakya-text-dim text-xs uppercase tracking-wider block mb-1">
              Subtopic (optional)
            </label>
            <input
              value={subtopic}
              onChange={e => setSubtopic(e.target.value)}
              placeholder="e.g. Expanded scope after Maneka Gandhi case"
              className="w-full bg-chanakya-bg border border-chanakya-muted/30 rounded-lg px-3 py-2
                         text-chanakya-text text-sm focus:border-chanakya-gold outline-none transition-colors"
            />
          </div>

          <button
            onClick={() => {
              if (!topic.trim() || !category.trim()) { setError('Topic and category are required'); return }
              setError(''); setStep('pyq-upload')
            }}
            className="px-5 py-2.5 bg-chanakya-gold text-chanakya-bg font-bold text-sm rounded-lg
                       heading-cinzel hover:bg-chanakya-gold-light transition-colors"
          >
            Next: Upload PYQs →
          </button>
        </div>
      )}

      {/* ── STEP 2: PYQ Upload ────────────────────────────── */}
      {step === 'pyq-upload' && (
        <div className="space-y-5">
          <h2 className="text-chanakya-gold font-mono text-sm uppercase tracking-wider">
            Step 2 — Upload PYQ PDF (Optional)
          </h2>
          <p className="text-chanakya-text-dim text-sm">
            Upload a PYQ PDF and we&apos;ll extract questions, cluster by topic, and link them to this note.
            You can also skip if you don&apos;t have the PDF ready.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-chanakya-text-dim text-xs block mb-1">Exam Name</label>
              <input
                value={examHint}
                onChange={e => setExam(e.target.value)}
                placeholder="SSC CGL"
                className="w-full bg-chanakya-bg border border-chanakya-muted/30 rounded-lg px-3 py-2
                           text-chanakya-text text-sm focus:border-chanakya-gold outline-none"
              />
            </div>
            <div>
              <label className="text-chanakya-text-dim text-xs block mb-1">Year</label>
              <input
                type="number"
                value={yearHint}
                onChange={e => setYear(parseInt(e.target.value, 10))}
                className="w-full bg-chanakya-bg border border-chanakya-muted/30 rounded-lg px-3 py-2
                           text-chanakya-text text-sm focus:border-chanakya-gold outline-none"
              />
            </div>
          </div>

          <div
            className="border-2 border-dashed border-chanakya-muted/30 rounded-xl p-8 text-center
                       hover:border-chanakya-gold/40 transition-colors cursor-pointer"
            onClick={() => pdfRef.current?.click()}
          >
            <input
              ref={pdfRef}
              type="file"
              accept="application/pdf"
              className="hidden"
            />
            <div className="text-4xl mb-3">📄</div>
            <p className="text-chanakya-text text-sm font-medium mb-1">
              Drop PDF here or click to select
            </p>
            <p className="text-chanakya-text-dim text-xs">
              Text-based PDFs only (not scanned images) · Max recommended: 5MB
            </p>
          </div>

          {pyqGroups.length > 0 && (
            <div className="card-dark p-4 rounded-lg">
              <p className="text-chanakya-green text-sm mb-2">
                ✓ Parsed {pyqGroups.reduce((s, g) => s + g.questions.length, 0)} questions across {pyqGroups.length} topics
              </p>
              <p className="text-chanakya-text-dim text-xs">
                Select the topic group to link to this note:
              </p>
              <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                {pyqGroups.map((g, i) => (
                  <button
                    key={i}
                    onClick={() => setSelGroup(g === selectedGroup ? null : g)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                      selectedGroup === g
                        ? 'bg-chanakya-gold/10 border border-chanakya-gold/40 text-chanakya-gold'
                        : 'text-chanakya-text-dim hover:bg-chanakya-muted/10'
                    }`}
                  >
                    {g.topic} — {g.questions.length} questions
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handlePDFUpload}
              disabled={loading}
              className="px-5 py-2.5 bg-chanakya-gold text-chanakya-bg font-bold text-sm rounded-lg
                         heading-cinzel hover:bg-chanakya-gold-light transition-colors disabled:opacity-50"
            >
              {loading ? 'Parsing PDF…' : 'Parse PDF'}
            </button>
            <button
              onClick={handleSkipPDF}
              className="px-5 py-2.5 border border-chanakya-muted/30 text-chanakya-text-dim text-sm
                         rounded-lg hover:border-chanakya-gold/40 transition-colors"
            >
              Skip → Add Reference
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Reference Material ───────────────────── */}
      {step === 'reference' && (
        <div className="space-y-5">
          <h2 className="text-chanakya-gold font-mono text-sm uppercase tracking-wider">
            Step 3 — Reference Material (Optional)
          </h2>
          <p className="text-chanakya-text-dim text-sm">
            Paste relevant text from NCERT / study material for this topic.
            Groq will extract key facts and weave it into the story and concept.
            If left blank, Groq uses its own knowledge of the SSC syllabus.
          </p>
          <textarea
            value={referenceText}
            onChange={e => setRef(e.target.value)}
            placeholder="Paste reference text here — chapter content, NCERT passage, notes…"
            rows={10}
            className="w-full bg-chanakya-bg border border-chanakya-muted/30 rounded-xl px-4 py-3
                       text-chanakya-text text-sm focus:border-chanakya-gold outline-none resize-none"
          />
          <p className="text-chanakya-text-dim text-xs">
            {referenceText.length} characters pasted
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setStep('generate')}
              className="px-5 py-2.5 bg-chanakya-gold text-chanakya-bg font-bold text-sm rounded-lg
                         heading-cinzel hover:bg-chanakya-gold-light transition-colors"
            >
              Next: Generate →
            </button>
            <button
              onClick={() => setStep('generate')}
              className="px-5 py-2.5 border border-chanakya-muted/30 text-chanakya-text-dim text-sm
                         rounded-lg hover:border-chanakya-gold/40 transition-colors"
            >
              Skip Reference
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4: Generate ─────────────────────────────── */}
      {step === 'generate' && (
        <div className="space-y-5">
          <h2 className="text-chanakya-gold font-mono text-sm uppercase tracking-wider">
            Step 4 — Generate with Groq AI
          </h2>

          <div className="card-dark p-4 rounded-xl space-y-2 text-sm">
            <p><span className="text-chanakya-text-dim">Topic:</span> <span className="text-chanakya-text">{topic}</span></p>
            <p><span className="text-chanakya-text-dim">Section:</span> <span className="text-chanakya-text capitalize">{section}</span></p>
            <p><span className="text-chanakya-text-dim">Category:</span> <span className="text-chanakya-text">{category}</span></p>
            <p><span className="text-chanakya-text-dim">PYQs linked:</span> <span className="text-chanakya-text">{selectedGroup?.questions.length ?? 0}</span></p>
            <p><span className="text-chanakya-text-dim">Reference text:</span> <span className="text-chanakya-text">{referenceText.length > 0 ? `${referenceText.length} chars` : 'None (Groq will use its knowledge)'}</span></p>
          </div>

          <p className="text-chanakya-text-dim text-sm">
            Groq will generate the upsc12 anatomy: Issue Story through Revision Box (12 blocks)
          </p>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-3 bg-chanakya-gold text-chanakya-bg font-bold text-sm rounded-lg
                       heading-cinzel hover:bg-chanakya-gold-light transition-colors disabled:opacity-50
                       flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⟳</span>
                Generating… (15-30 seconds)
              </>
            ) : (
              '⚡ Generate Smart Note'
            )}
          </button>
        </div>
      )}

      {/* ── STEP 5: Preview + Publish ─────────────────────── */}
      {step === 'preview' && generated && (
        <div className="space-y-6">
          <h2 className="text-chanakya-gold font-mono text-sm uppercase tracking-wider">
            Step 5 — Preview & Publish
          </h2>

          <div className="card-dark space-y-4 p-5 rounded-xl">
            <p className="text-chanakya-gold text-xs font-mono uppercase tracking-wider">Issue Story</p>
            <p className="note-surface whitespace-pre-line">{generated.issueStory}</p>
            <p className="text-chanakya-blue text-xs font-mono uppercase tracking-wider pt-2">Core Concept</p>
            <p className="note-surface whitespace-pre-line">{generated.coreConcept}</p>
            <p className="text-chanakya-green text-xs font-mono uppercase tracking-wider pt-2">Prelims Facts</p>
            <ul className="space-y-1">
              {generated.prelimsFacts.map((f, i) => (
                <li key={i} className="text-sm text-chanakya-text">{i + 1}. {f}</li>
              ))}
            </ul>
            <p className="text-chanakya-amber text-xs font-mono uppercase tracking-wider pt-2">Revision Box</p>
            <ul className="space-y-2">
              {generated.revisionBox.map((c, i) => (
                <li key={i} className="text-sm text-chanakya-text-dim">
                  <span className="text-chanakya-text">{c.prompt}</span>
                  <span className="block text-chanakya-green text-xs mt-0.5">→ {c.answer}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Status workflow actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => handleSave('published')}
              disabled={loading}
              className="flex-1 py-3 bg-chanakya-gold text-chanakya-bg font-bold text-sm rounded-lg
                         heading-cinzel hover:bg-chanakya-gold-light transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving…' : '✓ Publish to Users'}
            </button>
            <button
              onClick={() => handleSave('review')}
              disabled={loading}
              className="flex-1 py-3 border border-chanakya-amber/40 text-chanakya-amber text-sm
                         rounded-lg hover:bg-chanakya-amber/5 transition-colors disabled:opacity-50"
            >
              Send for Review
            </button>
            <button
              onClick={() => handleSave('draft')}
              disabled={loading}
              className="flex-1 py-3 border border-chanakya-muted/30 text-chanakya-text-dim text-sm
                         rounded-lg hover:border-chanakya-gold/40 transition-colors disabled:opacity-50"
            >
              Save Draft
            </button>
          </div>
          <button
            onClick={() => setStep('generate')}
            className="w-full py-2 border border-chanakya-muted/20 text-chanakya-text-dim text-xs
                       rounded-lg hover:border-chanakya-red/30 transition-colors"
          >
            ↺ Regenerate with Groq
          </button>

          {noteId && (
            <Link
              href={`/notes/${section}/${topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 100)}`}
              className="text-xs text-chanakya-gold hover:underline text-center block"
            >
              View note as user →
            </Link>
          )}

          {/* ── Link Mock Questions panel ────────────────── */}
          {noteId && (
            <div className="mt-8 border-t border-chanakya-muted/20 pt-8 space-y-4">
              <div>
                <h3 className="heading-cinzel text-chanakya-gold text-sm tracking-widest uppercase mb-1">
                  ⚡ Link to Mock Questions
                </h3>
                <p className="text-chanakya-text-dim text-xs leading-relaxed">
                  Connect this note to specific gate question IDs. When a user gets those questions wrong,
                  the repair CTA will point here. <span className="text-chanakya-gold">Always do this after publishing.</span>
                </p>
              </div>

              {linkError && (
                <div className="p-3 bg-chanakya-red/10 border border-chanakya-red/30 rounded-lg text-chanakya-red text-xs">
                  {linkError}
                </div>
              )}
              {linkSuccess && (
                <div className="p-3 bg-chanakya-green/10 border border-chanakya-green/30 rounded-lg text-chanakya-green text-xs">
                  {linkSuccess}
                </div>
              )}

              {/* Link type */}
              <div>
                <label className="text-chanakya-text-dim text-xs uppercase tracking-wider block mb-2">
                  Link Type
                </label>
                <div className="flex gap-2 flex-wrap">
                  {(['weak_topic', 'concept', 'trap', 'formula'] as NoteLinkType[]).map(lt => (
                    <button
                      key={lt}
                      onClick={() => setLinkType(lt)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        linkType === lt
                          ? 'border-chanakya-gold bg-chanakya-gold/10 text-chanakya-gold'
                          : 'border-chanakya-muted/30 text-chanakya-text-dim hover:border-chanakya-gold/30'
                      }`}
                    >
                      {lt === 'weak_topic' ? 'Weak Topic' : lt === 'concept' ? 'Concept' : lt === 'trap' ? 'Trap' : 'Formula'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto-suggest button */}
              <button
                onClick={handleSearchQuestions}
                disabled={linkLoading}
                className="w-full py-2.5 border border-chanakya-gold/30 text-chanakya-gold text-sm
                           rounded-lg hover:bg-chanakya-gold/5 transition-colors disabled:opacity-50"
              >
                {linkLoading ? '⟳ Searching gate files…' : '🔍 Auto-suggest from Gate Question Banks'}
              </button>

              {/* Search results */}
              {searchResults.length > 0 && (
                <div className="card-dark rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-chanakya-muted/20 flex items-center justify-between">
                    <p className="text-chanakya-text-dim text-xs">
                      {searchResults.length} matching question{searchResults.length > 1 ? 's' : ''} found
                    </p>
                    <button
                      onClick={() => setSelectedQIds(new Set(searchResults.map(q => q.id)))}
                      className="text-chanakya-gold text-xs hover:underline"
                    >
                      Select all
                    </button>
                  </div>
                  <div className="divide-y divide-chanakya-muted/10 max-h-64 overflow-y-auto">
                    {searchResults.map(q => (
                      <label
                        key={q.id}
                        className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-chanakya-muted/5 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedQIds.has(q.id)}
                          onChange={() => toggleQId(q.id)}
                          className="mt-0.5 shrink-0 accent-chanakya-gold"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-chanakya-gold text-xs">{q.id}</span>
                            <span className="text-chanakya-text-dim text-xs">·</span>
                            <span className="text-chanakya-text-dim text-xs">{q.topic}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              q.difficulty === 'Hard'   ? 'bg-chanakya-red/10 text-chanakya-red' :
                              q.difficulty === 'Medium' ? 'bg-chanakya-amber/10 text-chanakya-amber' :
                                                          'bg-chanakya-green/10 text-chanakya-green'
                            }`}>{q.difficulty}</span>
                            <span className="text-chanakya-text-dim text-xs">Gate {q.gate}</span>
                          </div>
                          <p className="text-chanakya-text text-xs mt-1 truncate">{q.text}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Manual entry */}
              <div>
                <label className="text-chanakya-text-dim text-xs uppercase tracking-wider block mb-1">
                  Or enter Question IDs manually (comma-separated)
                </label>
                <input
                  value={manualQIds}
                  onChange={e => setManualQIds(e.target.value)}
                  placeholder="G01-G-026, G01-G-029, G02-G-028…"
                  className="w-full bg-chanakya-bg border border-chanakya-muted/30 rounded-lg px-3 py-2
                             text-chanakya-text text-sm focus:border-chanakya-gold outline-none font-mono"
                />
                <p className="text-chanakya-text-dim text-xs mt-1">
                  Format: G01-G-026 (Gate 1, GK, Q26) · G02-R-005 (Gate 2, Reasoning, Q5)
                </p>
              </div>

              {/* Save links */}
              <button
                onClick={handleSaveLinks}
                disabled={linkLoading || (selectedQIds.size === 0 && !manualQIds.trim())}
                className="w-full py-3 bg-chanakya-gold/10 border border-chanakya-gold/30 text-chanakya-gold
                           font-bold text-sm rounded-lg hover:bg-chanakya-gold/15 transition-colors
                           disabled:opacity-40 heading-cinzel tracking-wider"
              >
                {linkLoading
                  ? '⟳ Linking…'
                  : `⚡ Link ${selectedQIds.size + manualQIds.split(',').filter(s => s.trim()).length} Question(s) to This Note`
                }
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
