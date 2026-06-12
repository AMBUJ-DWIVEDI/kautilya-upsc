// ============================================================
// KAUTILYA UPSC — Smart Note Generator (Groq)
// Called from server-side admin API only.
// ============================================================

import type { GeneratedUpsc12Content, PYQRef, ParsedPYQGroup, NoteSection } from './types'
import { emptyUpsc12Content } from './types'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL   = 'llama-3.3-70b-versatile'

const UPSC12_SYSTEM_PROMPT = `You are KAUTILYA — a UPSC Civil Services mentor writing issue-unit Smart Notes.
Tone: civilizational calm, verdict-first, fierce at the system never the aspirant.
Every block must be exam-usable for both Prelims (precision) and Mains (structure).

Return ONLY valid JSON matching the upsc12 anatomy. No markdown wrapper.`

const UPSC12_JSON_TEMPLATE = `{
  "issueStory": "200-280 words. Why this issue matters NOW — news hook, stakes, the tension aspirants miss.",
  "coreConcept": "120-180 words. The definitional spine. Every sentence is askable.",
  "dimensions": ["3-6 analytical dimensions — e.g. federal, rights, fiscal, institutional"],
  "constitutionalLink": "Articles, Parts, Schedules, amendments — with one-line significance each.",
  "dataReport": "2-4 data points or committee/report citations with years.",
  "caseStudy": "One landmark case or policy episode — facts, holding, why UPSC asks it.",
  "argumentsFor": ["3-4 Mains-ready pro arguments"],
  "argumentsAgainst": ["3-4 Mains-ready counter arguments"],
  "pyqLink": "How UPSC has asked this — pattern, not just year listing.",
  "answerFramework": {
    "intro": "2-3 sentence Mains intro template",
    "body": ["Body paragraph 1 theme", "Body paragraph 2 theme", "Body paragraph 3 theme"],
    "conclusion": "Balanced conclusion line"
  },
  "mainsExamples": ["2-3 example-driven lines for Mains answers"],
  "prelimsFacts": ["Exactly 5 atomic Prelims facts — dates, articles, committees"],
  "revisionBox": [
    { "prompt": "Recall question 1", "answer": "Short answer 1" },
    { "prompt": "Recall question 2", "answer": "Short answer 2" },
    { "prompt": "Recall question 3", "answer": "Short answer 3" }
  ]
}`

export async function generateNoteContent(
  topic: string,
  section: string,
  category: string,
  pyqs: PYQRef[],
  referenceText: string,
): Promise<GeneratedUpsc12Content> {
  return generateUpsc12Content(topic, section, category, pyqs, referenceText)
}

export async function generateUpsc12Content(
  topic: string,
  section: string,
  category: string,
  pyqs: PYQRef[],
  referenceText: string,
): Promise<GeneratedUpsc12Content> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY not set')

  const pyqBlock = pyqs.length > 0
    ? `\nPREVIOUS YEAR QUESTIONS:\n${pyqs.map(p => `${p.year} ${p.exam}: "${p.question}" → ${p.answer}`).join('\n')}`
    : '\nNo PYQ data — infer standard UPSC Prelims/Mains patterns for this topic.'

  const userPrompt = `
TOPIC: ${topic}
GS SUBJECT: ${section}
CATEGORY: ${category}
${pyqBlock}

REFERENCE MATERIAL:
${referenceText || 'No reference text — use authoritative UPSC syllabus knowledge.'}

Generate the upsc12 JSON:
${UPSC12_JSON_TEMPLATE}`

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: UPSC12_SYSTEM_PROMPT },
        { role: 'user',   content: userPrompt },
      ],
      temperature:     0.65,
      max_tokens:      4096,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq API error: ${err}`)
  }

  const data = await res.json() as { choices?: { message?: { content?: string } }[] }
  const raw  = data.choices?.[0]?.message?.content
  if (!raw) throw new Error('Empty response from Groq')

  const parsed = JSON.parse(raw) as Partial<GeneratedUpsc12Content>
  const base = emptyUpsc12Content()

  const content: GeneratedUpsc12Content = {
    ...base,
    ...parsed,
    dimensions: parsed.dimensions ?? base.dimensions,
    argumentsFor: parsed.argumentsFor ?? base.argumentsFor,
    argumentsAgainst: parsed.argumentsAgainst ?? base.argumentsAgainst,
    mainsExamples: parsed.mainsExamples ?? base.mainsExamples,
    prelimsFacts: parsed.prelimsFacts ?? base.prelimsFacts,
    revisionBox: parsed.revisionBox ?? base.revisionBox,
    answerFramework: {
      ...base.answerFramework,
      ...(parsed.answerFramework ?? {}),
      body: parsed.answerFramework?.body ?? base.answerFramework.body,
    },
  }

  if (!content.issueStory || !content.coreConcept) {
    throw new Error('Groq returned incomplete note — missing issueStory/coreConcept')
  }

  return content
}

export async function parsePYQsFromText(
  rawText: string,
  examHint: string,
  yearHint: number,
): Promise<ParsedPYQGroup[]> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY not set')

  const prompt = `You are parsing UPSC CSE PYQ data.

EXAM: ${examHint}
YEAR: ${yearHint}

RAW TEXT FROM PDF:
${rawText.slice(0, 6000)}

Extract questions. Assign GS subject: Polity, History, Geography, Economy, Environment, SciTech, or CurrentAffairs.

Return JSON: { "questions": [ { "question", "options": {"A","B","C","D"}, "answer", "year", "exam", "suggested_topic", "suggested_section", "suggested_category" } ] }`

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model:           GROQ_MODEL,
      messages:        [{ role: 'user', content: prompt }],
      temperature:     0.1,
      max_tokens:      4096,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) throw new Error(`Groq API error: ${res.status}`)

  const data = await res.json() as { choices?: { message?: { content?: string } }[] }
  const raw = data.choices?.[0]?.message?.content ?? '{}'

  let parsed: import('./types').ParsedPYQ[]
  try {
    const obj = JSON.parse(raw) as { questions?: import('./types').ParsedPYQ[] } | import('./types').ParsedPYQ[]
    parsed = Array.isArray(obj) ? obj : (obj.questions ?? [])
  } catch {
    parsed = []
  }

  const groups = new Map<string, ParsedPYQGroup>()
  for (const q of parsed) {
    const key = `${q.suggested_section}__${q.suggested_topic}`
    if (!groups.has(key)) {
      groups.set(key, {
        topic:    q.suggested_topic,
        section:  q.suggested_section as NoteSection,
        category: q.suggested_category,
        questions: [],
      })
    }
    groups.get(key)!.questions.push(q)
  }

  return Array.from(groups.values())
}
