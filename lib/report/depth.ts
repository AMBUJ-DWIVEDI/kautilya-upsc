// Report depth records the exact diagnosis instrument a report was built from.
// Historical depths remain readable; only current depths start new sessions.
export type HistoricalReportDepth = 'free30' | 'paid50'
export type CurrentReportDepth = 'free40' | 'paid60'
export type ReportDepth = HistoricalReportDepth | CurrentReportDepth
export type DiagnosisDepth = CurrentReportDepth

export function isPaidDepth(depth?: string | null): depth is 'paid50' | 'paid60' {
  return depth === 'paid50' || depth === 'paid60'
}

export function isFreeDepth(depth?: string | null): depth is 'free30' | 'free40' {
  return depth === 'free30' || depth === 'free40'
}

export function normalizeReportDepth(value?: string | null): ReportDepth {
  if (value === 'free30' || value === 'paid50' || value === 'free40' || value === 'paid60') {
    return value
  }
  return 'free40'
}

export function reportDepthLabel(depth: ReportDepth): string {
  const labels: Record<ReportDepth, string> = {
    free30: 'Scout 30-card command report',
    paid50: 'Deep 50-card command report',
    free40: 'Scout 40-card command report',
    paid60: 'Deep 60-card command report',
  }
  return labels[depth]
}
