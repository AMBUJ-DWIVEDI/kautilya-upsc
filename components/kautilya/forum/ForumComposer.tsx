'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

export default function ForumComposer({ rooms }: { rooms: Array<{ id: string; name: string }> }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(formData: FormData) {
    setBusy(true)
    const response = await fetch('/api/forum/threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: formData.get('roomId'), title: formData.get('title'), body: formData.get('body') }),
    })
    const data = await response.json()
    setBusy(false)
    if (!response.ok) {
      toast.error(data.error ?? 'Thread could not be created.')
      return
    }
    router.push(`/forum/${data.thread.id}`)
    router.refresh()
  }

  if (!open) return <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded bg-copper px-4 py-2 text-sm font-black text-ivory"><Plus className="h-4 w-4" />New thread</button>

  return (
    <form action={submit} className="institutional-surface mb-5 grid gap-3 p-5">
      <select name="roomId" required className="rounded border border-linen bg-ivory px-3 py-2 text-sm">{rooms.map(room => <option key={room.id} value={room.id}>{room.name}</option>)}</select>
      <input name="title" required minLength={4} maxLength={140} placeholder="Thread title" className="rounded border border-linen bg-ivory px-3 py-2 text-sm" />
      <textarea name="body" required minLength={10} maxLength={5000} rows={5} placeholder="State the preparation problem clearly." className="rounded border border-linen bg-ivory px-3 py-2 text-sm" />
      <div className="flex gap-2"><button disabled={busy} className="rounded bg-indigo px-4 py-2 text-sm font-black text-ivory">{busy ? 'Publishing' : 'Publish thread'}</button><button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm font-bold text-inkdim">Cancel</button></div>
    </form>
  )
}
