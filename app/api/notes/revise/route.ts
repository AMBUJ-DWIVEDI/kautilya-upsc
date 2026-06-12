// POST /api/notes/revise
// Upserts a note_revisions row.
// On re-revision: increments revision_count + recalculates next_due_at.

import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { NoteConfidence } from '@/lib/notes/types'
import { nextDueDate } from '@/lib/notes/types'
import { hasGsPlan } from '@/lib/plans'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { note_id, confidence = 'Medium' } = await req.json() as {
    note_id:    string
    confidence?: NoteConfidence
  }

  if (!note_id) return NextResponse.json({ error: 'note_id required' }, { status: 400 })

  const [{ data: planRow }, { data: sampleNote }] = await Promise.all([
    supabase.from('users').select('plan_type').eq('id', user.id).single(),
    supabase
      .from('smart_notes')
      .select('id')
      .eq('status', 'published')
      .order('high_yield', { ascending: false })
      .order('pyq_count', { ascending: false })
      .order('topic', { ascending: true })
      .limit(1)
      .single(),
  ])

  if (!hasGsPlan(planRow?.plan_type) && note_id !== sampleNote?.id) {
    return NextResponse.json({ error: 'GS Command unlocks the full notes vault.' }, { status: 403 })
  }

  // Check if already revised
  const { data: existing } = await supabase
    .from('note_revisions')
    .select('id, revision_count')
    .eq('user_id', user.id)
    .eq('note_id', note_id)
    .single()

  const revision_count = (existing?.revision_count ?? 0) + 1
  const due             = nextDueDate(confidence as NoteConfidence)

  const { error } = await supabase
    .from('note_revisions')
    .upsert({
      user_id:        user.id,
      note_id,
      revised_at:     new Date().toISOString(),
      revision_count,
      confidence,
      next_due_at:    due,
    }, { onConflict: 'user_id,note_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    ok:             true,
    revision_count,
    next_due_at:    due,
  })
}
