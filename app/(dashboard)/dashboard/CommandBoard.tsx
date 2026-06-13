'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import Seal from '@/components/brand/Seal'
import { VOICE } from '@/lib/voice'
import { track } from '@/lib/analytics'
import { cn } from '@/lib/utils'
import type { CommandThread, DailyCommandRow, MainsPrompt } from '@/lib/command/types'

interface Props {
  initialCommand: DailyCommandRow
}

export default function CommandBoard({ initialCommand }: Props) {
  const [command, setCommand] = useState<DailyCommandRow>(initialCommand)
  const [busyThread, setBusyThread] = useState<string | null>(null)
  const [openMains, setOpenMains] = useState(false)

  const threads = command.threads as CommandThread[]
  const completed = new Set(command.completed ?? [])

  async function completeThread(threadId: string) {
    if (busyThread || completed.has(threadId)) return
    setBusyThread(threadId)
    track('command_thread_completed', { thread_id: threadId })
    try {
      const res = await fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thread_id: threadId }),
      })
      const data = await res.json() as { command?: DailyCommandRow }
      if (data.command) setCommand(data.command)
    } catch {
      // The next click retries; no error theatre.
    } finally {
      setBusyThread(null)
    }
  }

  return (
    <section className="card-calm overflow-hidden">
      <div className="border-b border-linen px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-copper">
              {command.is_reentry ? 'Re-entry Command' : "Today's Command"}
            </p>
            {command.is_reentry && !command.sealed && (
              <p className="mt-2 text-sm leading-6 text-inkdim">
                {VOICE.reentry.headline} {VOICE.reentry.body}
              </p>
            )}
          </div>
          <Seal variant={command.sealed ? 'stamped' : 'pending'} size={48} />
        </div>
      </div>

      <div className="divide-y divide-linen">
        {threads.map((thread, i) => {
          const done = completed.has(thread.id)
          const isMains = thread.type === 'mains_answer'
          const mains: MainsPrompt | null = isMains && thread.detail ? JSON.parse(thread.detail) : null

          return (
            <div key={thread.id} className={cn('px-5 py-4 sm:px-6', thread.locked && 'opacity-50')}>
              <div className="flex items-start gap-4">
                <button
                  onClick={() => !thread.locked && completeThread(thread.id)}
                  disabled={thread.locked || done || busyThread === thread.id}
                  aria-label={done ? 'Mission sealed' : `Seal "${thread.title}"`}
                  className={cn(
                    'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-calm',
                    done
                      ? 'border-sage bg-sage text-ivory'
                      : thread.locked
                      ? 'cursor-not-allowed border-linen'
                      : 'border-inkdim/40 hover:border-copper',
                  )}
                >
                  {done && <span className="text-xs leading-none">✓</span>}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className={cn('text-sm font-semibold', done ? 'text-inkdim line-through decoration-sage/60' : 'text-slate900')}>
                      {i + 1}. {thread.title}
                    </p>
                    <span className="text-xs font-bold uppercase tracking-wide text-copper">{thread.target}</span>
                  </div>

                  {!thread.locked && thread.href && !done && (
                    <Link href={thread.href} className="mt-1 inline-block text-xs font-semibold text-copper hover:text-copperlight">
                      Open mission -&gt;
                    </Link>
                  )}

                  {mains && !done && (
                    <div className="mt-2">
                      <button
                        onClick={() => setOpenMains(v => !v)}
                        className="text-xs font-semibold text-copper hover:text-copperlight"
                      >
                        {openMains ? 'Fold the answer mission' : 'Open question, framework & rubric'}
                      </button>
                      <AnimatePresence>
                        {openMains && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className="overflow-hidden"
                          >
                            <div className="note-surface mt-3 rounded-lg border border-linen bg-parchment p-4 text-[15px]">
                              <p className="font-semibold text-slate900">{mains.question}</p>
                              <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-copper">Framework</p>
                              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-inkdim">
                                {mains.framework.map(line => <li key={line}>{line}</li>)}
                              </ul>
                              <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-copper">Self-audit rubric</p>
                              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-inkdim">
                                {mains.rubric.map(line => <li key={line}>{line}</li>)}
                              </ul>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <AnimatePresence>
        {command.sealed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex flex-col items-center gap-3 border-t border-linen bg-parchment px-6 py-8 text-center"
          >
            <Seal variant="ceremonial" size={72} label="Sealed" />
            {command.insight && (
              <p className="note-surface max-w-sm text-sm text-slate900">{command.insight}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
