import { notFound } from 'next/navigation'
import ReplyComposer from '@/components/kautilya/forum/ReplyComposer'
import ForumModerationMenu from '@/components/kautilya/forum/ForumModerationMenu'
import { createClient } from '@/lib/supabase/server'

export default async function ForumThreadPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const [{ data: thread }, { data: replies }] = await Promise.all([
    supabase.from('kautilya_forum_threads').select('id, author_id, title, body, created_at').eq('id', threadId).maybeSingle(),
    supabase.from('kautilya_forum_replies').select('id, author_id, body, created_at').eq('thread_id', threadId).order('created_at'),
  ])
  if (!thread) notFound()
  const isAdmin = user?.email === process.env.ADMIN_EMAIL
  return <main className="flex-1 bg-parchment px-4 pb-12 pt-2 text-slate900 sm:px-6 lg:px-8"><div className="mx-auto max-w-4xl"><article className="institutional-surface p-6 sm:p-8"><div className="flex items-center justify-between gap-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-copper">Forum thread</p><ForumModerationMenu endpoint={`/api/forum/threads/${thread.id}`} isOwner={thread.author_id === user!.id} isAdmin={isAdmin} /></div><h1 className="heading-cinzel mt-3 text-3xl font-black text-indigo">{thread.title}</h1><p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-inkdim">{thread.body}</p></article><section className="my-6 space-y-3">{(replies ?? []).map(reply => <article key={reply.id} className="card-calm p-5"><div className="flex justify-end"><ForumModerationMenu endpoint={`/api/forum/replies/${reply.id}`} isOwner={reply.author_id === user!.id} isAdmin={isAdmin} /></div><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate900">{reply.body}</p></article>)}</section><ReplyComposer threadId={thread.id} /></div></main>
}
