import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import type { NoteSection } from '@/lib/notes/types'
import { ALL_SECTIONS, SECTION_LABELS } from '@/lib/notes/types'
import { hasGsPlan } from '@/lib/plans'

type NoteListItem = {
  id: string
  section: string
  category: string
  topic: string
  slug: string
  pyq_count: number
  last_asked: number | null
  high_yield: boolean
  difficulty: string | null
  read_time_mins: number
}

interface Props {
  params: Promise<{ section: string }>
}

export default async function SectionNotesPage({ params }: Props) {
  const { section: sectionParam } = await params
  const section = sectionParam as NoteSection
  if (!ALL_SECTIONS.includes(section)) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: planRow }, { data: sampleNote }, { data: notes }, { data: revised }] = await Promise.all([
    supabase.from('users').select('plan_type').eq('id', user.id).single(),
    supabase.from('smart_notes').select('id').eq('status', 'published').order('high_yield', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('smart_notes').select('id, section, category, topic, slug, pyq_count, last_asked, high_yield, difficulty, read_time_mins').eq('section', section).eq('status', 'published').order('topic'),
    supabase.from('note_revisions').select('note_id').eq('user_id', user.id),
  ])

  const paid = hasGsPlan(planRow?.plan_type)
  const sampleNoteId = sampleNote?.id
  const revisedSet = new Set(revised?.map(r => r.note_id) ?? [])
  const list = (notes ?? []) as NoteListItem[]

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center gap-2 text-xs text-inkdim">
        <Link href="/notes" className="transition-calm hover:text-copper">Notes</Link>
        <span>›</span>
        <span>{SECTION_LABELS[section]}</span>
      </div>

      <h1 className="heading-cinzel mb-6 text-2xl font-bold text-indigo">{SECTION_LABELS[section]}</h1>

      {list.length === 0 ? (
        <p className="text-sm text-inkdim">No published notes in this subject yet.</p>
      ) : (
        <div className="space-y-3">
          {list.map(note => {
            const locked = !paid && note.id !== sampleNoteId
            const href = locked ? '/upgrade?reason=notes' : `/notes/${section}/${note.slug}`
            return (
              <Link
                key={note.id}
                href={href}
                className={`card-calm flex items-center gap-4 p-4 transition-calm ${locked ? 'opacity-70' : 'hover:border-copper/40'}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate900">{note.topic}</p>
                  <p className="text-xs text-inkdim">{note.category} · ~{note.read_time_mins} min</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1 text-xs">
                  {revisedSet.has(note.id) && <span className="text-sage">Revised</span>}
                  {note.high_yield && <span className="text-copper">High yield</span>}
                  {locked && <span className="text-inkdim">Locked</span>}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
