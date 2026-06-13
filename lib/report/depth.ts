// Report depth mirrors the diagnosis depth the aspirant completed.
//   free30 → Scout 30-card scan
//   paid50 → Prelims/GS 50-card deep scan
export type ReportDepth = 'free30' | 'paid50'

export function normalizeReportDepth(value?: string | null): ReportDepth {
  return value === 'paid50' ? 'paid50' : 'free30'
}

export function reportDepthLabel(depth: ReportDepth): string {
  return depth === 'paid50' ? 'Deep 50-card command report' : 'Scout 30-card command report'
}
