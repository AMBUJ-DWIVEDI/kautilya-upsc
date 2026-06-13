import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isPaidPlan } from '@/lib/plans'
import DiagnosisEngine from './DiagnosisEngine'

export default async function DiagnosisPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: profile }, { data: userRow }] = await Promise.all([
    supabase
      .from('aspirant_profiles')
      .select('id, anchor_generated, diagnosis_depth')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('users')
      .select('plan_type')
      .eq('id', user.id)
      .single(),
  ])

  const paid = isPaidPlan(userRow?.plan_type)
  const depth = paid ? 'paid50' : 'free30'

  if (profile?.anchor_generated && (!paid || profile.diagnosis_depth === 'paid50')) {
    redirect('/dashboard')
  }

  return <DiagnosisEngine depth={depth} />
}
