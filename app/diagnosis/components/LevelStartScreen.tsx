'use client'

import { motion } from 'framer-motion'
import { LEVEL_NAMES, LEVEL_SUBTITLES } from '@/lib/diagnosis/cards'
import type { CardLevel } from '@/lib/diagnosis/types'

interface Props {
  level: CardLevel
  onContinue: () => void
}

export default function LevelStartScreen({ level, onContinue }: Props) {
  return (
    <motion.div
      key={`level-start-${level}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex min-h-screen flex-col items-center justify-center bg-parchment px-5 py-12 text-center"
    >
      <div className="card-calm copper-border w-full max-w-sm p-6">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-copper">
          Stage {level} of 8
        </p>
        <h2 className="heading-cinzel text-2xl font-bold text-indigo">
          {LEVEL_NAMES[level]}
        </h2>
        <p className="mt-3 text-sm leading-6 text-inkdim">
          {LEVEL_SUBTITLES[level]}
        </p>
        <button
          onClick={onContinue}
          className="mt-6 min-h-11 w-full rounded-lg bg-copper px-5 text-sm font-bold text-ivory transition-calm hover:bg-copperlight"
        >
          Map This Stage
        </button>
      </div>
    </motion.div>
  )
}
