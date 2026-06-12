import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { SmartNote, NoteStatus, Upsc12Content } from '@/lib/notes/types'

function isAdmin(email: string | undefined) {
  return email === process.env.ADMIN_EMAIL
}

function makeSlug(section: string, topic: string): string {
  return `${section}-${topic}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json() as Partial<SmartNote> & {
    status?: NoteStatus
    content?: Upsc12Content
    anatomy?: 'upsc12' | 'ssc5'
  }

  const {
    id, section, category, topic, subtopic,
    content, anatomy = 'upsc12',
    pyq_refs, pyq_count, last_asked, high_yield,
    read_time_mins, difficulty,
    status = 'draft', source_type, version,
  } = body

  if (!section || !category || !topic) {
    return NextResponse.json({ error: 'section, category, and topic are required' }, { status: 400 })
  }

  const slug = id ? undefined : makeSlug(section, topic)
  const admin = createAdminClient()

  let nextVersion = version ?? 1
  if (id) {
    const { data: existing } = await admin
      .from('smart_notes')
      .select('version')
      .eq('id', id)
      .single()
    nextVersion = (existing?.version ?? 1) + 1
  }

  const payload = {
    section,
    category,
    topic,
    subtopic:       subtopic      ?? null,
    anatomy,
    content:        content       ?? {},
    pyq_refs:       pyq_refs      ?? [],
    pyq_count:      pyq_count     ?? (pyq_refs?.length ?? 0),
    last_asked:     last_asked    ?? null,
    high_yield:     high_yield    ?? (pyq_refs?.length ?? 0) >= 3,
    read_time_mins: read_time_mins ?? 12,
    difficulty:     difficulty    ?? null,
    status,
    source_type:    source_type   ?? 'manual_ai_reviewed',
    version:        nextVersion,
    ...(slug ? { slug } : {}),
  }

  let result
  if (id) {
    const { data, error } = await admin
      .from('smart_notes')
      .update(payload)
      .eq('id', id)
      .select('id, slug, status')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    result = data
  } else {
    const { data, error } = await admin
      .from('smart_notes')
      .insert(payload)
      .select('id, slug, status')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    result = data
  }

  return NextResponse.json({ id: result.id, slug: result.slug, status: result.status })
}
