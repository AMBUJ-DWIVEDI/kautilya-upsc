import { createClient } from '@/lib/supabase/server'
import { getOrCreateTodayCommand } from '@/lib/command/generate'
import { getResourceState } from '@/lib/resource/audit'
import LongWarDashboard from '@/components/kautilya/LongWarDashboard'
import type { StagePattern } from '@/lib/diagnosis/types'

function readinessFromIntegration(score: number | null) {
  if (score == null) {
    return {
      label: 'Awaiting diagnosis',
      tone: 'text-inkdim',
      signal: 'Operating profile not mapped yet.',
      rule: 'Complete the Scout diagnosis before adding another source.',
    }
  }
  if (score >= 72) {
    return {
      label: 'Ready',
      tone: 'text-sage',
      signal: 'Sources are holding together.',
      rule: 'Protect momentum. Execute today before expanding the syllabus.',
    }
  }
  if (score >= 45) {
    return {
      label: 'Strained',
      tone: 'text-copper',
      signal: 'Integration debt is visible.',
      rule: 'One repair note, one answer, one closed source. No new pile.',
    }
  }
  return {
    label: 'Recovery',
    tone: 'text-clay',
    signal: 'Resource chaos is high.',
    rule: 'Today is integration day, not expansion day.',
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: summary } = await supabase
    .from('user_dashboard_summary')
    .select('*')
    .eq('user_id', user!.id)
    .single()

  const hasCompletedDiagnosis = summary?.archetype != null
  const aspirantName = (summary?.name as string) || 'Aspirant'
  const archetype = (summary?.archetype as string) || 'Unmapped Aspirant'
  const plan = (summary?.plan_type as string) ?? 'free'
  const integrationScore = (summary?.integration_score as number | null) ?? null
  const readiness = readinessFromIntegration(integrationScore)
  const stagePattern = (summary?.stage_pattern as StagePattern) ?? 'PRELIMS_WALL'
  const prelimsNerve = (summary?.prelims_nerve as number | null) ?? null
  const mainsStamina = (summary?.mains_stamina as number | null) ?? null

  const command = hasCompletedDiagnosis
    ? await getOrCreateTodayCommand(supabase, user!.id)
    : null

  let resourceState
  try {
    resourceState = await getResourceState(supabase, user!.id)
  } catch {
    resourceState = {
      sources: [],
      resourceChaos: (summary?.resource_chaos as number | null) ?? null,
    }
  }

  return (
    <LongWarDashboard
      aspirantName={aspirantName}
      archetype={archetype}
      stagePattern={stagePattern}
      plan={plan}
      hasCompletedDiagnosis={hasCompletedDiagnosis}
      integrationScore={integrationScore}
      resourceState={resourceState}
      readiness={readiness}
      command={command}
      prelimsNerve={prelimsNerve}
      mainsStamina={mainsStamina}
    />
  )
}
