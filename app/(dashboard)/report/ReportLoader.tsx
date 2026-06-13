'use client'

// Shown when no cached report exists yet (e.g. the background generation
// from the diagnosis hasn't finished). POSTs to /api/generate-report, which
// generates + caches + returns the report, then renders it.

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { ReportContent } from '@/lib/report/types'
import CommandReport from './CommandReport'

const STEPS = [
  'Reading your preparation pattern...',
  'Mapping your pressure points...',
  'Translating the silent dimensions...',
  'Drafting your command laws...',
  'Sealing the diagnosis.',
]

export default function ReportLoader({ depth }: { depth: 'free30' | 'paid50' }) {
  const [report, setReport] = useState<ReportContent | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    const tick = setInterval(() => setStep(s => Math.min(s + 1, STEPS.length - 1)), 1400)

    fetch('/api/generate-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ depth }),
    })
      .then(async res => {
        const json = (await res.json()) as { report?: ReportContent; error?: string }
        if (!res.ok || !json.report) throw new Error(json.error || 'Generation failed')
        setReport(json.report)
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Generation failed'))
      .finally(() => clearInterval(tick))

    return () => clearInterval(tick)
  }, [depth])

  if (report) return <CommandReport report={report} depth={depth} />

  if (error) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="mb-2 text-sm text-clay">{error}</p>
        <p className="mb-6 text-xs text-inkdim">
          The diagnosis engine is warming up. Your scores are safe — try again in a moment.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="min-h-11 rounded-lg bg-copper px-6 text-sm font-semibold text-parchment transition-calm hover:bg-copperlight"
        >
          Retry
        </button>
        <Link href="/dashboard" className="mt-4 text-xs text-inkdim transition-calm hover:text-copper">
          ← Today&apos;s Command
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xs flex-1 flex-col items-center justify-center px-6">
      <h1 className="heading-cinzel mb-8 text-center text-xl font-bold text-indigo">
        Building your command profile...
      </h1>
      <div className="flex w-full flex-col gap-3 text-left">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <span
              className={`font-mono text-xs ${
                i < step ? 'text-sage' : i === step ? 'text-copper' : 'text-inkdim/40'
              }`}
            >
              {i < step ? 'OK' : i === step ? '>' : 'o'}
            </span>
            <span
              className={`text-sm ${
                i < step ? 'text-inkdim' : i === step ? 'font-medium text-slate900' : 'text-inkdim/40'
              }`}
            >
              {s}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
