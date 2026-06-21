import { createClient } from '@/lib/supabase/server'
import { isSourceRole, rowToSource } from '@/lib/resource/audit'
import type { KautilyaSourceRow } from '@/types/kautilya'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data, error } = await supabase
    .from('kautilya_sources')
    .select('id, user_id, name, subject, role, reason, created_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('sources GET failed:', error)
    return NextResponse.json({ error: 'Could not load sources.' }, { status: 500 })
  }

  return NextResponse.json({
    sources: (data ?? []).map(r => rowToSource(r as KautilyaSourceRow)),
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await request.json() as {
    name?: string
    subject?: string
    role?: string
    reason?: string
  }

  const name = body.name?.trim()
  if (!name) {
    return NextResponse.json({ error: 'Source name is required.' }, { status: 400 })
  }

  const role = isSourceRole(body.role) ? body.role : 'secondary'
  const subject = body.subject?.trim() || null
  const reason = body.reason?.trim() || ''

  const { data, error } = await supabase
    .from('kautilya_sources')
    .insert({
      user_id: user.id,
      name,
      subject,
      role,
      reason,
    })
    .select('id, user_id, name, subject, role, reason, created_at, updated_at')
    .single()

  if (error) {
    console.error('sources POST failed:', error)
    return NextResponse.json({ error: 'Could not add source.' }, { status: 500 })
  }

  return NextResponse.json({ source: rowToSource(data as KautilyaSourceRow) }, { status: 201 })
}
