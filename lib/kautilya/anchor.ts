interface AnchorReport {
  archetype?: string
  target_profile?: {
    post?: string
    rank?: string
    score?: string
  }
  emotional_vault?: {
    primary_trigger?: string
    pressure_story?: string
    protection_rule?: string
  }
  anchor_vault?: {
    human_anchor?: string
    anchor_role?: string
    character_anchor?: string
    deepest_motivator?: string
    return_point?: string
  }
  operating_profile?: {
    rhythm?: string
    starts_best_when?: string
    sustained_by?: string
    disrupted_by?: string
    recovery_protocol?: string
    protected_environment?: string
  }
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
  const targets = report?.target_profile
  const emotional = report?.emotional_vault
  const anchors = report?.anchor_vault
  const operating = report?.operating_profile
  return {
    source: 'diagnosis_report' as const,
    cognitiveArchetype: report?.archetype ?? 'Diagnosis pending',
    targets: {
      post: targets?.post ?? '',
      rank: targets?.rank ?? '',
      score: targets?.score ?? '',
    },
    emotionalVault: {
      primaryTrigger: emotional?.primary_trigger ?? '',
      pressureStory: emotional?.pressure_story ?? '',
      protectionRule: emotional?.protection_rule ?? '',
      fightingFor: card?.fighting_for ?? '',
      mustProtect: card?.must_protect ?? '',
      mustProve: card?.must_prove ?? '',
      mustBecome: card?.must_become ?? '',
      biggestEnemy: card?.biggest_enemy ?? '',
      dailyCommand: card?.daily_command ?? '',
      warning: card?.warning ?? '',
      comebackLine: card?.comeback_line ?? '',
    },
    anchorVault: {
      humanAnchor: anchors?.human_anchor ?? '',
      anchorRole: anchors?.anchor_role ?? '',
      characterAnchor: anchors?.character_anchor ?? '',
      deepestMotivator: anchors?.deepest_motivator ?? '',
      returnPoint: anchors?.return_point ?? '',
    },
    operatingProfile: {
      rhythm: operating?.rhythm ?? '',
      startsBestWhen: operating?.starts_best_when ?? '',
      sustainedBy: operating?.sustained_by ?? '',
      disruptedBy: operating?.disrupted_by ?? '',
      recoveryProtocol: operating?.recovery_protocol ?? '',
      protectedEnvironment: operating?.protected_environment ?? '',
    },
    diagnosisLaws: (report?.personal_laws ?? []).map(item => ({
      name: item.law_name ?? '',
      law: item.law ?? '',
      detail: item.detail ?? '',
    })),
  }
}
