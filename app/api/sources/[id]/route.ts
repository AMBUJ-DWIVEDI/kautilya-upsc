import { createClient } from '@/lib/supabase/server'
import { isSourceRole, rowToSource } from '@/lib/resource/audit'
import type { KautilyaSourceRow } from '@/types/kautilya'
import { NextResponse, type NextRequest } from 'next/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { id } = await context.params
  const body = await request.json() as {
    role?: string
    name?: string
    subject?: string
    reason?: string
  }

  const patch: Record<string, string | null> = {}
  if (body.role !== undefined) {
    if (!isSourceRole(body.role)) {
      return NextResponse.json({ error: 'Invalid role.' }, { status: 400 })
    }
    patch.role = body.role
  }
  if (body.name !== undefined) {
    const name = body.name.trim()
    if (!name) return NextResponse.json({ error: 'Name cannot be empty.' }, { status: 400 })
    patch.name = name
  }
  if (body.subject !== undefined) {
    patch.subject = body.subject.trim() || null
  }
  if (body.reason !== undefined) {
    patch.reason = body.reason.trim()
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('kautilya_sources')
    .update(patch)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id, user_id, name, subject, role, reason, created_at, updated_at')
    .maybeSingle()

  if (error) {
    console.error('sources PATCH failed:', error)
    return NextResponse.json({ error: 'Could not update source.' }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: 'Source not found.' }, { status: 404 })
  }

  return NextResponse.json({ source: rowToSource(data as KautilyaSourceRow) })
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { id } = await context.params

  const { data, error } = await supabase
    .from('kautilya_sources')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id')
    .maybeSingle()

  if (error) {
    console.error('sources DELETE failed:', error)
    return NextResponse.json({ error: 'Could not delete source.' }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: 'Source not found.' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
