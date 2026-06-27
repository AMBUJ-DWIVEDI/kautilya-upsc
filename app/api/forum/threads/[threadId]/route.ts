import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { canModerateForum, forumReportInput } from '@/lib/kautilya/forum'

export async function PATCH(request: Request, { params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  if (body.action === 'delete') {
    const { error } = await supabase.from('kautilya_forum_threads').update({ deleted_at: new Date().toISOString() }).eq('id', threadId).eq('author_id', user.id)
    return error ? NextResponse.json({ error: 'Forbidden' }, { status: 403 }) : NextResponse.json({ ok: true })
  }
  if (body.action === 'report') {
    const parsed = forumReportInput.safeParse({ reason: body.reason })
    if (!parsed.success) return NextResponse.json({ error: 'Invalid reason' }, { status: 400 })
    const { error } = await supabase.from('kautilya_forum_reports').insert({ reporter_id: user.id, thread_id: threadId, reason: parsed.data.reason })
    return error ? NextResponse.json({ error: 'Report already received' }, { status: 409 }) : NextResponse.json({ ok: true })
  }
  if (body.action === 'hide' && canModerateForum(user.email, process.env.ADMIN_EMAIL)) {
    const { error } = await createAdminClient().from('kautilya_forum_threads').update({ hidden_at: new Date().toISOString() }).eq('id', threadId)
    return error ? NextResponse.json({ error: 'Unavailable' }, { status: 503 }) : NextResponse.json({ ok: true })
  }
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
