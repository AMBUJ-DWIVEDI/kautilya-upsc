'use client'

import { useCallback, useMemo, useState } from 'react'
import ResourceChaosMap from '@/components/kautilya/ResourceChaosMap'
import SourceReductionCard from '@/components/kautilya/SourceReductionCard'
import KautilyaEmptyState from '@/components/kautilya/KautilyaEmptyState'
import KautilyaErrorState from '@/components/kautilya/KautilyaErrorState'
import { computeIntegrationScore } from '@/lib/kautilya/integrationScore'
import { actionForRole } from '@/lib/resource/audit'
import type { ResourceState, Source, SourceRole } from '@/types/kautilya'

interface ResourcesClientProps {
  initialState: ResourceState
}

export default function ResourcesClient({ initialState }: ResourcesClientProps) {
  const [state, setState] = useState<ResourceState>(initialState)
  const [loadError, setLoadError] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [reason, setReason] = useState('')

  const integrationScore = useMemo(() => computeIntegrationScore(state), [state])

  const reload = useCallback(async () => {
    setLoadError(false)
    try {
      const res = await fetch('/api/sources')
      if (!res.ok) throw new Error('load failed')
      const data = await res.json() as { sources: Source[] }
      setState(prev => ({ ...prev, sources: data.sources }))
    } catch {
      setLoadError(true)
    }
  }, [])

  async function handleRoleChange(id: string, role: SourceRole) {
    const prior = state.sources
    setState(prev => ({
      ...prev,
      sources: prev.sources.map(s =>
        s.id === id ? { ...s, role, action: actionForRole(role, s.subject) } : s,
      ),
    }))

    try {
      const res = await fetch(`/api/sources/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      if (!res.ok) throw new Error('patch failed')
      const data = await res.json() as { source: Source }
      setState(prev => ({
        ...prev,
        sources: prev.sources.map(s => (s.id === id ? data.source : s)),
      }))
    } catch {
      setState(prev => ({ ...prev, sources: prior }))
      setLoadError(true)
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    const trimmed = name.trim()
    if (!trimmed) {
      setFormError('Name your source before adding another front.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmed,
          subject: subject.trim() || undefined,
          reason: reason.trim(),
          role: 'secondary',
        }),
      })
      const data = await res.json() as { source?: Source; error?: string }
      if (!res.ok || !data.source) {
        setFormError(data.error ?? 'Could not add source.')
        return
      }
      setState(prev => ({ ...prev, sources: [...prev.sources, data.source!] }))
      setName('')
      setSubject('')
      setReason('')
    } catch {
      setFormError('Could not add source. Try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loadError && state.sources.length === 0) {
    return (
      <KautilyaErrorState
        title="Resource audit unavailable."
        body="Your named sources could not load. Diagnosis data is safe — retry when the signal returns."
        onRetry={reload}
      />
    )
  }

  return (
    <div className="space-y-8">
      <ResourceChaosMap integrationScore={integrationScore} sources={state.sources} />

      <section id="source-reduction" className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-copper">Source reduction</p>
          <p className="mt-1 text-sm text-inkdim">
            Park or finalize each source. Integration score updates from your real stack — not estimates.
          </p>
        </div>

        {loadError && (
          <KautilyaErrorState
            title="Last change may not have saved."
            body="Retry to sync your source roles with the server."
            onRetry={reload}
          />
        )}

        {state.sources.length === 0 ? (
          <KautilyaEmptyState
            variant="custom"
            title="No sources named yet."
            body="List every book, course, and notes pile you are actively juggling. Reduction starts with naming."
          />
        ) : (
          <div className="space-y-3">
            {state.sources.map(source => (
              <SourceReductionCard
                key={source.id}
                source={source}
                onRoleChange={handleRoleChange}
              />
            ))}
          </div>
        )}
      </section>

      <section className="card-calm copper-border p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-copper">Add source</p>
        <p className="mt-1 text-sm text-inkdim">
          One honest entry beats a perfect taxonomy. Subject is optional.
        </p>

        <form onSubmit={handleAdd} className="mt-5 space-y-4">
          <div>
            <label htmlFor="source-name" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-inkdim">
              Source name
            </label>
            <input
              id="source-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Laxmikanth Polity"
              className="w-full rounded-lg border border-linen bg-ivory px-4 py-2.5 text-sm text-slate900 focus:border-copper focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="source-subject" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-inkdim">
                Subject
              </label>
              <input
                id="source-subject"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Polity, History, …"
                className="w-full rounded-lg border border-linen bg-ivory px-4 py-2.5 text-sm text-slate900 focus:border-copper focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="source-reason" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-inkdim">
                Why it is on your desk
              </label>
              <input
                id="source-reason"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Optional — e.g. mains backlog"
                className="w-full rounded-lg border border-linen bg-ivory px-4 py-2.5 text-sm text-slate900 focus:border-copper focus:outline-none"
              />
            </div>
          </div>

          {formError && (
            <p className="text-sm font-semibold text-clay" role="alert">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-11 items-center rounded-lg bg-copper px-5 text-sm font-bold text-ivory transition-calm hover:bg-copperlight disabled:opacity-60"
          >
            {saving ? 'Adding…' : 'Add source'}
          </button>
        </form>
      </section>
    </div>
  )
}
