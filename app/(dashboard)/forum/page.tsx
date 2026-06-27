import Link from 'next/link'
import ForumComposer from '@/components/kautilya/forum/ForumComposer'
import { createClient } from '@/lib/supabase/server'

export default async function KautilyaForumPage() {
  const supabase = await createClient()
  const [{ data: rooms }, { data: threads }] = await Promise.all([
    supabase.from('kautilya_forum_rooms').select('id, slug, name, description').order('sort_order'),
    supabase.from('kautilya_forum_threads').select('id, room_id, title, body, created_at').order('created_at', { ascending: false }).limit(50),
  ])
  const roomMap = new Map((rooms ?? []).map(room => [room.id, room.name]))
  return <main className="flex-1 bg-parchment px-4 pb-12 pt-2 text-slate900 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl">
    <header className="institutional-surface mb-7 flex flex-col gap-5 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.28em] text-copper">Discussion Forum</p><h1 className="heading-cinzel mt-3 text-3xl font-black text-indigo sm:text-5xl">A civil-services common room, not a noise feed.</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-inkdim">Diagnose, repair, share proof. No shame. No spam.</p></div><ForumComposer rooms={(rooms ?? []).map(room => ({ id: room.id, name: room.name }))} /></header>
    <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]"><aside className="card-calm h-fit p-5"><p className="text-xs font-bold uppercase tracking-[0.2em] text-copper">Rooms</p>{(rooms ?? []).map(room => <div key={room.id} className="mt-4"><p className="text-sm font-black text-indigo">{room.name}</p><p className="mt-1 text-xs leading-5 text-inkdim">{room.description}</p></div>)}</aside><section className="space-y-3">{(threads ?? []).map(thread => <Link key={thread.id} href={`/forum/${thread.id}`} className="institutional-surface block p-5 hover:border-copper/40"><p className="text-xs font-bold uppercase tracking-[0.18em] text-copper">{roomMap.get(thread.room_id) ?? 'Common room'}</p><h2 className="mt-2 text-lg font-black text-indigo">{thread.title}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-inkdim">{thread.body}</p></Link>)}{(threads ?? []).length === 0 && <p className="institutional-surface p-10 text-center text-sm text-inkdim">No threads yet. Open the first focused discussion.</p>}</section></div>
  </div></main>
}
