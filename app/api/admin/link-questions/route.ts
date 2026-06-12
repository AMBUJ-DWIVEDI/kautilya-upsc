// POST /api/admin/link-questions
// Bulk-links question IDs to a Smart Note.
// Admin uses this after publishing a note to wire it to mock questions.

import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { NoteLinkType } from '@/lib/notes/types'

function isAdmin(email: string | undefined) {
  return email === process.env.ADMIN_EMAIL
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { note_id, question_ids, link_type = 'weak_topic' } = await req.json() as {
    note_id:      string
    question_ids: string[]
    link_type?:   NoteLinkType
  }

  if (!note_id || !question_ids?.length) {
    return NextResponse.json({ error: 'note_id and question_ids are required' }, { status: 400 })
  }

  const admin = createAdminClient()

  const rows = question_ids.map(qid => ({
    question_id: qid,
    note_id,
    link_type,
  }))

  const { error } = await admin
    .from('question_note_links')
    .upsert(rows, { onConflict: 'question_id,note_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, count: rows.length, linked: rows.length })
}
