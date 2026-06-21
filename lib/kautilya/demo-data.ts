/** Fallback data for KAUTILYA command surfaces until DB wiring lands. */

import type { WeeklyCommand } from '@/types/kautilya'

export function deriveWeeklyCommand(primaryLeak: string): WeeklyCommand {
  return {
    weekSignal: 'Integration debt is the dominant front.',
    primaryLeak,
    doMore: ['One Smart Note repair', 'One answer rewrite', 'Close two open loops'],
    doLess: ['New PDFs', 'Strategy videos', 'Optional deep dives'],
    mustIntegrate: ['Polity spine chapter', 'One CA issue to static ground'],
    mustWrite: ['One GS2 answer with framework visible'],
    mustRevise: ['Prelims fact box from last week'],
  }
}
