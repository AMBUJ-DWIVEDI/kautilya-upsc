// POST /api/admin/parse-pyqs
// Accepts a PDF file upload, extracts text, sends to Groq for topic clustering.
// Protected: admin email check.

import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parsePYQsFromText } from '@/lib/notes/generator'

// pdf-parse is CJS-only — use createRequire so Turbopack bundles it via Node
import { createRequire } from 'module'
const require  = createRequire(import.meta.url)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (
  buffer: Buffer,
  options?: object
) => Promise<{ text: string; numpages: number }>

function isAdmin(email: string | undefined) {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) return false
  return email === adminEmail
}

export async function POST(req: NextRequest) {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Parse form data
  const form     = await req.formData()
  const file     = form.get('pdf') as File | null
  const examHint = (form.get('exam') as string) || 'SSC CGL'
  const yearStr  = form.get('year') as string
  const yearHint = yearStr ? parseInt(yearStr, 10) : new Date().getFullYear()

  if (!file) {
    return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 })
  }

  if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
    return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 })
  }

  // Extract text from PDF
  let rawText: string
  try {
    const buffer   = Buffer.from(await file.arrayBuffer())
    const parsed   = await pdfParse(buffer)
    rawText        = parsed.text
  } catch (err) {
    console.error('PDF parse error:', err)
    return NextResponse.json({ error: 'Could not read PDF — try a text-based PDF (not scanned image)' }, { status: 422 })
  }

  if (!rawText || rawText.trim().length < 50) {
    return NextResponse.json({ error: 'PDF appears empty or is a scanned image (not readable)' }, { status: 422 })
  }

  // Parse + cluster via Groq
  try {
    const groups = await parsePYQsFromText(rawText, examHint, yearHint)
    return NextResponse.json({
      raw_length:  rawText.length,
      total_qs:    groups.reduce((sum, g) => sum + g.questions.length, 0),
      topic_count: groups.length,
      groups,
    })
  } catch (err) {
    console.error('Groq parse error:', err)
    return NextResponse.json({ error: 'Failed to parse questions via AI' }, { status: 500 })
  }
}
