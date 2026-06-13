'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Seal from '@/components/brand/Seal'

const STEPS = [
  'Reading your preparation pattern...',
  'Mapping your pressure points...',
  'Detecting resource chaos...',
  'Identifying your stage pattern...',
  'Building your command profile...',
  'The Seal is ready.',
]

interface Props {
  onComplete: () => void
}

export default function GeneratingScreen({ onComplete }: Props) {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    if (stepIndex < STEPS.length - 1) {
      const t = setTimeout(() => setStepIndex(i => i + 1), 1100)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(onComplete, 1600)
      return () => clearTimeout(t)
    }
  }, [stepIndex, onComplete])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-parchment px-6 py-12 text-center">
      <motion.div
        initial={{ opacity: 0.4 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.4, ease: 'easeOut' }}
        className="mb-10"
      >
        <Seal variant="pending" size={80} />
      </motion.div>

      <h1 className="heading-cinzel mb-8 text-2xl font-bold text-indigo">
        KAUTILYA is building your command profile...
      </h1>

      <div className="flex w-full max-w-xs flex-col gap-3 text-left">
        {STEPS.map((step, i) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -10 }}
            animate={i <= stepIndex ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.45 }}
            className="flex items-center gap-3"
          >
            <span
              className={`mt-0.5 font-mono text-xs ${
                i < stepIndex ? 'text-sage' : i === stepIndex ? 'text-copper' : 'text-inkdim/40'
              }`}
            >
              {i < stepIndex ? 'OK' : i === stepIndex ? '>' : 'o'}
            </span>
            <span
              className={`text-sm ${
                i < stepIndex ? 'text-inkdim' : i === stepIndex ? 'font-medium text-slate900' : 'text-inkdim/40'
              }`}
            >
              {step}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
