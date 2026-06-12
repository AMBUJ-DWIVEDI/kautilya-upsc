import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RevealClient from './RevealClient'
import type { ArchetypeId, WarPatternTag } from '@/lib/diagnosis/types'

export default async function RevealPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: scores }, { data: profile }] = await Promise.all([
    supabase
      .from('hidden_scores')
      .select('archetype, war_pattern_tags, resource_chaos, identity_fusion, purpose_intensity, anchor_strength, emotional_volatility, cognitive_clarity, execution_friction, distraction_risk, marathon_consistency, recovery_speed, prelims_nerve, mains_stamina, external_pressure')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('aspirant_profiles')
      .select('name')
      .eq('user_id', user.id)
      .single(),
  ])

  if (!scores?.archetype) redirect('/diagnosis')

  const knownTags: WarPatternTag[] = ['NOTES_HOARDER', 'MAINS_AVOIDER', 'NEWSPAPER_COLLECTOR', 'REVISION_COLLAPSER', 'STRATEGY_CONSUMER']
  const warTags = ((scores.war_pattern_tags ?? []) as string[])
    .filter((t): t is WarPatternTag => (knownTags as string[]).includes(t))

  return (
    <RevealClient
      archetype={scores.archetype as ArchetypeId}
      warPatternTags={warTags}
      name={profile?.name ?? ''}
      identityFusion={scores.identity_fusion ?? 0}
      dims={{
        purpose_intensity: scores.purpose_intensity ?? 50,
        anchor_strength: scores.anchor_strength ?? 50,
        emotional_volatility: scores.emotional_volatility ?? 50,
        cognitive_clarity: scores.cognitive_clarity ?? 50,
        execution_friction: scores.execution_friction ?? 50,
        distraction_risk: scores.distraction_risk ?? 50,
        marathon_consistency: scores.marathon_consistency ?? 50,
        recovery_speed: scores.recovery_speed ?? 50,
        prelims_nerve: scores.prelims_nerve ?? 50,
        mains_stamina: scores.mains_stamina ?? 50,
        resource_chaos: scores.resource_chaos ?? 50,
        identity_fusion: scores.identity_fusion ?? 50,
        external_pressure: scores.external_pressure ?? 50,
      }}
    />
  )
}
