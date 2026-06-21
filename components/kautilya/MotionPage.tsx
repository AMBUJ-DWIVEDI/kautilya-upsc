'use client'

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { createKautilyaMotion } from '@/lib/kautilya/motion'
import { cn } from '@/lib/utils'

interface MotionPageProps {
  children: ReactNode
  className?: string
}

/**
 * Composed page entrance — opacity 0→1, y 12→0, ~420ms.
 * KAUTILYA is slower and more deliberate than CHANAKYA.
 */
export default function MotionPage({ children, className }: MotionPageProps) {
  const reduced = useReducedMotion()
  const presets = createKautilyaMotion(reduced)

  return (
    <motion.div
      variants={presets.page}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn('will-change-[opacity,transform]', className)}
    >
      {children}
    </motion.div>
  )
}
