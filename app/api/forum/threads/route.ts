import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { forumThreadInput } from '@/lib/kautilya/forum'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const limit = rateLimit(`forum-thread:${user.id}`, 5, 60_000)
  if (!limit.allowed) return NextResponse.json({ error: 'Please wait before posting again.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSec) } })
  const parsed = forumThreadInput.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Check the room, title, and body.' }, { status: 400 })
  const { data, error } = await supabase.from('kautilya_forum_threads').insert({ room_id: parsed.data.roomId, title: parsed.data.title, body: parsed.data.body, author_id: user.id }).select().single()
  if (error) return NextResponse.json({ error: 'Thread could not be created.' }, { status: 503 })
  return NextResponse.json({ thread: data }, { status: 201 })
}
