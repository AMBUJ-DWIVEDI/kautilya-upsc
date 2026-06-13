'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export type SealVariant = 'pending' | 'stamped' | 'ceremonial'

interface SealProps {
  variant?: SealVariant
  /** Pixel size of the mark. Default 64. */
  size?: number
  className?: string
  /** Optional single word/short label engraved under the logo (Cinzel). */
  label?: string
}

const MARK_SRC = '/kautilya-ias-mark.png'
const MARK_SIZE = 512

function KautilyaLogoMark({ variant, size }: { variant: SealVariant; size: number }) {
  const stamped = variant !== 'pending'

  return (
    <span
      className={cn(
        'block overflow-hidden rounded-full border bg-ivory shadow-paper',
        stamped ? 'border-copper/35' : 'border-linen opacity-85',
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={MARK_SRC}
        alt="KAUTILYA IAS logo mark"
        width={MARK_SIZE}
        height={MARK_SIZE}
        sizes={`${Math.ceil(size)}px`}
        loading="eager"
        unoptimized
        className="h-full w-full object-cover"
      />
    </span>
  )
}

/**
 * KAUTILYA's signature mark.
 * Uses a dedicated square emblem so small app placements stay crisp.
 */
export default function Seal({ variant = 'pending', size = 64, className, label }: SealProps) {
  const stamped = variant !== 'pending'
  const mark = <KautilyaLogoMark variant={variant} size={size} />

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
