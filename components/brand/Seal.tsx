'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export type SealVariant = 'pending' | 'stamped' | 'ceremonial'

interface SealProps {
  variant?: SealVariant
  /** Pixel size of the seal. Default 64. */
  size?: number
  className?: string
  /** Optional single word/short label engraved under the mudra (Cinzel). */
  label?: string
}

/**
 * THE SEAL — KAUTILYA's signature motif.
 * A circular mudra/stamp. `pending` is a faint engraving awaiting ink;
 * `stamped` is pressed copper; `ceremonial` animates the stamping in slowly
 * (paper-and-ink, 500ms ease — never urgent).
 */
export default function Seal({ variant = 'pending', size = 64, className, label }: SealProps) {
  const stamped = variant !== 'pending'
  const ink = stamped ? '#B0763B' : '#C9C2B4'

  const mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      className="block"
    >
      {/* Outer ring */}
      <circle cx="50" cy="50" r="46" stroke={ink} strokeWidth={stamped ? 3 : 1.5} />
      {/* Inner ring with notches — a chakra rim */}
      <circle cx="50" cy="50" r="38" stroke={ink} strokeWidth="1" strokeDasharray="3 5" />
      {/* Mudra: a stylized lotus-throne triangle over a bar (judgement over knowledge) */}
      <path
        d="M50 26 L66 56 H34 Z"
        stroke={ink}
        strokeWidth={stamped ? 2.5 : 1.5}
        strokeLinejoin="round"
        fill={stamped ? 'rgba(176,118,59,0.12)' : 'none'}
      />
      <line x1="32" y1="64" x2="68" y2="64" stroke={ink} strokeWidth={stamped ? 2.5 : 1.5} strokeLinecap="round" />
      <line x1="38" y1="71" x2="62" y2="71" stroke={ink} strokeWidth={stamped ? 2 : 1.2} strokeLinecap="round" />
      {/* Center dot — the bindu */}
      <circle cx="50" cy="46" r="3" fill={stamped ? ink : 'none'} stroke={ink} strokeWidth="1" />
    </svg>
  )

  if (variant === 'ceremonial') {
    return (
      <div className={cn('inline-flex flex-col items-center gap-2', className)}>
        <motion.div
          initial={{ scale: 1.6, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {mark}
        </motion.div>
        {label && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            className="heading-cinzel text-xs uppercase tracking-[0.3em] text-copper"
          >
            {label}
          </motion.span>
        )}
      </div>
    )
  }

  return (
    <div className={cn('inline-flex flex-col items-center gap-2', className)}>
      {mark}
      {label && (
        <span
          className={cn(
            'heading-cinzel text-xs uppercase tracking-[0.3em]',
            stamped ? 'text-copper' : 'text-inkdim/60',
          )}
        >
          {label}
        </span>
      )}
    </div>
  )
}
