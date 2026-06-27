'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { toPng } from 'html-to-image'
import Seal from '@/components/brand/Seal'
import {
  ARCHETYPES, DIMENSION_HIGHLIGHT_LABELS, WAR_PATTERN_LABELS,
} from '@/lib/diagnosis/archetypes'
import type { ArchetypeId, Dimension, WarPatternTag } from '@/lib/diagnosis/types'
import { track } from '@/lib/analytics'
import { isPaidDepth, type ReportDepth } from '@/lib/report/depth'

interface Props {
  archetype: ArchetypeId
  warPatternTags: WarPatternTag[]
  name: string
  depth: ReportDepth
  identityFusion: number
  dims: Record<Dimension, number>
}

/** Friction-type dimensions read inverted: a high score is the wound, not the strength. */
const INVERTED_DIMS: Dimension[] = [
  'emotional_volatility', 'execution_friction', 'distraction_risk',
  'resource_chaos', 'identity_fusion', 'external_pressure',
]

/** Qualitative bands only — raw dimension scores are never mirrored back. */
function bandFor(dim: Dimension, score: number): string {
  const effective = INVERTED_DIMS.includes(dim) ? 100 - score : score
  if (effective >= 70) return 'A weapon. Keep it sharp.'
  if (effective >= 45) return 'Forming. The system will train it.'
  return 'The front line. This is where we work.'
}

export default function RevealClient({ archetype, warPatternTags, name, depth, identityFusion, dims }: Props) {
  const meta = ARCHETYPES[archetype]
  const cardRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)
  const isScoutReport = !isPaidDepth(depth)

  // Design law: identity_fusion >= 80 softens the harshest verdict paths.
  const revealLine = identityFusion >= 80 ? meta.revealLineSoft : meta.revealLine

  async function handleExport() {
    if (!cardRef.current || exporting) return
    setExporting(true)
    track('reveal_card_exported', { archetype })
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: '#F7F4ED',
        cacheBust: true,
      })
      const link = document.createElement('a')
      link.download = `kautilya-${archetype.toLowerCase().replace(/_/g, '-')}.png`
      link.href = dataUrl
      link.click()
    } catch {
      // Export is a bonus, never a blocker.
    } finally {
      setExporting(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-parchment px-4 py-10 sm:px-6">
      {/* ── The ceremony ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex w-full max-w-lg flex-col items-center text-center"
      >
        <Seal variant="ceremonial" size={110} label="Sealed" />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-8 text-xs font-bold uppercase tracking-[0.3em] text-inkdim"
        >
          {name ? `${name}, the diagnosis names you` : 'The diagnosis names you'}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="heading-cinzel mt-3 text-4xl font-black leading-tight text-copper sm:text-5xl"
        >
          {meta.name}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.6 }}
          className="note-surface mt-6 max-w-md text-slate900"
        >
          {revealLine}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.95, duration: 0.5 }}
          className="card-calm mt-7 w-full max-w-md p-5 text-left"
        >
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-copper">
            First prescribed action
          </p>
          <p className="mt-2 text-sm leading-6 text-slate900">
            Open your command diagnosis, then execute the first repair before adding another
            source to the pile.
          </p>
        </motion.div>

        {/* ── 3 dimension highlights ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.5 }}
          className="mt-10 grid w-full gap-3"
        >
          {meta.highlightDims.map(dim => (
            <div key={dim} className="card-calm flex items-baseline justify-between gap-4 px-5 py-4 text-left">
              <span className="text-sm font-bold text-indigo">{DIMENSION_HIGHLIGHT_LABELS[dim]}</span>
              <span className="text-xs text-inkdim">{bandFor(dim, dims[dim])}</span>
            </div>
          ))}
        </motion.div>

        {/* ── War-pattern tags ── */}
        {warPatternTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.7, duration: 0.5 }}
            className="mt-6 w-full"
          >
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-inkdim">
              War patterns detected
            </p>
            <div className="grid gap-2.5">
              {warPatternTags.map(tag => (
                <div key={tag} className="rounded-lg border border-clay/25 bg-clay/5 px-4 py-3 text-left">
                  <p className="text-sm font-bold text-clay">{WAR_PATTERN_LABELS[tag].label}</p>
                  <p className="mt-1 text-xs leading-5 text-inkdim">{WAR_PATTERN_LABELS[tag].line}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.95, duration: 0.5 }}
          className="copper-border mt-8 w-full rounded-lg bg-ivory p-5 text-left"
        >
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-copper">
            {isScoutReport ? 'What the full diagnosis unlocks' : 'Full diagnosis complete'}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate900">
            {isScoutReport
              ? 'Scout named the pattern from forty contextual signals. Warrior and Commander open the complete sixty-card instrument to read targets, pressure, anchors, identity, recovery, and exam-hall behaviour with sharper context.'
              : 'This report used the complete premium instrument, so tomorrow\'s command can lean on deeper target, anchor, and operating-profile evidence instead of a first approximation.'}
          </p>
          {isScoutReport && (
            <Link
              href="/upgrade"
              className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg border border-copper/40 px-4 text-xs font-bold uppercase tracking-[0.18em] text-copper transition-calm hover:bg-copper hover:text-ivory"
            >
              Unlock the complete 60-card diagnosis
            </Link>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.1, duration: 0.5 }}
          className="mt-10 flex w-full flex-col gap-3"
        >
          <Link
            href="/report"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-copper text-sm font-bold text-ivory transition-calm hover:bg-copperlight"
          >
            Open Command Diagnosis
          </Link>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-linen text-sm font-semibold text-slate900 transition-calm hover:border-copper/50 disabled:opacity-60"
          >
            {exporting ? 'Inking the card...' : 'Save your archetype card'}
          </button>
        </motion.div>
      </motion.div>

      {/* ── Share card (export target; rendered off-canvas, exported via html-to-image) ── */}
      <div className="pointer-events-none fixed -left-[9999px] top-0">
        <div
          ref={cardRef}
          className="flex h-[500px] w-[400px] flex-col items-center justify-between bg-parchment px-8 py-10 text-center"
          style={{ border: '1px solid #E5DFD2' }}
        >
          <p className="heading-cinzel text-[11px] font-bold uppercase tracking-[0.3em] text-inkdim">
            KAUTILYA IAS · UPSC CSE
          </p>
          <div className="flex flex-col items-center">
            <Seal variant="stamped" size={88} />
            <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.28em] text-inkdim">
              The diagnosis names {name ? name.split(' ')[0] : 'me'}
            </p>
            <p className="heading-cinzel mt-2 text-3xl font-black leading-tight text-copper">
              {meta.name}
            </p>
            <p className="note-surface mt-4 text-[13px] leading-6 text-slate900">{revealLine}</p>
          </div>
          <p className="text-[10px] tracking-wide text-inkdim">
            Knowledge is not enough. Judgement selects.
          </p>
        </div>
      </div>
    </main>
  )
}
