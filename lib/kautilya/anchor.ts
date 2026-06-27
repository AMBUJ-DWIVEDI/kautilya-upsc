interface AnchorReport {
  archetype?: string
  anchor_card?: {
    fighting_for?: string
    must_protect?: string
    must_prove?: string
    must_become?: string
    biggest_enemy?: string
    daily_command?: string
    warning?: string
    comeback_line?: string
  }
  personal_laws?: Array<{ law_name?: string; law?: string; detail?: string }>
}

export function extractAnchorSnapshot(report: AnchorReport | null | undefined) {
  const card = report?.anchor_card
  return {
    source: 'diagnosis_report' as const,
    cognitiveArchetype: report?.archetype ?? 'Diagnosis pending',
    emotionalVault: {
      fightingFor: card?.fighting_for ?? '',
      mustProtect: card?.must_protect ?? '',
      mustProve: card?.must_prove ?? '',
      mustBecome: card?.must_become ?? '',
      biggestEnemy: card?.biggest_enemy ?? '',
      dailyCommand: card?.daily_command ?? '',
      warning: card?.warning ?? '',
      comebackLine: card?.comeback_line ?? '',
    },
    diagnosisLaws: (report?.personal_laws ?? []).map(item => ({
      name: item.law_name ?? '',
      law: item.law ?? '',
      detail: item.detail ?? '',
    })),
  }
}
