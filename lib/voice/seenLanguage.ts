// lib/voice/seenLanguage.ts
// The "Seen Language" voice formula. It phrases a REAL, already-computed finding
// so the aspirant feels located instead of judged. It invents nothing — it only
// reshapes facts the engine already produced into:
//
//   "You are not [the shame story].
//    What is actually happening is [the precise pattern].
//    The cost is [what it takes].
//    Command: [one concrete move]."
//
// Diagnosis before command. Recognition before repair. One next move after insight.

export type VoiceProduct = 'chanakya' | 'kautilya' | 'haven'

export interface SeenLanguageInput {
  /** The shame story to explicitly reject — "behind", "confused", "not capable". */
  shameInterpretation: string
  /** The precise, real mechanism actually happening (from real data, never invented). */
  truePattern: string
  /** What the pattern is costing them. */
  cost?: string
  /** One concrete next move. */
  command: string
}

export interface SeenCommand {
  mirror: string
  reframe: string
  cost?: string
  command: string
  fullText: string
}

function lowerFirst(s: string): string {
  return s ? s[0].toLowerCase() + s.slice(1) : s
}
function stripLeadingNot(s: string): string {
  return s.replace(/^not\s+/i, '').trim()
}

export function createSeenCommand(input: SeenLanguageInput): SeenCommand {
  const mirror = `You are not ${stripLeadingNot(input.shameInterpretation)}.`
  const reframe = `What is actually happening is ${lowerFirst(input.truePattern.trim())}.`
  const cost = input.cost ? `The cost is ${lowerFirst(input.cost.trim())}.` : undefined
  const command = input.command.trim()
  const fullText = [mirror, reframe, cost, `Command: ${command}`]
    .filter(Boolean)
    .join('\n')
  return { mirror, reframe, cost, command, fullText }
}

/** Phrasings the voice must never produce — symptoms-as-identity and clinical labels. */
export const NO_SHAME_BANS = [
  'lazy', 'weak', 'dumb', 'hopeless', 'broken', 'traumatized', 'inconsistent',
  'undisciplined', 'no discipline', 'low intelligence',
  'you have abandonment issues', 'you are depressed', 'you are codependent',
  'you are narcissistic',
] as const

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Runtime guard: returns the banned terms present in `text` (empty = clean).
 * SEEN_VOICE_RULES instructs the model to avoid these, but a prompt is not
 * enforcement — scan generated output and flag leaks so they can be caught.
 */
export function findShameLanguage(text: string): string[] {
  if (!text) return []
  // Flag a banned term only when ASSERTED — "You are not behind" / "not lazy" is the
  // seen-language pattern itself and must pass; "You are lazy" is the violation.
  return NO_SHAME_BANS.filter((term) =>
    new RegExp(`(?<!\\bnot\\s)(?<!\\bnever\\s)\\b${escapeRegExp(term)}\\b`, 'i').test(text),
  )
}

/** Prompt-injectable voice spec for the long-war report / command generation. */
export const SEEN_VOICE_RULES = `SEEN-LANGUAGE VOICE (apply to diagnostic and command lines):
Locate the aspirant in their long war; never flatter or shame. Prefer the structure:
  "You are not [the shame story they tell themselves]. What is actually happening is [the precise pattern]. The cost is [what it takes from them]. [One concrete command]."
- Mirror the real mechanism, not the surface ("not behind because you know too little — too many sources are fighting for authority inside your head").
- Use "not X, actually Y" to separate identity from mechanism ("not confused — your sources have no hierarchy").
- Reframe to something truer and more generous ONCE, and only AFTER an accurate hard mirror — never open with comfort.
- Hold both sides of a real contradiction when one exists ("you cannot imagine leaving, and you cannot imagine staying").
- Frame the command as subtraction/integration where the leak is resource chaos, not "study more".
- Never use clinical labels or these words: ${NO_SHAME_BANS.join(', ')}.
- Never say "I understand how you feel", "at least…", "stay positive". Always end on one concrete next move.`
