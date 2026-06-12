import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ALL_SECTIONS, SECTION_LABELS } from '@/lib/notes/types'
import type { NoteSection } from '@/lib/notes/types'

const SECTION_COLORS: Record<NoteSection, string> = {
  Polity:         'border-copper/40 hover:border-copper/70',
  History:        'border-indigo/30 hover:border-indigo/50',
  Geography:      'border-sage/40 hover:border-sage/70',
  Economy:        'border-copper/30 hover:border-copper/50',
  Environment:    'border-sage/30 hover:border-sage/50',
  SciTech:        'border-indigo/40 hover:border-indigo/60',
  CurrentAffairs: 'border-clay/30 hover:border-clay/50',
}

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>
}) {
  const { mode } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: sectionCounts } = await supabase
    .from('smart_notes')
    .select('section')
    .eq('status', 'published')

  const countMap: Partial<Record<NoteSection, number>> = {}
  sectionCounts?.forEach(r => {
    const s = r.section as NoteSection
    countMap[s] = (countMap[s] ?? 0) + 1
  })

  const { data: revised } = await supabase
    .from('note_revisions')
    .select('note_id, smart_notes!inner(id, slug, section, topic, content)')
    .eq('user_id', user.id)
    .limit(10)

  const revisedCount = revised?.length ?? 0
  const totalNotes = Object.values(countMap).reduce((a, b) => a + (b ?? 0), 0)

  if (mode === 'revision') {
    return (
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="heading-cinzel mb-2 text-2xl font-bold text-indigo">Recall test</h1>
        <p className="mb-6 text-sm text-inkdim">Cards from notes you have marked revised.</p>
        {revised && revised.length > 0 ? (
          <div className="space-y-3">
            {revised.map(r => {
              const note = r.smart_notes as unknown as { slug: string; section: string; topic: string }
              return (
                <Link
                  key={note.slug}
                  href={`/notes/${note.section}/${note.slug}?mode=revision`}
                  className="card-calm block p-4 transition-calm hover:border-copper/40"
                >
                  <p className="font-medium text-slate900">{note.topic}</p>
                  <p className="text-xs text-inkdim">{SECTION_LABELS[note.section as NoteSection]}</p>
                </Link>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-inkdim">No revised notes yet. Read one note and mark it revised first.</p>
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.3em] text-copper">
          Smart Notes · 12-block anatomy
        </p>
        <h1 className="heading-cinzel text-2xl font-bold text-indigo">The Reading Vault</h1>
        <p className="mt-2 text-sm text-inkdim">
          Issue-unit depth for Prelims precision and Mains structure. Parchment surface, 17px serif.
        </p>
        {totalNotes > 0 && (
          <div className="mt-4 flex items-center gap-4 text-xs">
            <span className="text-inkdim">{totalNotes} published</span>
            {revisedCount > 0 && <span className="text-sage">{revisedCount} in revision queue</span>}
          </div>
        )}
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {ALL_SECTIONS.map(section => {
          const count = countMap[section] ?? 0
          return (
            <Link
              key={section}
              href={`/notes/${section}`}
              className={`card-calm rounded-xl border p-5 transition-calm ${SECTION_COLORS[section]}`}
            >
              <h2 className="text-lg font-bold text-slate900">{SECTION_LABELS[section]}</h2>
              <p className="mt-1 text-xs text-inkdim">{count} note{count !== 1 ? 's' : ''}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
