'use client'

import { toast } from 'sonner'

export const kautilyaToasts = {
  weeklyCommandSealed: () => toast('Weekly command sealed.'),
  sourceParked: () => toast('Source parked. Integration score updated.'),
  answerRewriteLogged: () => toast('Answer rewrite logged.'),
  currentIssueIntegrated: () => toast('Current issue integrated.'),
  repairMissionOpened: () => toast('Repair mission opened.'),
  longWarReportUpdated: () => toast('Long-war report updated.'),
  smartNoteRepaired: () => toast('Integrated.'),
  architectureUpdated: () => toast('Architecture updated.'),
  expansionReduced: () => toast('Expansion reduced.'),
} as const
