'use client'

import { useState } from 'react'

interface TodayLog {
  study_hours: number | null
  mood: number | null
  energy: number | null
  mission_completed: boolean | null
  biggest_leak: string | null
  tomorrow_correction: string | null
}

const MOODS = ['😞', '😕', '😐', '🙂', '🔥']

export default function DailyLogForm({ today, initialStreak }: { today: TodayLog | null; initialStreak: number }) {
  const [hours, setHours] = useState<string>(today?.study_hours != null ? String(today.study_hours) : '')
  const [mood, setMood] = useState<number | null>(today?.mood ?? null)
  const [energy, setEnergy] = useState<number | null>(today?.energy ?? null)
  const [mission, setMission] = useState<boolean>(today?.mission_completed ?? false)
  const [leak, setLeak] = useState(today?.biggest_leak ?? '')
  const [correction, setCorrection] = useState(today?.tomorrow_correction ?? '')
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [streak, setStreak] = useState(initialStreak)

  async function save() {
    setState('saving')
    try {
      const res = await fetch('/api/daily-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          study_hours: Number(hours) || 0,
          mood, energy,
          mission_completed: mission,
          biggest_leak: leak,
          tomorrow_correction: correction,
        }),
      })
      const data = await res.json() as { ok?: boolean; streak?: number; error?: string }
      if (!res.ok || !data.ok) { setState('error'); return }
      if (typeof data.streak === 'number') setStreak(data.streak)
      setState('saved')
    } catch {
      setState('error')
    }
  }

  return (
    <div className="card-calm copper-border p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-copper">Tonight&apos;s 2-minute log</p>
        <span className="rounded-full bg-sage/12 px-3 py-1 text-xs font-bold text-sage">🔥 {streak}-day chain</span>
      </div>

      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-inkdim">Deep-study hours today</label>
      <input type="number" min={0} max={18} step={0.5} value={hours} onChange={e => setHours(e.target.value)} placeholder="e.g. 6"
        className="mb-5 w-full rounded-lg border border-linen bg-ivory px-4 py-2.5 text-sm text-slate900 focus:border-copper focus:outline-none" />

      <div className="mb-5 grid grid-cols-2 gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-inkdim">Mood</p>
          <div className="flex gap-1.5">
            {MOODS.map((m, i) => (
              <button key={i} type="button" onClick={() => setMood(i + 1)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition-calm ${mood === i + 1 ? 'border-copper bg-copper/10' : 'border-linen hover:border-inkdim/40'}`}>
                {m}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-inkdim">Energy</p>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map(i => (
              <button key={i} type="button" onClick={() => setEnergy(i)}
                className={`h-9 w-9 rounded-lg border text-sm font-bold transition-calm ${energy === i ? 'border-copper bg-copper/10 text-copper' : 'border-linen text-inkdim hover:border-inkdim/40'}`}>
                {i}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button type="button" onClick={() => setMission(v => !v)}
        className={`mb-5 flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm font-semibold transition-calm ${mission ? 'border-sage bg-sage/10 text-sage' : 'border-linen text-inkdim'}`}>
        Did you complete today&apos;s command?
        <span>{mission ? '✓ Sealed' : 'Not yet'}</span>
      </button>

      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-inkdim">Biggest leak today</label>
      <input value={leak} onChange={e => setLeak(e.target.value)} placeholder="What cost you the most?"
        className="mb-4 w-full rounded-lg border border-linen bg-ivory px-4 py-2.5 text-sm text-slate900 focus:border-copper focus:outline-none" />

      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-inkdim">One correction for tomorrow</label>
      <input value={correction} onChange={e => setCorrection(e.target.value)} placeholder="The single thing you will do differently"
        className="mb-5 w-full rounded-lg border border-linen bg-ivory px-4 py-2.5 text-sm text-slate900 focus:border-copper focus:outline-none" />

      <button type="button" onClick={save} disabled={state === 'saving'}
        className="w-full rounded-lg bg-copper py-3 text-sm font-bold text-ivory transition-calm hover:bg-copperlight disabled:opacity-60">
        {state === 'saving' ? 'Saving…' : state === 'saved' ? '✓ Sealed — chain intact' : "Seal today's log"}
      </button>
      {state === 'error' && <p className="mt-2 text-center text-xs text-clay">Could not save. Try again.</p>}
    </div>
  )
}
