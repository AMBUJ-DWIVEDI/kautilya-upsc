'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Seal from '@/components/brand/Seal'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { createKautilyaMotion } from '@/lib/kautilya/motion'
import { ARCHETYPES } from '@/lib/diagnosis/archetypes'
import type { ArchetypeId, StagePattern } from '@/lib/diagnosis/types'
import { cn } from '@/lib/utils'

const STAGE_LABELS: Record<StagePattern, string> = {
  FRESH: 'Fresh Entry',
  PRELIMS_WALL: 'Prelims Wall',
  MAINS_PLATEAU: 'Mains Plateau',
  INTERVIEW_EDGE: 'Interview Edge',
  CLEARED_LOWER: 'Cleared Lower',
  RETURNING: 'Returning',
}

const LEAK_LABELS: Record<string, string> = {
  resource_chaos: 'Resource chaos',
  prelims_nerve: 'Prelims nerve',
  mains_stamina: 'Mains stamina',
  execution_friction: 'Execution friction',
  identity_fusion: 'Identity fusion',
}

interface LongWarDiagnosisRevealProps {
  stage: StagePattern
  primaryLeak: string
  archetype: ArchetypeId
  weeklyCommand: string
  truth?: string
  className?: string
  onComplete?: () => void
}

const STEPS = 5

export default function LongWarDiagnosisReveal({
  stage,
  primaryLeak,
  archetype,
  weeklyCommand,
  truth = 'Your preparation is not weak because of lack of material. It is weak because nothing is final.',
  className,
  onComplete,
}: LongWarDiagnosisRevealProps) {
  const reduced = useReducedMotion()
  const presets = createKautilyaMotion(reduced)
  const [step, setStep] = useState(() => (reduced ? STEPS : 0))
  const meta = ARCHETYPES[archetype]

  useEffect(() => {
    if (reduced) {
      onComplete?.()
      return
    }
    const timers = [
      setTimeout(() => setStep(1), 400),
      setTimeout(() => setStep(2), 1100),
      setTimeout(() => setStep(3), 1900),
      setTimeout(() => setStep(4), 2700),
      setTimeout(() => {
        setStep(5)
        onComplete?.()
      }, 3600),
    ]
    return () => timers.forEach(clearTimeout)
  }, [reduced, onComplete])

  const leakLabel = LEAK_LABELS[primaryLeak] ?? primaryLeak.replace(/_/g, ' ')

  return (
    <section
      className={cn(
        'command-dossier rounded-2xl border border-linen px-6 py-10 text-center sm:px-10',
        className,
      )}
    >
      <motion.div variants={presets.longWarReport} initial="hidden" animate="show">
        {step >= 0 && (
          <motion.p
            variants={presets.longWarReportItem}
            className="text-xs font-bold uppercase tracking-[0.3em] text-inkdim"
          >
            Long-war pattern detected.
          </motion.p>
        )}

        {step >= 1 && (
          <motion.p
            variants={presets.longWarReportItem}
            className="heading-cinzel mt-6 text-2xl font-bold text-indigo sm:text-3xl"
          >
            Stage: {STAGE_LABELS[stage]}.
          </motion.p>
        )}

        {step >= 2 && (
          <motion.p
            variants={presets.longWarReportItem}
            className="mt-4 text-lg font-semibold text-copper"
          >
            Primary leak: {leakLabel}.
          </motion.p>
        )}

        {step >= 3 && (
          <motion.div variants={presets.longWarReportItem} className="mt-6">
            <p className="heading-cinzel text-xl font-black text-indigo sm:text-2xl">
              You are a {meta.name.replace(/^The /, '')}.
            </p>
            <p className="note-surface mx-auto mt-4 max-w-lg text-sm leading-7 text-slate900">
              {truth}
            </p>
          </motion.div>
        )}

        {step >= 4 && (
          <motion.div
            variants={presets.longWarReportItem}
            className="mt-8 rounded-xl border border-copper/30 bg-ivory px-5 py-5"
          >
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-copper">
              This week&apos;s command
            </p>
            <p className="note-surface mt-2 text-base font-semibold text-slate900">
              {weeklyCommand}
            </p>
          </motion.div>
        )}

        {step >= 5 && (
          <motion.div variants={presets.sealComplete} className="mt-8 flex justify-center">
            <Seal variant="ceremonial" size={64} label="Diagnosed" />
          </motion.div>
        )}
      </motion.div>
    </section>
  )
}
