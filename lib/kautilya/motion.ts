import type { Transition, Variants } from 'framer-motion'

export const kautilyaDurations = {
  fast: 0.2,
  normal: 0.36,
  slow: 0.55,
  ritual: 0.85,
} as const

export const kautilyaEase = [0.22, 1, 0.36, 1] as const

export function kautilyaTransition(
  duration: number = kautilyaDurations.normal,
  reduced = false,
): Transition {
  if (reduced) return { duration: 0.01 }
  return { duration, ease: [...kautilyaEase] }
}

function withReduced(base: Variants, reduced: boolean): Variants {
  if (!reduced) return base
  const out: Variants = {}
  for (const [key, val] of Object.entries(base)) {
    if (typeof val === 'object' && val !== null) {
      const { opacity } = val as { opacity?: number }
      out[key] = { opacity: opacity ?? 1 }
    }
  }
  return out
}

export function createKautilyaMotion(reduced = false) {
  const t = (d: number) => kautilyaTransition(d, reduced)

  const page: Variants = withReduced(
    {
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0, transition: t(0.42) },
      exit: { opacity: 0, y: -8, transition: t(kautilyaDurations.fast) },
    },
    reduced,
  )

  const paperCard: Variants = withReduced(
    {
      initial: { opacity: 0, y: 16, scale: 0.98 },
      animate: { opacity: 1, y: 0, scale: 1, transition: t(kautilyaDurations.normal) },
      exit: { opacity: 0, y: -6, transition: t(kautilyaDurations.fast) },
    },
    reduced,
  )

  const briefReveal: Variants = withReduced(
    {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0, transition: t(kautilyaDurations.slow) },
    },
    reduced,
  )

  const sealComplete: Variants = withReduced(
    {
      initial: { scale: 1.35, opacity: 0, rotate: -6 },
      animate: { scale: 1, opacity: 1, rotate: 0, transition: t(kautilyaDurations.ritual) },
    },
    reduced,
  )

  const resourceMapReveal: Variants = withReduced(
    {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: { staggerChildren: reduced ? 0 : 0.12, delayChildren: reduced ? 0 : 0.08 },
      },
    },
    reduced,
  )

  const resourceMapItem: Variants = withReduced(
    {
      hidden: { opacity: 0, x: -10 },
      show: { opacity: 1, x: 0, transition: t(kautilyaDurations.normal) },
    },
    reduced,
  )

  const smartNoteSection: Variants = withReduced(
    {
      initial: { opacity: 0, y: 14 },
      animate: { opacity: 1, y: 0, transition: t(kautilyaDurations.slow) },
    },
    reduced,
  )

  const longWarReport: Variants = withReduced(
    {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: { staggerChildren: reduced ? 0 : 0.18, delayChildren: reduced ? 0 : 0.2 },
      },
    },
    reduced,
  )

  const longWarReportItem: Variants = withReduced(
    {
      hidden: { opacity: 0, y: 10 },
      show: { opacity: 1, y: 0, transition: t(kautilyaDurations.slow) },
    },
    reduced,
  )

  const staggerContainer: Variants = withReduced(
    {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: { staggerChildren: reduced ? 0 : 0.1 },
      },
    },
    reduced,
  )

  const staggerItem: Variants = withReduced(
    {
      hidden: { opacity: 0, y: 8 },
      show: { opacity: 1, y: 0, transition: t(kautilyaDurations.normal) },
    },
    reduced,
  )

  const archiveFold: Variants = withReduced(
    {
      initial: { opacity: 1, scale: 1, height: 'auto' },
      exit: { opacity: 0, scale: 0.96, height: 0, transition: t(kautilyaDurations.normal) },
    },
    reduced,
  )

  return {
    page,
    paperCard,
    briefReveal,
    sealComplete,
    resourceMapReveal,
    resourceMapItem,
    smartNoteSection,
    longWarReport,
    longWarReportItem,
    staggerContainer,
    staggerItem,
    archiveFold,
  }
}

/** Static presets for server components or one-off use. */
export const kautilyaMotion = createKautilyaMotion(false)
