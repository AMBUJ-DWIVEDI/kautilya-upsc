'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/lib/kautilya/events'

interface KautilyaErrorStateProps {
  title?: string
  body?: string
  onRetry?: () => void
  className?: string
}

export default function KautilyaErrorState({
  title = 'Signal interrupted.',
  body = 'The command surface could not load. Your diagnosis is safe — try again.',
  onRetry,
  className,
}: KautilyaErrorStateProps) {
  useEffect(() => {
    trackEvent('kautilya_data_load_failed')
  }, [])

  return (
    <div
      className={cn(
        'card-calm flex flex-col items-start gap-4 border border-dashed border-clay/40 p-6 sm:p-8',
        className,
      )}
      role="alert"
    >
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-clay">Interrupted</p>
      <h3 className="heading-cinzel text-xl font-bold text-indigo">{title}</h3>
      <p className="max-w-md text-sm leading-7 text-inkdim">{body}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 inline-flex min-h-11 items-center rounded-lg border border-copper/40 bg-ivory px-5 text-sm font-bold text-copper transition-calm hover:border-copper hover:bg-copper/5"
        >
          Retry
        </button>
      )}
    </div>
  )
}
