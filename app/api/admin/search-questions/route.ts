// GET /api/admin/search-questions?topic=Article+21&section=gk&gate=all
// Scans local gate JSON files and returns questions matching the topic/section.
// Used by admin to find question IDs to link after publishing a Smart Note.
// Protected: admin only.

import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import fs   from 'fs'
import path from 'path'

function isAdmin(email: string | undefined) {
  return email === process.env.ADMIN_EMAIL
}

interface GateQuestion {
  id: string
  num: number
  section: string
  topic: string
  subtopic?: string
  difficulty: string
  text: string
  answer: string
}

interface GateFile {
  gate: number
  title: string
  questions: GateQuestion[]
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const topicQuery   = (searchParams.get('topic') ?? '').toLowerCase().trim()
  const sectionQuery = (searchParams.get('section') ?? '').toLowerCase().trim()
  const gateParam    = searchParams.get('gate') ?? 'all'   // 'all' | '1' | '2' ...

  if (!topicQuery && !sectionQuery) {
    return NextResponse.json({ error: 'Provide at least topic or section' }, { status: 400 })
  }

  const bankDir = path.join(process.cwd(), 'data', 'question-bank')

  let files: string[]
  try {
    files = fs.readdirSync(bankDir).filter(f => f.startsWith('gate-') && f.endsWith('.json'))
  } catch {
    return NextResponse.json({ matches: [], note: 'No gate files found yet — write them first.' })
  }

  if (gateParam !== 'all') {
    const num = parseInt(gateParam, 10)
    files = files.filter(f => f === `gate-0${num}.json` || f === `gate-${num}.json`)
  }

  type Match = GateQuestion & { gate: number; gate_title: string; score: number }
  const matches: Match[] = []

  for (const file of files) {
    let gateData: GateFile
    try {
      const raw = fs.readFileSync(path.join(bankDir, file), 'utf-8')
      gateData = JSON.parse(raw) as GateFile
    } catch {
      continue
    }

    for (const q of gateData.questions) {
      // Score: how well does this question match?
      let score = 0

      const qTopic    = (q.topic    ?? '').toLowerCase()
      const qSubtopic = (q.subtopic ?? '').toLowerCase()
      const qText     = (q.text     ?? '').toLowerCase()
      const qSection  = (q.section  ?? '').toLowerCase()

      // Section filter
      if (sectionQuery && !qSection.includes(sectionQuery)) continue

      // Topic scoring — exact / partial / text match
      const terms = topicQuery.split(/\s+/).filter(Boolean)
      for (const term of terms) {
        if (qTopic.includes(term))    score += 10
        if (qSubtopic.includes(term)) score += 6
        if (qText.includes(term))     score += 3
      }

      if (score === 0 && topicQuery) continue  // no match at all

      matches.push({ ...q, gate: gateData.gate, gate_title: gateData.title, score })
    }
  }

  // Sort by score desc, take top 30
  matches.sort((a, b) => b.score - a.score)
  const top = matches.slice(0, 30)

  return NextResponse.json({
    total:   matches.length,
    matches: top.map(({ score: _s, ...rest }) => rest),
  })
}
