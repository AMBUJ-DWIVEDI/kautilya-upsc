// ============================================================
// KAUTILYA — Resolve raw diagnosis answers into readable Q&A.
// Answers are stored as { cardId: optionKey } (+ identity_name).
// The report prompt feeds these back so the AI can reference the
// aspirant's ACTUAL choices instead of writing from numbers alone.
// ============================================================

import { CARDS, LEVEL_NAMES } from '@/lib/diagnosis/cards'
import type { Answers } from '@/lib/diagnosis/types'

export interface ResolvedAnswer {
  level: number
  levelName: string
  question: string
  answer: string
}

/** Turn { cardId: optionKey } into ordered, human-readable Q&A pairs. */
export function resolveDiagnosisAnswers(answers: Answers | null | undefined): ResolvedAnswer[] {
  if (!answers) return []
  const out: ResolvedAnswer[] = []
  for (const card of CARDS) {
    const key = answers[card.id]
    if (!key) continue
    const opt = card.options.find(o => o.key === key)
    if (!opt) continue
    out.push({
      level: card.level,
      levelName: LEVEL_NAMES[card.level] ?? `Level ${card.level}`,
      question: card.question,
      answer: opt.label,
    })
  }
  return out
}

/** Format resolved answers as a level-grouped block for the prompt. */
export function formatAnswersForPrompt(resolved: ResolvedAnswer[]): string {
  if (resolved.length === 0) return ''
  const byLevel = new Map<number, ResolvedAnswer[]>()
  for (const r of resolved) {
    const arr = byLevel.get(r.level) ?? []
    arr.push(r)
    byLevel.set(r.level, arr)
  }
  const blocks: string[] = []
  for (const [level, items] of [...byLevel.entries()].sort((a, b) => a[0] - b[0])) {
    const header = `— ${items[0]?.levelName ?? `Level ${level}`} —`
    const lines = items.map(i => `Q: ${i.question}\nThey chose: ${i.answer}`)
    blocks.push(`${header}\n${lines.join('\n')}`)
  }
  return blocks.join('\n\n')
}
