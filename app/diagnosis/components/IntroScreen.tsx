'use client'

import { motion } from 'framer-motion'
import Seal from '@/components/brand/Seal'
import { isPaidDepth, type DiagnosisDepth } from '@/lib/report/depth'

interface Props {
  totalCards: number
  depth: DiagnosisDepth
  name: string
  onNameChange: (value: string) => void
  onStart: () => void
}

export default function IntroScreen({ totalCards, depth, name, onNameChange, onStart }: Props) {
  const paid = isPaidDepth(depth)
  const signalLine = paid
    ? `${totalCards} contextual signals - about 11 minutes`
    : `${totalCards} contextual signals - about 8 minutes`
  const depthCopy = paid
    ? 'Warrior and Commander diagnosis uses the complete sixty-card instrument: targets, pressure, resources, identity, anchors, recovery, and operating rhythm.'
    : 'Scout uses forty high-signal cards from the complete instrument. Your free report maps every core front; Warrior and Commander add the deepest target, anchor-role, and character evidence.'

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
        The Long-War Diagnosis
      </p>

      <h1 className="heading-cinzel max-w-xl text-3xl font-bold leading-tight text-indigo sm:text-4xl">
        This is not a form.
        <br />
        <span className="text-copper-gradient">This is your map being drawn.</span>
      </h1>

      <p className="note-surface mt-5 max-w-md text-inkdim">
        Before KAUTILYA prescribes anything, it studies your preparation pattern: attempts,
        resources, pressure, recovery, Prelims nerve, Mains stamina, and identity load.
        Answer honestly. The system will not judge you.
      </p>
      <p className="mt-3 max-w-md text-sm leading-6 text-inkdim">
        {depthCopy}
      </p>

      <div className="mt-7 w-full max-w-sm text-left">
        <label htmlFor="diagnosis-name" className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-copper">
          What should KAUTILYA call you?
        </label>
        <input
          id="diagnosis-name"
          type="text"
          value={name}
          onChange={event => onNameChange(event.target.value)}
          placeholder="Your name, or what you go by"
          className="w-full rounded-lg border border-linen bg-ivory px-4 py-3.5 text-base text-slate900
                     placeholder-inkdim/60 transition-calm focus:border-copper focus:outline-none"
        />
      </div>

      <div className="my-8 grid w-full max-w-sm gap-3">
        {[
          signalLine,
          'One signal at a time. Choose the closest truth.',
          'Leave anytime. Your progress is held.',
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
        {paid ? 'Start Full Diagnosis' : 'Start Scout Diagnosis'}
      </button>

      <p className="mt-5 max-w-xs text-xs leading-5 text-inkdim">
        Your answers shape your command system. They are never shown to anyone, including you,
        as raw scores.
      </p>
    </motion.div>
  )
}
