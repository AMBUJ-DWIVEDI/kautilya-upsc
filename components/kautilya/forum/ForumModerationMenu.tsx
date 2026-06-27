'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function ForumModerationMenu({ endpoint, isOwner, isAdmin }: { endpoint: string; isOwner: boolean; isAdmin: boolean }) {
  const router = useRouter()
  async function act(action: 'delete' | 'report' | 'hide') {
    const reason = action === 'report' ? window.prompt('Why should this be reviewed?') : undefined
    if (action === 'report' && (!reason || reason.trim().length < 4)) return
    const response = await fetch(endpoint, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, reason }) })
    if (!response.ok) return toast.error('Action could not be completed.')
    toast.success(action === 'report' ? 'Report received.' : 'Content updated.')
    router.refresh()
  }
  return <div className="flex gap-3 text-xs font-bold text-inkdim">{isOwner && <button onClick={() => act('delete')} className="hover:text-maroon">Delete</button>}<button onClick={() => act('report')} className="hover:text-copper">Report</button>{isAdmin && <button onClick={() => act('hide')} className="hover:text-copper">Hide</button>}</div>
}
