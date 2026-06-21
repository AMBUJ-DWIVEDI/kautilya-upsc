'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { kautilyaDurations } from '@/lib/kautilya/motion'

const COPY = [
  'Mapping long-war signals...',
  'Reading resource chaos...',
  'Integrating current affairs...',
  'Preparing weekly command...',
  'Opening civil-services brief...',
  'Reading answer structure...',
] as const

interface KautilyaLoadingStateProps {
  message?: string
  rotate?: boolean
  className?: string
}

export default function KautilyaLoadingState({
  message,
  rotate = true,
  className,
}: KautilyaLoadingStateProps) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (!rotate || message) return
    const id = window.setInterval(() => {
      setIdx(i => (i + 1) % COPY.length)
    }, 3200)
    return () => window.clearInterval(id)
  }, [rotate, message])

  const text = message ?? COPY[idx]

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-5 px-6 py-16 text-center',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <motion.div
        className="h-9 w-9 rounded-full border-2 border-linen border-t-copper"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
        aria-hidden
      />
      <motion.p
        key={text}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: kautilyaDurations.normal }}
        className="max-w-xs text-sm font-medium tracking-wide text-inkdim"
      >
        {text}
      </motion.p>
    </div>
  )
}
