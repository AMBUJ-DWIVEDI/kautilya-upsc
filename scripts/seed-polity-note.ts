/**
 * Seeds one published Polity upsc12 note (Article 21) for M6 acceptance.
 * Requires SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL in env.
 */
import { join } from 'path'
import type { Upsc12Content } from '../lib/notes/types'

const CONTENT: Upsc12Content = {
  issueStory: `In January 2023, a bench enlarged the meaning of life under Article 21 again — not by adding words to the Constitution, but by reading silence as obligation. For the aspirant, Article 21 is never "just a fundamental right." It is the funnel through which privacy, dignity, livelihood, clean air, speedy trial, and even internet access have entered constitutional common sense.

The examiner does not ask whether Article 21 exists. The trap is scope: who it protects, what it protects against, and which case moved the line. Half-prepared candidates memorise Maneka Gandhi; the paper tests whether you know what changed after Puttaswamy, and what did not.`,
  coreConcept: `Article 21 guarantees that no person shall be deprived of life or personal liberty except according to procedure established by law. The word "person" — not citizen — is the first precision point. The second is the procedural revolution: Maneka Gandhi (1978) made the procedure itself subject to Articles 14 and 19, transforming due process in substance if not in name. The third is expansion by interpretation: dignity and privacy are not separate rights but facets of life and liberty.`,
  dimensions: [
    'Negative vs positive obligations of the State',
    'Procedure established by law vs due process',
    'Horizontal application through Article 12 expansion',
    'Intersection with environmental jurisprudence (MC Mehta line)',
    'Bail and speedy trial as liberty questions',
  ],
  constitutionalLink: `Article 21 (Part III) read with Articles 14 and 19 (Maneka triad); Article 300A (property after 44th Amendment); Articles 32 and 226 as enforcement routes.`,
  dataReport: `NCRB prison statistics frequently anchor questions on undertrial detention. DAKSH reports on judicial delays are common analytical frames in Mains answers.`,
  caseStudy: `Maneka Gandhi v. Union of India (1978): passport impounding triggered the re-reading of "procedure" — fairness and reasonableness became constitutional requirements. Puttaswamy (2017): nine-judge bench held privacy intrinsic to life and liberty, reframing data governance and surveillance debates.`,
  argumentsFor: [
    'An expanding Article 21 allows the Constitution to answer questions the framers did not foresee — privacy, ecology, digital dignity.',
    'Reading "person" broadly aligns with universal human rights commitments without formal amendment.',
    'Substantive due process through Articles 14 and 19 prevents procedural formalism from hollowing rights.',
  ],
  argumentsAgainst: [
    'Judicial expansion risks democratic deficit when elected branches are bypassed on policy choices.',
    'Over-breadth can blur the distinction between justiciable rights and directive goals.',
    'Inconsistent benches on bail and livelihood create uncertainty for administrators.',
  ],
  pyqLink: `UPSC repeatedly tests Article 21 through statement-count formats: foreigners, prisoners, negative obligations, and post-Puttaswamy propositions. Expect pair-match questions linking cases to holdings.`,
  answerFramework: {
    intro: 'Article 21 is the Constitution\'s moral baseline — life and liberty protected through procedure that is fair, not merely present.',
    body: [
      'Trace the textual anchor and the Maneka procedural revolution.',
      'Illustrate expansion through two landmark cases with distinct holdings.',
      'Address a contemporary application (privacy, environment, or bail).',
    ],
    conclusion: 'The right endures not because it is unlimited, but because its interpretation keeps the State accountable to dignity.',
  },
  mainsExamples: [
    'Discuss whether Article 21 imposes positive obligations on the State in welfare delivery.',
    'Examine the evolution of privacy jurisprudence after Puttaswamy.',
  ],
  prelimsFacts: [
    'Article 21 protects "persons", not only citizens.',
    'Maneka Gandhi (1978) linked Articles 21, 14, and 19.',
    'Puttaswamy (2017): privacy is intrinsic to life and liberty.',
    'Right to property is under Article 300A, not Part III (post-44th Amendment).',
    'Article 21 cannot be suspended during Emergency for enforcement of Articles 20–21 (Article 359 exception).',
  ],
  revisionBox: [
    { prompt: 'Who does Article 21 protect — citizens or persons?', answer: 'Persons — including non-citizens.' },
    { prompt: 'Which case made procedure under Article 21 subject to reasonableness?', answer: 'Maneka Gandhi v. Union of India (1978).' },
    { prompt: 'Which amendment removed property from Part III?', answer: '44th Constitutional Amendment (1978).' },
  ],
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    const outPath = join(process.cwd(), 'data', 'smart-notes', 'polity-article-21.json')
    const { mkdirSync } = await import('fs')
    mkdirSync(join(process.cwd(), 'data', 'smart-notes'), { recursive: true })
    const { writeFileSync } = await import('fs')
    writeFileSync(outPath, JSON.stringify({
      section: 'Polity',
      category: 'Fundamental Rights',
      topic: 'Article 21 — Right to Life',
      subtopic: 'Scope, expansion, and landmark cases',
      slug: 'polity-article-21-right-to-life',
      anatomy: 'upsc12',
      content: CONTENT,
      status: 'published',
      high_yield: true,
      pyq_count: 8,
      last_asked: 2024,
      read_time_mins: 14,
    }, null, 2))
    console.log(`No Supabase env — wrote ${outPath}`)
    return
  }

  const payload = {
    section: 'Polity',
    category: 'Fundamental Rights',
    topic: 'Article 21 — Right to Life',
    subtopic: 'Scope, expansion, and landmark cases',
    slug: 'polity-article-21-right-to-life',
    anatomy: 'upsc12',
    content: CONTENT,
    status: 'published',
    high_yield: true,
    pyq_refs: [{ year: 2023, exam: 'UPSC Prelims', pattern_note: 'Statement-count on scope of Article 21' }],
    pyq_count: 8,
    last_asked: 2024,
    read_time_mins: 14,
    source_type: 'seed_m6',
    version: 1,
  }

  const res = await fetch(`${url}/rest/v1/smart_notes?on_conflict=slug`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    console.error(await res.text())
    process.exit(1)
  }
  const data = await res.json() as { id: string }[]
  console.log('Seeded Polity note:', data[0]?.id ?? 'ok')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
