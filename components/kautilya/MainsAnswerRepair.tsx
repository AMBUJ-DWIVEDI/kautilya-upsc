'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import HoldToSealButton from './HoldToSealButton'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { createKautilyaMotion } from '@/lib/kautilya/motion'
import { kautilyaToasts } from '@/lib/kautilya/toast'
import { trackEvent } from '@/lib/kautilya/events'
import { cn } from '@/lib/utils'

export interface AnswerRepairData {
  weakness: string
  missingDimension: string
  modelFramework: string[]
  rewriteCommand: string
  feedback: string
}

interface MainsAnswerRepairProps {
  data: AnswerRepairData
  className?: string
  onSubmit?: () => void
}

const LAYERS = ['weakness', 'missing', 'framework', 'command', 'feedback'] as const

export default function MainsAnswerRepair({
  data,
  className,
  onSubmit,
}: MainsAnswerRepairProps) {
  const reduced = useReducedMotion()
  const presets = createKautilyaMotion(reduced)
  const [visible, setVisible] = useState(() => (reduced ? LAYERS.length : 0))
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    trackEvent('kautilya_answer_repair_started')
  }, [])

  useEffect(() => {
    if (reduced) return
    const timers = LAYERS.map((_, i) =>
      setTimeout(() => setVisible(i + 1), 300 + i * 450),
    )
    return () => timers.forEach(clearTimeout)
  }, [reduced])

  function handleSubmit() {
    setSubmitted(true)
    kautilyaToasts.answerRewriteLogged()
    kautilyaToasts.architectureUpdated()
    onSubmit?.()
  }

  return (
    <section
      id="answer-repair"
      className={cn('card-calm overflow-hidden', className)}
    >
      <div className="border-b border-linen px-5 py-4 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.26em] text-copper">
          Mains Answer Repair
        </p>
        <p className="mt-1 text-sm text-inkdim">
          Knowledge is present. Architecture is missing.
        </p>
      </div>

      <motion.div
        variants={presets.longWarReport}
        initial="hidden"
        animate="show"
        className="space-y-4 p-5 sm:p-6"
      >
        {visible >= 1 && (
          <Layer title="Answer weakness">
            <p className="text-sm leading-7 text-slate900">{data.weakness}</p>
          </Layer>
        )}

        {visible >= 2 && (
          <Layer title="Missing dimension" highlight>
            <p className="text-sm font-semibold leading-7 text-clay">{data.missingDimension}</p>
          </Layer>
        )}

        {visible >= 3 && (
          <Layer title="Model framework">
            <ul className="list-decimal space-y-2 pl-5 text-sm leading-7 text-inkdim">
              {data.modelFramework.map(line => <li key={line}>{line}</li>)}
            </ul>
          </Layer>
        )}

        {visible >= 4 && (
          <Layer title="Rewrite command">
            <p className="note-surface text-sm font-semibold leading-7 text-indigo">
              {data.rewriteCommand}
            </p>
          </Layer>
        )}

        {visible >= 5 && (
          <Layer title="Feedback">
            <p className="text-sm leading-7 text-inkdim">{data.feedback}</p>
          </Layer>
        )}

        {visible >= 5 && !submitted && (
          <HoldToSealButton
            onComplete={handleSubmit}
            idleLabel="Hold to Log Rewrite"
            holdingLabel="Settling architecture"
            completeLabel="Architecture updated"
          />
        )}

        {submitted && (
          <motion.p
            variants={presets.sealComplete}
            initial="initial"
            animate="animate"
            className="text-center text-sm font-bold text-sage"
          >
            Architecture updated.
          </motion.p>
        )}
      </motion.div>
    </section>
  )
}

function Layer({
  title,
  children,
  highlight,
}: {
  title: string
  children: React.ReactNode
  highlight?: boolean
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 },
      }}
      className={cn(
        'rounded-xl border border-linen bg-parchment/60 p-4',
        highlight && 'border-clay/35 bg-clay/5',
      )}
    >
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-copper">{title}</p>
      <div className="mt-2">{children}</div>
    </motion.div>
  )
}
