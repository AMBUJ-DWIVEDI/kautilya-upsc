'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Seal from '@/components/brand/Seal'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { createKautilyaMotion } from '@/lib/kautilya/motion'
import { kautilyaToasts } from '@/lib/kautilya/toast'
import { cn } from '@/lib/utils'

export type RevisionStatus = 'captured' | 'linked' | 'integrated'

export interface CurrentIssue {
  id: string
  issue: string
  staticLinkage: string
  prelimsFact: string
  mainsDimension: string
  essayRelevance: string
  revisionStatus: RevisionStatus
}

interface CurrentAffairsInboxProps {
  issues?: CurrentIssue[]
  onIntegrate?: (id: string) => void
  className?: string
}

const STATUS_LABEL: Record<RevisionStatus, string> = {
  captured: 'Captured',
  linked: 'Static linked',
  integrated: 'Integrated',
}

export default function CurrentAffairsInbox({
  issues: initial = [],
  onIntegrate,
  className,
}: CurrentAffairsInboxProps) {
  const [issues, setIssues] = useState(initial)
  const [openId, setOpenId] = useState<string | null>(null)
  const reduced = useReducedMotion()
  const presets = createKautilyaMotion(reduced)

  function integrate(id: string) {
    setIssues(prev =>
      prev.map(i => (i.id === id ? { ...i, revisionStatus: 'integrated' as const } : i)),
    )
    kautilyaToasts.currentIssueIntegrated()
    onIntegrate?.(id)
  }

  return (
    <section id="current-affairs" className={cn('card-calm overflow-hidden', className)}>
      <div className="border-b border-linen px-5 py-4 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.26em] text-copper">
          Current Affairs Inbox
        </p>
        <p className="mt-1 text-sm text-inkdim">
          Do not collect current affairs. Integrate it.
        </p>
      </div>

      <div className="divide-y divide-linen">
        {issues.length === 0 ? (
          <p className="px-5 py-8 text-sm text-inkdim sm:px-6">
            No issues captured. Link each headline to static ground before it decays.
          </p>
        ) : (
          issues.map(issue => {
            const open = openId === issue.id
            const integrated = issue.revisionStatus === 'integrated'

            return (
              <div key={issue.id} className="px-5 py-4 sm:px-6">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : issue.id)}
                  className="flex w-full items-start justify-between gap-4 text-left"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate900">{issue.issue}</p>
                    <p className="mt-1 text-xs text-inkdim">{STATUS_LABEL[issue.revisionStatus]}</p>
                  </div>
                  {integrated && <Seal variant="stamped" size={28} />}
                </button>

                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: reduced ? 0.01 : 0.36, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="relative mt-4 space-y-3 border-l-2 border-copper/30 pl-4">
                        <Field label="Static linkage" value={issue.staticLinkage} />
                        <Field label="Prelims fact" value={issue.prelimsFact} />
                        <Field label="Mains dimension" value={issue.mainsDimension} />
                        <Field label="Essay / interview" value={issue.essayRelevance} />
                      </div>

                      {!integrated && (
                        <motion.button
                          variants={presets.sealComplete}
                          initial="initial"
                          animate="animate"
                          type="button"
                          onClick={() => integrate(issue.id)}
                          className="mt-4 text-sm font-bold text-copper hover:text-copperlight"
                        >
                          Mark integrated →
                        </motion.button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-copper">{label}</p>
      <p className="mt-1 text-sm leading-6 text-inkdim">{value}</p>
    </div>
  )
}
