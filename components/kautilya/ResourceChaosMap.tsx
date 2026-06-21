'use client'

import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { createKautilyaMotion } from '@/lib/kautilya/motion'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/lib/kautilya/events'
import { useEffect } from 'react'
import type { Source } from '@/types/kautilya'
import KautilyaEmptyState from './KautilyaEmptyState'

interface ResourceChaosMapProps {
  integrationScore: number | null
  sources?: Source[]
  className?: string
}

export default function ResourceChaosMap({
  integrationScore,
  sources = [],
  className,
}: ResourceChaosMapProps) {
  const reduced = useReducedMotion()
  const presets = createKautilyaMotion(reduced)
  const hasSources = sources.length > 0

  useEffect(() => {
    if (hasSources && integrationScore != null) {
      trackEvent('kautilya_resource_map_viewed', { score: integrationScore })
    }
  }, [hasSources, integrationScore])

  if (!hasSources) {
    return (
      <KautilyaEmptyState
        variant="no-resource-map"
        className={className}
      />
    )
  }

  const calm = integrationScore != null && integrationScore >= 60

  return (
    <section
      id="resource-map"
      className={cn('card-calm overflow-hidden', className)}
    >
      <div className="border-b border-linen px-5 py-4 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.26em] text-copper">
          Resource Chaos Map
        </p>
        <p className="mt-1 text-sm text-inkdim">
          {calm
            ? 'Sources are stabilizing. Protect integration before expansion.'
            : 'Too many active fronts. Reduction is the command.'}
        </p>
      </div>

      <motion.div
        variants={presets.resourceMapReveal}
        initial="hidden"
        animate="show"
        className={cn(
          'grid gap-3 p-5 sm:grid-cols-2 sm:p-6',
          calm && 'bg-sage/[0.03]',
        )}
      >
        {integrationScore != null && (
          <motion.div
            variants={presets.resourceMapItem}
            className="col-span-full rounded-xl border border-copper/35 bg-ivory px-5 py-4"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-copper">
              Integration score
            </p>
            <div className="mt-2 flex items-end justify-between gap-4">
              <p className="text-3xl font-black text-indigo">
                {integrationScore}
                <span className="text-lg font-semibold text-inkdim"> / 100</span>
              </p>
              <div className="h-2 max-w-xs flex-1 overflow-hidden rounded-full bg-linen">
                <motion.div
                  className="h-full rounded-full bg-copper"
                  initial={{ width: 0 }}
                  animate={{ width: `${integrationScore}%` }}
                  transition={{ duration: reduced ? 0.01 : 0.85, ease: [0.22, 1, 0.36, 1], delay: reduced ? 0 : 0.45 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </section>
  )
}
