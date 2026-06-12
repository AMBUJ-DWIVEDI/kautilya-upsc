'use client'

import { useState, useTransition, useCallback } from 'react'
import type { SmartNote, NoteConfidence, Upsc12Content } from '@/lib/notes/types'
import { UPSC12_BLOCK_ORDER } from '@/lib/notes/types'
import { resolveNoteContent } from '@/lib/notes/content'

interface Props {
  note: SmartNote
  content: Upsc12Content
  isRevised: boolean
  revisionCount: number
  revisionMode?: boolean
  initialAnchor?: string
}

const CONFIDENCE_LABELS: Record<NoteConfidence, { label: string; desc: string; color: string }> = {
  Low:    { label: 'Low',    desc: 'Re-read tomorrow',  color: 'border-clay/40 text-clay' },
  Medium: { label: 'Medium', desc: 'Revise in 3 days',  color: 'border-copper/40 text-copper' },
  High:   { label: 'High',   desc: 'Revisit in 7 days', color: 'border-sage/40 text-sage' },
}

export default function Upsc12NoteViewer({
  note,
  content,
  isRevised: initialRevised,
  revisionCount: initialCount,
  revisionMode = false,
  initialAnchor,
}: Props) {
  const [openBlocks, setOpenBlocks] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    for (const b of UPSC12_BLOCK_ORDER) {
      init[b.key] = b.anchor === initialAnchor || !!b.pinned
    }
    return init
  })
  const [copied, setCopied] = useState(false)
  const [revised, setRevised] = useState(initialRevised)
  const [revCount, setRevCount] = useState(initialCount)
  const [confidence, setConfidence] = useState<NoteConfidence>('Medium')
  const [showConf, setShowConf] = useState(false)
  const [pending, startTransition] = useTransition()

  const toggle = (key: string) => setOpenBlocks(prev => ({ ...prev, [key]: !prev[key] }))

  const copyFramework = useCallback(async () => {
    const fw = content.answerFramework
    const text = [
      'INTRO', fw.intro, '',
      'BODY', ...fw.body.map((p, i) => `${i + 1}. ${p}`), '',
      'CONCLUSION', fw.conclusion,
    ].join('\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [content.answerFramework])

  async function handleRevise() {
    startTransition(async () => {
      const res = await fetch('/api/notes/revise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note_id: note.id, confidence }),
      })
      if (res.ok) {
        const data = await res.json() as { revision_count?: number }
        setRevised(true)
        setRevCount(data.revision_count ?? revCount + 1)
        setShowConf(false)
      }
    })
  }

  if (revisionMode) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-inkdim">Recall cards from {note.topic}. Answer before revealing.</p>
        {content.revisionBox.length > 0 ? (
          content.revisionBox.map((card, i) => (
            <RevisionCard key={i} prompt={card.prompt} answer={card.answer} />
          ))
        ) : (
          <EmptyBlock text="Revision cards not yet seeded for this note." />
        )}
      </div>
    )
  }

  const pinned = UPSC12_BLOCK_ORDER.filter(b => !!b.pinned)

  return (
    <div className="relative flex gap-6">
      {/* Sticky mini-TOC — desktop only */}
      <aside className="hidden w-44 shrink-0 lg:block">
        <nav className="sticky top-24 space-y-2 text-xs">
          <p className="mb-2 font-mono uppercase tracking-widest text-copper">Quick jump</p>
          {UPSC12_BLOCK_ORDER.map(b => (
            <a
              key={b.key}
              href={`#${b.anchor}`}
              className={`block rounded px-2 py-1 transition-calm hover:bg-linen ${
                b.pinned ? 'font-semibold text-copper' : 'text-inkdim hover:text-slate900'
              }`}
            >
              {b.label}
            </a>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1 space-y-4">
        {/* Pinned strip — mobile */}
        <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {pinned.map(b => (
            <a
              key={b.key}
              href={`#${b.anchor}`}
              className="shrink-0 rounded-full border border-copper/30 bg-ivory px-3 py-1 text-xs text-copper"
            >
              {b.label}
            </a>
          ))}
        </div>

        {UPSC12_BLOCK_ORDER.map(block => {
          if (block.key === 'argumentsAgainst') return null
          if (block.key === 'argumentsFor') {
            return (
              <BlockSection
                key="arguments"
                id="arguments-for"
                label="Arguments For & Against"
                open={openBlocks.argumentsFor ?? false}
                onToggle={() => toggle('argumentsFor')}
              >
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-sage">For</p>
                    <BlockBody blockKey="argumentsFor" content={content} onCopyFramework={copyFramework} copied={copied} />
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-clay">Against</p>
                    <BlockBody blockKey="argumentsAgainst" content={content} onCopyFramework={copyFramework} copied={copied} />
                  </div>
                </div>
              </BlockSection>
            )
          }
          return (
            <BlockSection
              key={block.key}
              id={block.anchor}
              label={block.label}
              open={openBlocks[block.key] ?? false}
              onToggle={() => toggle(block.key)}
              pinned={!!block.pinned}
            >
              <BlockBody
                blockKey={block.key}
                content={content}
                onCopyFramework={copyFramework}
                copied={copied}
              />
            </BlockSection>
          )
        })}

        <RevisionFooter
          revCount={revCount}
          revised={revised}
          showConf={showConf}
          confidence={confidence}
          pending={pending}
          onShowConf={() => setShowConf(true)}
          onConfidence={setConfidence}
          onRevise={handleRevise}
        />
      </div>
    </div>
  )
}

function BlockSection({
  id, label, open, onToggle, pinned, children,
}: {
  id: string; label: string; open: boolean; onToggle: () => void
  pinned?: boolean; children: React.ReactNode
}) {
  return (
    <section id={id} className={`card-calm scroll-mt-24 ${pinned ? 'copper-border' : ''}`}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <h3 className="heading-cinzel text-sm font-semibold text-indigo">{label}</h3>
        <span className="text-inkdim">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="border-t border-linen px-5 pb-5 pt-4">{children}</div>}
    </section>
  )
}

function BlockBody({
  blockKey, content, onCopyFramework, copied,
}: {
  blockKey: string
  content: Upsc12Content
  onCopyFramework: () => void
  copied: boolean
}) {
  switch (blockKey) {
    case 'issueStory':
    case 'coreConcept':
    case 'constitutionalLink':
    case 'dataReport':
    case 'caseStudy':
    case 'pyqLink': {
      const text = content[blockKey as keyof Upsc12Content] as string
      return text ? <Prose text={text} /> : <EmptyBlock />
    }
    case 'dimensions':
      return content.dimensions.length > 0 ? (
        <ul className="note-surface list-disc space-y-2 pl-5">
          {content.dimensions.map((d, i) => <li key={i}>{d}</li>)}
        </ul>
      ) : <EmptyBlock />
    case 'argumentsFor':
    case 'argumentsAgainst': {
      const items = content[blockKey]
      return items.length > 0 ? (
        <ul className="note-surface list-disc space-y-2 pl-5">
          {items.map((a, i) => <li key={i}>{a}</li>)}
        </ul>
      ) : <EmptyBlock />
    }
    case 'answerFramework':
      return (
        <div className="note-surface space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onCopyFramework}
              className="rounded border border-copper/30 px-3 py-1 text-xs text-copper transition-calm hover:bg-copper/5"
            >
              {copied ? 'Copied' : 'Copy framework'}
            </button>
          </div>
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-copper">Intro</p>
            <p className="leading-relaxed">{content.answerFramework.intro || '—'}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-copper">Body</p>
            <ol className="list-decimal space-y-2 pl-5">
              {content.answerFramework.body.map((p, i) => <li key={i}>{p}</li>)}
            </ol>
          </div>
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-copper">Conclusion</p>
            <p className="leading-relaxed">{content.answerFramework.conclusion || '—'}</p>
          </div>
        </div>
      )
    case 'mainsExamples':
      return content.mainsExamples.length > 0 ? (
        <ul className="note-surface list-disc space-y-2 pl-5">
          {content.mainsExamples.map((m, i) => <li key={i}>{m}</li>)}
        </ul>
      ) : <EmptyBlock />
    case 'prelimsFacts':
      return content.prelimsFacts.length > 0 ? (
        <div className="rounded-lg border border-sage/30 bg-parchment p-4">
          <ul className="note-surface space-y-2">
            {content.prelimsFacts.map((f, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-mono text-xs text-sage">{i + 1}.</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : <EmptyBlock />
    case 'revisionBox':
      return content.revisionBox.length > 0 ? (
        <div className="space-y-3">
          {content.revisionBox.map((card, i) => (
            <RevisionCard key={i} prompt={card.prompt} answer={card.answer} />
          ))}
        </div>
      ) : <EmptyBlock />
    default:
      return <EmptyBlock />
  }
}

function Prose({ text }: { text: string }) {
  return <p className="note-surface whitespace-pre-line">{text}</p>
}

function EmptyBlock({ text = 'Not yet written for this note.' }: { text?: string }) {
  return <p className="text-sm text-inkdim">{text}</p>
}

function RevisionCard({ prompt, answer }: { prompt: string; answer: string }) {
  const [revealed, setRevealed] = useState(false)
  return (
    <div className="rounded-lg border border-linen bg-ivory p-4">
      <p className="note-surface text-sm font-medium text-slate900">{prompt}</p>
      {revealed ? (
        <p className="note-surface mt-3 border-t border-linen pt-3 text-sm text-sage">{answer || '—'}</p>
      ) : (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="mt-3 text-xs text-copper hover:underline"
        >
          Reveal answer
        </button>
      )}
    </div>
  )
}

function RevisionFooter({
  revCount, revised, showConf, confidence, pending,
  onShowConf, onConfidence, onRevise,
}: {
  revCount: number; revised: boolean; showConf: boolean
  confidence: NoteConfidence; pending: boolean
  onShowConf: () => void; onConfidence: (c: NoteConfidence) => void
  onRevise: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-3 pt-4">
      {revCount > 0 && (
        <p className="text-xs text-inkdim">
          Revised {revCount} time{revCount !== 1 ? 's' : ''}{revised && ' — sealed in memory'}
        </p>
      )}
      {showConf ? (
        <div className="w-full max-w-sm space-y-2">
          <p className="text-center text-xs text-inkdim">How well do you know this?</p>
          <div className="flex gap-2">
            {(['Low', 'Medium', 'High'] as NoteConfidence[]).map(c => (
              <button
                key={c}
                type="button"
                onClick={() => onConfidence(c)}
                className={`flex-1 rounded-lg border py-2 text-xs font-medium transition-calm ${
                  confidence === c ? CONFIDENCE_LABELS[c].color : 'border-linen text-inkdim'
                }`}
              >
                <div>{CONFIDENCE_LABELS[c].label}</div>
                <div className="opacity-70">{CONFIDENCE_LABELS[c].desc}</div>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onRevise}
            disabled={pending}
            className="w-full rounded-lg border border-sage/40 bg-sage/5 py-2.5 text-sm font-medium text-sage transition-calm hover:bg-sage/10 disabled:opacity-50"
          >
            {pending ? 'Saving…' : `Mark as revised (${confidence})`}
          </button>
        </div>
      ) : revised ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-sage">Revised</span>
          <button type="button" onClick={onShowConf} className="text-xs text-inkdim hover:text-copper">
            Revise again
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onShowConf}
          className="rounded-lg border border-sage/40 bg-sage/5 px-6 py-2.5 text-sm font-medium text-sage transition-calm hover:bg-sage/10"
        >
          Mark as revised
        </button>
      )}
    </div>
  )
}

/** Wrapper used by slug page — resolves content from DB row. */
export function NoteViewerFromRow(props: {
  note: SmartNote
  isRevised: boolean
  revisionCount: number
  revisionMode?: boolean
  initialAnchor?: string
}) {
  const content = resolveNoteContent(props.note)
  return <Upsc12NoteViewer {...props} content={content} />
}
