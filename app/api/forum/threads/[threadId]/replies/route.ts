import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { forumReplyInput } from '@/lib/kautilya/forum'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: Request, { params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!rateLimit(`forum-reply:${user.id}`, 10, 60_000).allowed) return NextResponse.json({ error: 'Please wait before replying again.' }, { status: 429 })
  const parsed = forumReplyInput.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Reply is invalid.' }, { status: 400 })
  const { data, error } = await supabase.from('kautilya_forum_replies').insert({ thread_id: threadId, body: parsed.data.body, author_id: user.id }).select().single()
  if (error) return NextResponse.json({ error: 'Reply could not be posted.' }, { status: 503 })
  return NextResponse.json({ reply: data }, { status: 201 })
}
