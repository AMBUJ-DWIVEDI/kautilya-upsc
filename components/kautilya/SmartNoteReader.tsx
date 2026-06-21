'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { SmartNote, Upsc12Content } from '@/lib/notes/types'
import MindMapRenderer from '@/components/notes/MindMapRenderer'
import HoldToSealButton from './HoldToSealButton'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { createKautilyaMotion } from '@/lib/kautilya/motion'
import { kautilyaToasts } from '@/lib/kautilya/toast'
import { trackEvent } from '@/lib/kautilya/events'
import { cn } from '@/lib/utils'

interface SmartNoteReaderProps {
  note: SmartNote
  content: Upsc12Content
  onRepaired?: () => void
}

interface SectionDef {
  id: string
  title: string
  render: () => React.ReactNode
  variant?: 'margin' | 'trap' | 'default'
}

export default function SmartNoteReader({ note, content, onRepaired }: SmartNoteReaderProps) {
  const reduced = useReducedMotion()
  const presets = createKautilyaMotion(reduced)
  const [activeSection, setActiveSection] = useState(0)
  const [repaired, setRepaired] = useState(false)

  const sections: SectionDef[] = [
    {
      id: 'narrative',
      title: 'Narrative Core',
      render: () => (
        <p className="note-surface text-[17px] leading-[1.75] text-slate900">{content.issueStory}</p>
      ),
    },
    {
      id: 'anatomy',
      title: 'Anatomy',
      render: () => (
        <div className="space-y-4 note-surface text-sm leading-7 text-slate900">
          <p>{content.coreConcept}</p>
          {content.dimensions.length > 0 && (
            <ul className="list-disc space-y-1 pl-5 text-inkdim">
              {content.dimensions.map(d => <li key={d}>{d}</li>)}
            </ul>
          )}
        </div>
      ),
    },
    {
      id: 'mnemonic',
      title: 'Mnemonic',
      render: () => (
        <p className="rounded-lg border border-copper/25 bg-copper/5 px-4 py-3 font-mono text-sm text-indigo">
          {note.mnemonic || 'Anchor phrase will appear after full generation.'}
        </p>
      ),
    },
    {
      id: 'mindmap',
      title: 'Mind Map',
      render: () =>
        note.mindmap_json ? (
          <MindMapRenderer data={note.mindmap_json} />
        ) : (
          <p className="text-sm text-inkdim">Mind map stabilizing from issue anatomy.</p>
        ),
    },
    {
      id: 'pyq',
      title: 'PYQ Traps',
      variant: 'trap',
      render: () => (
        <div className="rounded-lg border border-clay/25 bg-clay/5 p-4 note-surface text-sm leading-7 text-slate900">
          {content.pyqLink || 'PYQ trap linkage pending.'}
        </div>
      ),
    },
    {
      id: 'mains',
      title: 'Mains / Essay Hooks',
      variant: 'margin',
      render: () => (
        <div className="space-y-3">
          <div className="rounded-r-lg border-l-2 border-copper bg-parchment/80 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-copper">Framework</p>
            <p className="note-surface mt-2 text-sm">{content.answerFramework.intro}</p>
          </div>
          {content.mainsExamples.map(h => (
            <p key={h} className="note-surface border-l border-linen pl-3 text-sm italic text-inkdim">
              {h}
            </p>
          ))}
        </div>
      ),
    },
    {
      id: 'recall',
      title: 'Active Recall',
      render: () => (
        <div className="space-y-3">
          {content.revisionBox.length > 0 ? (
            content.revisionBox.map((card, i) => (
              <div key={i} className="rounded-lg border border-linen bg-ivory p-4">
                <p className="text-sm font-semibold text-indigo">{card.prompt}</p>
                <p className="mt-2 text-sm text-inkdim">{card.answer}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-inkdim">Recall cards will populate after revision pass.</p>
          )}
        </div>
      ),
    },
  ]

  const progress = ((activeSection + 1) / sections.length) * 100

  function handleRepaired() {
    setRepaired(true)
    kautilyaToasts.smartNoteRepaired()
    trackEvent('kautilya_smart_note_repaired', { note_id: note.id, topic: note.topic })
    onRepaired?.()
  }

  return (
    <article className="relative pb-24">
      <header className="mb-6 border-b border-linen pb-5">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-copper">
          Civil-Services Brief · {note.section}
        </p>
        <h1 className="heading-cinzel mt-2 text-2xl font-black text-indigo sm:text-3xl">
          {note.topic}
        </h1>
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-linen">
          <motion.div
            className="h-full bg-copper"
            animate={{ width: `${progress}%` }}
            transition={{ duration: reduced ? 0.01 : 0.36 }}
          />
        </div>
      </header>

      <div className="space-y-4">
        {sections.map((section, i) => (
          <motion.section
            key={section.id}
            variants={presets.smartNoteSection}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-40px' }}
            onViewportEnter={() => setActiveSection(i)}
            className={cn(
              'card-calm overflow-hidden border p-5 sm:p-6',
              section.variant === 'trap' && 'border-clay/20',
              section.variant === 'margin' && 'border-copper/25',
            )}
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-copper">
              {section.title}
            </p>
            <div className="mt-3">{section.render()}</div>
          </motion.section>
        ))}
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-linen bg-ivory/95 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-copper">Repair Mission</p>
            <p className="mt-1 text-sm text-inkdim">
              {repaired
                ? 'Integrated into long-war memory.'
                : 'Close this brief only after one active recall pass.'}
            </p>
          </div>
          {!repaired ? (
            <HoldToSealButton
              onComplete={handleRepaired}
              idleLabel="Hold to Integrate"
              holdingLabel="Stay with the brief"
              completeLabel="Integrated"
              className="sm:max-w-xs"
            />
          ) : (
            <span className="text-sm font-bold text-sage">Integrated.</span>
          )}
        </div>
      </footer>
    </article>
  )
}
