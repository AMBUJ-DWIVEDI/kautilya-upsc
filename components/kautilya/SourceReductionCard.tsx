'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { createKautilyaMotion } from '@/lib/kautilya/motion'
import { kautilyaToasts } from '@/lib/kautilya/toast'
import { trackEvent } from '@/lib/kautilya/events'
import { cn } from '@/lib/utils'
import type { Source, SourceRole } from '@/types/kautilya'

export type { SourceRole }

/** @deprecated Use Source from @/types/kautilya */
export type SourceItem = Source

const ROLE_STYLES: Record<SourceRole, { label: string; className: string }> = {
  final: { label: 'Final', className: 'border-sage/40 bg-sage/10 text-sage' },
  secondary: { label: 'Secondary', className: 'border-copper/40 bg-copper/10 text-copper' },
  parked: { label: 'Parked', className: 'border-inkdim/20 bg-inkdim/5 text-inkdim' },
  dead: { label: 'Dead', className: 'border-clay/30 bg-clay/5 text-clay' },
}

interface SourceReductionCardProps {
  source: Source
  onRoleChange?: (id: string, role: SourceRole) => void
}

export default function SourceReductionCard({ source, onRoleChange }: SourceReductionCardProps) {
  const [role, setRole] = useState(source.role)
  const [archived, setArchived] = useState(false)
  const reduced = useReducedMotion()
  const presets = createKautilyaMotion(reduced)

  function handleRole(next: SourceRole) {
    setRole(next)
    onRoleChange?.(source.id, next)

    if (next === 'parked' || next === 'dead') {
      kautilyaToasts.sourceParked()
      kautilyaToasts.expansionReduced()
      trackEvent('kautilya_source_parked', { source: source.name, role: next })
      setTimeout(() => setArchived(true), reduced ? 0 : 380)
    }
  }

  const style = ROLE_STYLES[role]

  return (
    <AnimatePresence mode="popLayout">
      {!archived && (
        <motion.article
          layout
          variants={presets.paperCard}
          initial="initial"
          animate="animate"
          exit="exit"
          className={cn(
            'card-calm border p-4 sm:p-5',
            (role === 'parked' || role === 'dead') && 'opacity-60',
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-base font-bold text-slate900">{source.name}</p>
              <span
                className={cn(
                  'mt-2 inline-flex rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                  style.className,
                )}
              >
                {style.label}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(ROLE_STYLES) as SourceRole[]).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRole(r)}
                  className={cn(
                    'rounded border px-2 py-1 text-[10px] font-bold uppercase tracking-wide transition-calm',
                    role === r
                      ? ROLE_STYLES[r].className
                      : 'border-linen text-inkdim hover:border-copper/40',
                  )}
                >
                  {ROLE_STYLES[r].label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-copper">Reason</p>
              <p className="mt-1 text-sm leading-6 text-inkdim">{source.reason}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-copper">Action</p>
              <p className="mt-1 text-sm leading-6 text-inkdim">{source.action}</p>
            </div>
          </div>
        </motion.article>
      )}
    </AnimatePresence>
  )
}
