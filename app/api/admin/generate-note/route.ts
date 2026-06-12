// POST /api/admin/generate-note
// Calls Groq to generate a 5-layer smart note for a given topic + PYQs + reference text.
// Protected: admin email check.

import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateNoteContent } from '@/lib/notes/generator'
import type { PYQRef } from '@/lib/notes/types'

function isAdmin(email: string | undefined) {
  return email === process.env.ADMIN_EMAIL
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json() as {
    topic:         string
    section:       string
    category:      string
    pyqs:          PYQRef[]
    referenceText: string
  }

  const { topic, section, category, pyqs = [], referenceText = '' } = body

  if (!topic || !section || !category) {
    return NextResponse.json({ error: 'topic, section, and category are required' }, { status: 400 })
  }

  try {
    const content = await generateNoteContent(topic, section, category, pyqs, referenceText)
    return NextResponse.json({ content })
  } catch (err) {
    console.error('Note generation error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
