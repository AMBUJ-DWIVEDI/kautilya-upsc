'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ReplyComposer({ threadId }: { threadId: string }) {
  const router = useRouter()
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit() {
    setBusy(true)
    const response = await fetch(`/api/forum/threads/${threadId}/replies`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body }) })
    setBusy(false)
    if (!response.ok) return toast.error('Reply could not be posted.')
    setBody('')
    router.refresh()
  }
  return <div className="institutional-surface p-5"><label className="text-xs font-bold uppercase tracking-[0.18em] text-copper">Reply<textarea value={body} onChange={event => setBody(event.target.value)} rows={4} className="mt-2 w-full rounded border border-linen bg-ivory px-3 py-2 text-sm normal-case tracking-normal" /></label><button type="button" onClick={submit} disabled={busy || body.trim().length < 2} className="mt-3 rounded bg-copper px-4 py-2 text-sm font-black text-ivory disabled:opacity-50">{busy ? 'Posting' : 'Post reply'}</button></div>
}
