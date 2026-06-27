'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import type { KautilyaCommand } from '@/lib/kautilya/commandTypes'

export default function CommandReview({ command }: { command: KautilyaCommand }) {
  const [busy, setBusy] = useState(false)

  async function submit(formData: FormData) {
    setBusy(true)
    const response = await fetch('/api/kautilya-command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'review',
        command,
        review: {
          whatMoved: formData.get('whatMoved'),
          whatLeaked: formData.get('whatLeaked'),
          tomorrowFirstMove: formData.get('tomorrowFirstMove'),
        },
      }),
    })
    setBusy(false)
    if (!response.ok) {
      toast.error('Review could not be sealed. Your text remains in the form.')
      return
    }
    toast.success('Command review sealed.')
  }

  return (
    <form action={submit} className="institutional-surface p-5">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-copper">Command Review</p>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <ReviewField name="whatMoved" label="What moved?" />
        <ReviewField name="whatLeaked" label="What leaked?" />
        <ReviewField name="tomorrowFirstMove" label="Tomorrow's first move" required />
      </div>
      <button disabled={busy} className="mt-4 rounded bg-indigo px-4 py-2 text-sm font-black text-ivory disabled:opacity-50">
        {busy ? 'Sealing review' : 'Seal review'}
      </button>
    </form>
  )
}

function ReviewField({ name, label, required = false }: { name: string; label: string; required?: boolean }) {
  return (
    <label className="text-xs font-bold uppercase tracking-[0.16em] text-inkdim">
      {label}
      <textarea name={name} required={required} minLength={required ? 2 : undefined} rows={4} className="mt-2 w-full rounded border border-linen bg-ivory px-3 py-2 text-sm font-medium normal-case tracking-normal text-indigo outline-none focus:border-copper" />
    </label>
  )
}
