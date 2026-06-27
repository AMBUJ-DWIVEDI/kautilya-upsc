import KautilyaCommandShell from '@/components/kautilya/command/KautilyaCommandShell'
import CommandEmptyState from '@/components/kautilya/command/CommandEmptyState'
import { createMockKautilyaCommand } from '@/lib/kautilya/commandTemplates'
import { deriveKautilyaCommand } from '@/lib/kautilya/deriveKautilyaCommand'
import { createClient } from '@/lib/supabase/server'

export default async function KautilyaCommandPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: signals } = await supabase.from('user_dashboard_summary')
    .select('resource_chaos, prelims_nerve, mains_stamina, integration_score')
    .eq('user_id', user!.id)
    .maybeSingle()

  if (!signals) return <CommandEmptyState />

  const type = deriveKautilyaCommand({
    resourceChaosScore: signals.resource_chaos ?? 50,
    prelimsNerveScore: 100 - (signals.prelims_nerve ?? 50),
    mainsArchitectureScore: signals.mains_stamina ?? 50,
    currentAffairsIntegrationScore: signals.integration_score ?? 50,
    optionalStabilityScore: 50,
    missedDays: 0,
  })
  return <KautilyaCommandShell initialCommand={{ ...createMockKautilyaCommand(type), userId: user!.id }} />
}
