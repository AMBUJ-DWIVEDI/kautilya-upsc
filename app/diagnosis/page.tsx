import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DiagnosisEngine from './DiagnosisEngine'

export default async function DiagnosisPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Diagnosis runs once; a mapped aspirant goes straight to command.
  const { data: profile } = await supabase
    .from('aspirant_profiles')
    .select('id, anchor_generated')
    .eq('user_id', user.id)
    .single()

  if (profile?.anchor_generated) {
    redirect('/dashboard')
  }

  return <DiagnosisEngine />
}
