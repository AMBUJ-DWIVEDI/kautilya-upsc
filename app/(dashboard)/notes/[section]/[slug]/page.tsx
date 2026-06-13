import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import type { SmartNote, NoteSection } from '@/lib/notes/types'
import { ALL_SECTIONS, SECTION_LABELS } from '@/lib/notes/types'
import { NoteViewerFromRow } from '@/components/notes/Upsc12NoteViewer'
import { hasGsPlan } from '@/lib/plans'
import { getLocalSampleSmartNotes, getLocalSmartNote } from '@/lib/notes/local'

interface Props {
  params: Promise<{ section: string; slug: string }>
  searchParams: Promise<{ mode?: string }>
}

export default async function NoteDetailPage({ params, searchParams }: Props) {
  const { section: sectionParam, slug } = await params
  const { mode } = await searchParams
  const section = sectionParam as NoteSection
  if (!ALL_SECTIONS.includes(section)) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: note, error } = await supabase
    .from('smart_notes')
    .select('*')
    .eq('slug', slug)
    .eq('section', section)
    .eq('status', 'published')
    .maybeSingle()

  if (error) notFound()

  const smartNote = (note as SmartNote | null) ?? getLocalSmartNote(section, slug)
  if (!smartNote) notFound()

  const [{ data: planRow }, { data: dbSamples }] = await Promise.all([
    supabase.from('users').select('plan_type').eq('id', user.id).single(),
    supabase.from('smart_notes').select('id').eq('status', 'published').order('high_yield', { ascending: false }).limit(3),
  ])
  // 3 free sample notes (launch freemium); the rest are Commander-only.
  const localSampleNotes = getLocalSampleSmartNotes(3)
  const sampleNoteIds = new Set(
    [
      ...(dbSamples ?? []).map(s => s.id),
      ...localSampleNotes.map(n => n.id),
    ].filter(Boolean) as string[],
  )

  if (!hasGsPlan(planRow?.plan_type) && !sampleNoteIds.has(smartNote.id)) {
    redirect('/upgrade?reason=notes')
  }

  const isLocalNote = smartNote.id.startsWith('local-')
  const { data: revision } = isLocalNote
    ? { data: null }
    : await supabase
      .from('note_revisions')
      .select('note_id, revision_count, confidence, next_due_at')
      .eq('user_id', user.id)
      .eq('note_id', smartNote.id)
      .maybeSingle()

  const isRevised = !!revision
  const revisionCount = revision?.revision_count ?? 0
  const revisionMode = mode === 'revision'

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center gap-2 text-xs text-inkdim">
        <Link href="/notes" className="transition-calm hover:text-copper">Repair Library</Link>
        <span>›</span>
        <Link href={`/notes/${section}`} className="transition-calm hover:text-copper">
          {SECTION_LABELS[section]}
        </Link>
        <span>›</span>
        <span className="text-inkdim/60">{smartNote.category}</span>
      </div>

      <div className="card-calm copper-border mb-6 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-copper/10 px-2 py-0.5 font-mono text-xs text-copper">
                {smartNote.category}
              </span>
              {smartNote.high_yield && (
                <span className="rounded-full bg-copper/10 px-2 py-0.5 text-xs text-copper">High yield</span>
              )}
              {isRevised && (
                <span className="rounded-full bg-sage/10 px-2 py-0.5 text-xs text-sage">Recall sealed</span>
              )}
            </div>
            <h1 className="heading-cinzel text-xl font-bold text-indigo">{smartNote.topic}</h1>
            {smartNote.subtopic && (
              <p className="mt-0.5 text-sm text-inkdim">{smartNote.subtopic}</p>
            )}
          </div>
          <p className="shrink-0 text-xs text-inkdim">~{smartNote.read_time_mins} min</p>
        </div>
      </div>

      {revision?.next_due_at && !revisionMode && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-copper/20 bg-copper/5 px-4 py-2.5 text-xs text-inkdim">
          <span className="text-copper">Next recall drill:</span>
          <span className="font-mono text-copper">
            {new Date(revision.next_due_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      )}

      <NoteViewerFromRow
        note={smartNote}
        isRevised={isRevised}
        revisionCount={revisionCount}
        revisionMode={revisionMode}
        initialAnchor={revisionMode ? undefined : 'issue-story'}
      />

      <div className="mt-8 flex items-center justify-between border-t border-linen pt-6">
        <Link href={`/notes/${section}`} className="text-sm text-inkdim transition-calm hover:text-copper">
          ← {SECTION_LABELS[section]}
        </Link>
        <Link href="/dashboard" className="text-sm text-copper transition-calm hover:underline">
          Open Today&apos;s Command →
        </Link>
      </div>
    </div>
  )
}
