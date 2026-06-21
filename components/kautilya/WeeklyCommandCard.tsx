'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Seal from '@/components/brand/Seal'
import HoldToSealButton from './HoldToSealButton'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { createKautilyaMotion } from '@/lib/kautilya/motion'
import { kautilyaToasts } from '@/lib/kautilya/toast'
import { trackEvent } from '@/lib/kautilya/events'
import { cn } from '@/lib/utils'
import type { WeeklyCommand } from '@/types/kautilya'

export type { WeeklyCommand }

interface WeeklyCommandCardProps {
  command: WeeklyCommand
  className?: string
  onSealed?: () => void
}

export default function WeeklyCommandCard({
  command,
  className,
  onSealed,
}: WeeklyCommandCardProps) {
  const reduced = useReducedMotion()
  const presets = createKautilyaMotion(reduced)
  const [sealed, setSealed] = useState(false)

  function handleSeal() {
    setSealed(true)
    kautilyaToasts.weeklyCommandSealed()
    trackEvent('kautilya_weekly_command_sealed')
    onSealed?.()
  }

  return (
    <section
      id="weekly-command"
      className={cn('command-dossier overflow-hidden rounded-2xl border border-linen', className)}
    >
      <div className="border-b border-linen px-5 py-4 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.26em] text-copper">
          Weekly Command
        </p>
        <p className="mt-1 text-sm text-inkdim">Long-war report · unfolds slowly</p>
      </div>

      <motion.div
        variants={presets.longWarReport}
        initial="hidden"
        animate="show"
        className="space-y-5 p-5 sm:p-6"
      >
        <ReportBlock title="Week signal" value={command.weekSignal} />
        <ReportBlock title="Primary leak" value={command.primaryLeak} accent />
        <ReportList title="Do more" items={command.doMore} />
        <ReportList title="Do less" items={command.doLess} muted />
        <ReportList title="Must integrate" items={command.mustIntegrate} />
        <ReportList title="Must write" items={command.mustWrite} />
        <ReportList title="Must revise" items={command.mustRevise} />

        <div className="border-t border-linen pt-5">
          {!sealed ? (
            <HoldToSealButton onComplete={handleSeal} />
          ) : (
            <motion.div
              variants={presets.sealComplete}
              initial="initial"
              animate="animate"
              className="flex flex-col items-center gap-3 py-2"
            >
              <Seal variant="ceremonial" size={56} label="Sealed" />
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  )
}

function ReportBlock({
  title,
  value,
  accent,
}: {
  title: string
  value: string
  accent?: boolean
}) {
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-copper">{title}</p>
      <p className={cn('mt-1 text-sm leading-7', accent ? 'font-semibold text-indigo' : 'text-slate900')}>
        {value}
      </p>
    </motion.div>
  )
}

function ReportList({
  title,
  items,
  muted,
}: {
  title: string
  items: string[]
  muted?: boolean
}) {
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-copper">{title}</p>
      <ul className={cn('mt-2 list-disc space-y-1 pl-5 text-sm leading-6', muted ? 'text-inkdim' : 'text-slate900')}>
        {items.map(item => <li key={item}>{item}</li>)}
      </ul>
    </motion.div>
  )
}
