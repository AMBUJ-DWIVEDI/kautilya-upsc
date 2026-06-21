'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { kautilyaDurations } from '@/lib/kautilya/motion'

const HOLD_MS = 1400

type SealState = 'idle' | 'holding' | 'complete'

interface HoldToSealButtonProps {
  onComplete: () => void
  idleLabel?: string
  holdingLabel?: string
  completeLabel?: string
  disabled?: boolean
  className?: string
}

export default function HoldToSealButton({
  onComplete,
  idleLabel = 'Hold to Seal',
  holdingLabel = 'Stay with the command',
  completeLabel = 'Sealed',
  disabled = false,
  className,
}: HoldToSealButtonProps) {
  const [state, setState] = useState<SealState>('idle')
  const [progress, setProgress] = useState(0)
  const frameRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const cancel = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current)
    frameRef.current = null
    startRef.current = null
    setProgress(0)
    setState('idle')
  }, [])

  const handlePointerDown = () => {
    if (disabled || state === 'complete') return
    setState('holding')
    startRef.current = null

    const tick = (now: number) => {
      if (!startRef.current) startRef.current = now
      const elapsed = now - startRef.current
      const pct = Math.min(elapsed / HOLD_MS, 1)
      setProgress(pct)

      if (pct >= 1) {
        setState('complete')
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(12)
        }
        onCompleteRef.current()
        return
      }
      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
  }

  const handlePointerUp = () => {
    if (state === 'complete') return
    cancel()
  }

  const label =
    state === 'complete' ? completeLabel
      : state === 'holding' ? holdingLabel
      : idleLabel

  return (
    <button
      type="button"
      disabled={disabled || state === 'complete'}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={cn(
        'relative min-h-12 w-full overflow-hidden rounded-lg border border-copper/40 bg-ivory px-6 py-3',
        'text-sm font-bold text-indigo transition-calm',
        'disabled:cursor-default disabled:opacity-90',
        state === 'complete' && 'border-sage/50 text-sage',
        className,
      )}
    >
      <motion.span
        className="absolute inset-y-0 left-0 bg-copper/20"
        initial={{ width: '0%' }}
        animate={{ width: `${progress * 100}%` }}
        transition={{ duration: kautilyaDurations.fast, ease: 'linear' }}
      />
      <span className="relative z-10">{label}</span>
    </button>
  )
}
