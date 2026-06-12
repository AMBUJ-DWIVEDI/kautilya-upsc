// GET /api/notes/weak-notes?attempt_id=xxx
// Returns published Smart Notes that match the weak topics from a mock attempt.
// Used by the mock result page to show "Repair with Smart Note" CTAs.
//
// Matching strategy (two passes):
//   1. question_note_links — explicit admin-curated links (exact)
//   2. topic fuzzy match — smart_notes.topic ILIKE weak_topic (fallback)

import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface WeakNoteMatch {
  note_id:   string
  slug:      string
  topic:     string
  section:   string
  category:  string
  mnemonic?: string
  high_yield: boolean
  match_type: 'explicit' | 'topic_match'
  // source weak topic
  weak_topic: string
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const attemptId = searchParams.get('attempt_id')

  if (!attemptId) {
    return NextResponse.json({ error: 'attempt_id required' }, { status: 400 })
  }

  // Load the attempt's diagnosis report to get wrong question IDs + weak topics
  const { data: report } = await supabase
    .from('diagnosis_reports')
    .select('report_content')
    .eq('attempt_id', attemptId)
    .eq('user_id', user.id)
    .single()

  if (!report) return NextResponse.json({ matches: [] })

  const content = report.report_content as {
    question_summary: { id: string; correct: boolean; unattempted: boolean }[]
    weak_topics: { topic: string; section: string }[]
  }

  const wrongQIds  = content.question_summary
    .filter(q => !q.correct && !q.unattempted)
    .map(q => q.id)

  const weakTopics = content.weak_topics ?? []

  const matches: WeakNoteMatch[] = []
  const seenNoteIds = new Set<string>()

  // ── Pass 1: explicit question_note_links ──────────────────
  if (wrongQIds.length > 0) {
    const { data: links } = await supabase
      .from('question_note_links')
      .select(`question_id, link_type, smart_notes!inner(id,slug,topic,section,category,mnemonic,high_yield,status)`)
      .in('question_id', wrongQIds)
      .eq('smart_notes.status', 'published')

    type JoinedNote = { id: string; slug: string; topic: string; section: string; category: string; mnemonic?: string; high_yield: boolean; status: string }
    type JoinedLink = { question_id: string; link_type: string; smart_notes: JoinedNote | JoinedNote[] }

    for (const rawLink of links ?? []) {
      const link = rawLink as unknown as JoinedLink
      const note = Array.isArray(link.smart_notes) ? link.smart_notes[0] : link.smart_notes
      if (note && !seenNoteIds.has(note.id)) {
        seenNoteIds.add(note.id)
        matches.push({
          note_id:    note.id,
          slug:       note.slug,
          topic:      note.topic,
          section:    note.section,
          category:   note.category,
          mnemonic:   note.mnemonic,
          high_yield: note.high_yield,
          match_type: 'explicit',
          weak_topic: link.question_id,
        })
      }
    }
  }

  // ── Pass 2: topic fuzzy match for remaining weak topics ───
  const unmatchedTopics = weakTopics.filter(wt =>
    !matches.some(m => m.weak_topic === wt.topic)
  )

  for (const wt of unmatchedTopics.slice(0, 5)) {
    const { data: notes } = await supabase
      .from('smart_notes')
      .select('id, slug, topic, section, category, mnemonic, high_yield')
      .eq('status', 'published')
      .ilike('topic', `%${wt.topic}%`)
      .limit(1)

    const note = notes?.[0]
    if (note && !seenNoteIds.has(note.id)) {
      seenNoteIds.add(note.id)
      matches.push({
        note_id:    note.id,
        slug:       note.slug,
        topic:      note.topic,
        section:    note.section,
        category:   note.category,
        mnemonic:   note.mnemonic,
        high_yield: note.high_yield,
        match_type: 'topic_match',
        weak_topic: wt.topic,
      })
    }
  }

  return NextResponse.json({ matches })
}
