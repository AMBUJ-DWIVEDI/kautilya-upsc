'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

export type KautilyaEmptyVariant =
  | 'no-resource-map'
  | 'no-answer'
  | 'no-current-issue'
  | 'custom'

const PRESETS: Record<
  Exclude<KautilyaEmptyVariant, 'custom'>,
  { title: string; body: string; cta: string; href: string }
> = {
  'no-resource-map': {
    title: 'No resource map yet — name your sources.',
    body: 'Your sources cannot be integrated until they are named.',
    cta: 'Begin Resource Audit',
    href: '/dashboard#resource-map',
  },
  'no-answer': {
    title: 'No answer submitted yet.',
    body: 'KAUTILYA cannot repair answer structure without seeing one.',
    cta: 'Submit One Answer',
    href: '/dashboard#answer-repair',
  },
  'no-current-issue': {
    title: 'No issue captured yet.',
    body: 'Current affairs becomes useful only when linked to static ground.',
    cta: 'Add Current Issue',
    href: '/dashboard#current-affairs',
  },
}

interface KautilyaEmptyStateProps {
  variant?: KautilyaEmptyVariant
  title?: string
  body?: string
  ctaLabel?: string
  ctaHref?: string
  onCta?: () => void
  className?: string
}

export default function KautilyaEmptyState({
  variant = 'custom',
  title,
  body,
  ctaLabel,
  ctaHref,
  onCta,
  className,
}: KautilyaEmptyStateProps) {
  const preset = variant !== 'custom' ? PRESETS[variant] : null
  const resolvedTitle = title ?? preset?.title ?? 'Nothing here yet.'
  const resolvedBody = body ?? preset?.body ?? ''
  const resolvedCta = ctaLabel ?? preset?.cta
  const resolvedHref = ctaHref ?? preset?.href

  return (
    <div
      className={cn(
        'card-calm flex flex-col items-start gap-4 border border-dashed border-linen p-6 sm:p-8',
        className,
      )}
    >
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-copper">Awaiting signal</p>
      <h3 className="heading-cinzel text-xl font-bold text-indigo">{resolvedTitle}</h3>
      {resolvedBody && (
        <p className="max-w-md text-sm leading-7 text-inkdim">{resolvedBody}</p>
      )}
      {resolvedCta && resolvedHref && !onCta && (
        <Link
          href={resolvedHref}
          className="mt-1 inline-flex min-h-11 items-center rounded-lg bg-copper px-5 text-sm font-bold text-ivory transition-calm hover:bg-copperlight"
        >
          {resolvedCta}
        </Link>
      )}
      {resolvedCta && onCta && (
        <button
          type="button"
          onClick={onCta}
          className="mt-1 inline-flex min-h-11 items-center rounded-lg bg-copper px-5 text-sm font-bold text-ivory transition-calm hover:bg-copperlight"
        >
          {resolvedCta}
        </button>
      )}
    </div>
  )
}
