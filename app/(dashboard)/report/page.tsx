// /report — the KAUTILYA Command Diagnosis (the AI narrative on top of
// the rule-based scores). Fast path: render the cached row. Cold path:
// hand off to the client loader, which generates it on demand.

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { ReportContent } from '@/lib/report/types'
import { normalizeReportDepth } from '@/lib/report/depth'
import CommandReport from './CommandReport'
import ReportLoader from './ReportLoader'

export default async function ReportPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('aspirant_profiles')
    .select('diagnosis_depth, anchor_generated')
    .eq('user_id', user.id)
    .single()

  // Not diagnosed yet → send them through the scan first.
  if (!profile || !profile.diagnosis_depth || profile.diagnosis_depth === 'none') {
    redirect('/diagnosis')
  }

  const depth = normalizeReportDepth(profile.diagnosis_depth)

  const { data: existing } = await supabase
    .from('diagnosis_reports')
    .select('report_content')
    .eq('user_id', user.id)
    .eq('report_depth', depth)
    .is('attempt_id', null)
    .order('generated_at', { ascending: false })
    .limit(1)
    .single()

  if (existing?.report_content && Object.keys(existing.report_content).length > 0) {
    return <CommandReport report={existing.report_content as ReportContent} depth={depth} />
  }

  // No cached report yet — generate it client-side (route is idempotent/cached).
  return <ReportLoader depth={depth} />
}
