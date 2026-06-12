'use client'

import { motion } from 'framer-motion'
import Seal from '@/components/brand/Seal'

interface Props {
  totalCards: number
  onStart: () => void
}

export default function IntroScreen({ totalCards, onStart }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="flex min-h-screen flex-col items-center justify-center bg-parchment px-5 py-12 text-center"
    >
      <Seal variant="pending" size={56} className="mb-6" />

      <p className="mb-5 text-xs font-bold uppercase tracking-[0.28em] text-copper">
        The Diagnosis
      </p>

      <h1 className="heading-cinzel max-w-xl text-3xl font-bold leading-tight text-indigo sm:text-4xl">
        This is not a form.
        <br />
        <span className="text-copper-gradient">This is your map being drawn.</span>
      </h1>

      <p className="note-surface mt-5 max-w-md text-inkdim">
        Fifty-two cards across eight levels: where the war has taken you, why you are in it,
        what your days actually look like, and what pressure does to your judgement.
        Nothing is graded. Everything is read.
      </p>

      <div className="my-8 grid w-full max-w-sm gap-3">
        {[
          `${totalCards} cards · about 9 minutes`,
          'One card at a time. No right answers.',
          'Leave anytime — your progress is held.',
        ].map(item => (
          <div key={item} className="card-calm px-4 py-3 text-sm text-inkdim">
            {item}
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        className="min-h-12 rounded-lg bg-copper px-9 text-sm font-bold tracking-widest text-ivory transition-calm hover:bg-copperlight"
      >
        Begin
      </button>

      <p className="mt-5 max-w-xs text-xs leading-5 text-inkdim">
        Your answers shape your command system. They are never shown to anyone, including you,
        as raw scores.
      </p>
    </motion.div>
  )
}
