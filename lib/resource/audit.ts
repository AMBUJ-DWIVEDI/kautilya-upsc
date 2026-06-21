import type { SupabaseClient } from '@supabase/supabase-js'
import { computeIntegrationScore } from '@/lib/kautilya/integrationScore'
import type {
  KautilyaSourceRow,
  ResourceState,
  Source,
  SourceRole,
} from '@/types/kautilya'

const ACTION_BY_ROLE: Record<SourceRole, string> = {
  final: 'Keep on the active integration stack.',
  secondary: 'Reference only — do not add parallel coverage.',
  parked: 'Off the front until existing finals are integrated.',
  dead: 'Remove from desk and digital pile.',
}

export function actionForRole(role: SourceRole, subject?: string | null): string {
  const base = ACTION_BY_ROLE[role]
  if (subject?.trim()) {
    return `${base} Subject: ${subject.trim()}.`
  }
  return base
}

export function rowToSource(row: KautilyaSourceRow): Source {
  return {
    id: row.id,
    name: row.name,
    subject: row.subject ?? undefined,
    role: row.role,
    reason: row.reason,
    action: actionForRole(row.role, row.subject),
  }
}

export async function getResourceState(
  supabase: SupabaseClient,
  userId: string,
): Promise<ResourceState> {
  const [{ data: rows, error: sourcesErr }, { data: scores, error: scoresErr }] =
    await Promise.all([
      supabase
        .from('kautilya_sources')
        .select('id, user_id, name, subject, role, reason, created_at, updated_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true }),
      supabase
        .from('hidden_scores')
        .select('resource_chaos')
        .eq('user_id', userId)
        .maybeSingle(),
    ])

  if (sourcesErr) {
    console.error('getResourceState: sources load failed', sourcesErr)
    throw new Error('Could not load sources')
  }
  if (scoresErr) {
    console.error('getResourceState: hidden_scores load failed', scoresErr)
    throw new Error('Could not load resource chaos')
  }

  const sources = (rows ?? []).map(r => rowToSource(r as KautilyaSourceRow))
  const resourceChaos = (scores?.resource_chaos as number | null | undefined) ?? null

  return { sources, resourceChaos }
}

export async function getIntegrationScore(
  supabase: SupabaseClient,
  userId: string,
): Promise<number | null> {
  const state = await getResourceState(supabase, userId)
  return computeIntegrationScore(state)
}

export const SOURCE_ROLES: SourceRole[] = ['final', 'secondary', 'parked', 'dead']

export function isSourceRole(value: unknown): value is SourceRole {
  return typeof value === 'string' && (SOURCE_ROLES as string[]).includes(value)
}
