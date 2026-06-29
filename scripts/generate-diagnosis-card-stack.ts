import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import {
  CARDS,
  FREE_DIAGNOSIS_CARD_IDS,
  LEVEL_NAMES,
  LEVEL_SUBTITLES,
} from '../lib/diagnosis/cards'
import type { Card, CardLevel, CardOption, Dimension } from '../lib/diagnosis/types'

const OUTPUT_PATH = resolve('docs/product/kautilya-diagnosis-card-stack.md')

const DIMENSION_LABELS: Record<Dimension, string> = {
  purpose_intensity: 'Purpose intensity',
  anchor_strength: 'Anchor strength',
  emotional_volatility: 'Emotional volatility',
  cognitive_clarity: 'Cognitive clarity',
  execution_friction: 'Execution friction',
  distraction_risk: 'Distraction risk',
  marathon_consistency: 'Marathon consistency',
  recovery_speed: 'Recovery speed',
  prelims_nerve: 'Prelims nerve',
  mains_stamina: 'Mains stamina',
  resource_chaos: 'Resource chaos',
  identity_fusion: 'Identity fusion',
  external_pressure: 'External pressure',
}

const DIMENSION_GUIDE: Array<[Dimension, number, string]> = [
  ['purpose_intensity', 40, 'Strength and durability of the reason for pursuing UPSC.'],
  ['anchor_strength', 40, 'How reliably a person, vow, purpose, or identity returns the aspirant to action.'],
  ['emotional_volatility', 30, 'How strongly results, comparison, and uncertainty disturb emotional steadiness.'],
  ['cognitive_clarity', 45, 'Ability to structure, connect, explain, and decide from available knowledge.'],
  ['execution_friction', 30, 'Gap between knowing the next action and actually beginning or completing it.'],
  ['distraction_risk', 25, 'Exposure to digital noise, comparison, novelty, and attention leakage.'],
  ['marathon_consistency', 45, 'Capacity to sustain repeatable preparation across ordinary and difficult weeks.'],
  ['recovery_speed', 50, 'Speed and quality of return after failure, interruption, or emotional impact.'],
  ['prelims_nerve', 50, 'Judgement, elimination discipline, and risk control under objective-paper pressure.'],
  ['mains_stamina', 40, 'Ability to write structured answers and sustain full-paper output.'],
  ['resource_chaos', 0, 'Source proliferation and integration debt. Higher is worse.'],
  ['identity_fusion', 25, 'Degree to which exam outcome and personal worth have become fused. Higher is riskier.'],
  ['external_pressure', 25, 'Family, money, age, work, social timeline, and obligation pressure.'],
]

const LEVEL_OUTPUTS: Record<CardLevel, string[]> = {
  1: ['Aspirant diagnosis', 'Attempt-stage profile', 'Cognitive archetype', 'Operating profile'],
  2: ['Purpose profile', 'Motivators', 'Target profile', 'Anchor vault'],
  3: ['Operating profile', 'External-pressure model', 'Rules and laws', 'Vulnerabilities'],
  4: ['Resource-chaos map', 'Integration engine', 'Personal laws', 'Vulnerabilities'],
  5: ['Cognitive archetype', 'Prelims/Mains verdict', 'Strengths and vulnerabilities', 'Attack plan'],
  6: ['Emotional vault', 'Recovery protocol', 'Warnings', 'Strengths and vulnerabilities'],
  7: ['Anchor vault', 'Human/character anchors', 'Motivators', 'Comeback line'],
  8: ['Self-belief profile', 'Rules and laws', 'Operating profile', 'Strengths and vulnerabilities'],
}

const CARD_OUTPUT_OVERRIDES: Record<string, string[]> = {
  'L1-01': ['Preparation-age context', 'Veteran/first-flight calibration'],
  'L1-02': ['Attempt pressure', 'Prelims-wall routing'],
  'L1-03': ['Stage pattern', 'Archetype cascade', 'Prelims verdict'],
  'L1-04': ['Mains exposure', 'Mains plateau signal'],
  'L1-05': ['Continuity pattern', 'Return pattern'],
  'L1-06': ['Eligibility runway', 'Attempt pressure'],
  'L1-07': ['Post-result recovery', 'Emotional vault'],
  'L2-01': ['Purpose type', 'Deep motivator'],
  'L2-02': ['Dream origin', 'Human/purpose anchor'],
  'L2-03': ['Selection meaning', 'Identity pressure'],
  'L2-04': ['Alternative-path stability', 'Identity fusion'],
  'L2-05': ['Service/status/restoration imagery'],
  'L2-06': ['Identity separation', 'Walk-away resilience'],
  'L2-07': ['Target post/service family'],
  'L2-08': ['Target rank band'],
  'L2-09': ['Target score orientation'],
  'L3-01': ['Employment constraint', 'Available-time architecture'],
  'L3-02': ['Real study-hour baseline', 'Operating rhythm'],
  'L3-03': ['Financial runway', 'External pressure'],
  'L3-04': ['Family climate', 'Family anchors'],
  'L3-05': ['Social timeline pressure'],
  'L3-06': ['Consistency evidence', 'Minimum viable day'],
  'L4-01': ['Digital-source noise'],
  'L4-02': ['Subject source authority', 'Fragmented Maximalist routing'],
  'L4-03': ['Note-system churn', 'Notes Hoarder flag'],
  'L4-04': ['Strategy consumption'],
  'L4-05': ['Current-affairs integration'],
  'L4-06': ['Source-reduction readiness'],
  'L5-01': ['Full-paper avoidance/stamina'],
  'L5-02': ['Answer conversion under partial knowledge'],
  'L5-03': ['Statement-question method'],
  'L5-04': ['Attempt-risk calibration'],
  'L5-05': ['Static-current integration'],
  'L5-06': ['Two-option nerve'],
  'L5-07': ['CSAT readiness'],
  'L5-08': ['Recall structure', 'Explanation clarity'],
  'L6-01': ['Mock-result recovery protocol'],
  'L6-02': ['Result-day regulation'],
  'L6-03': ['Deepest preparation wound'],
  'L6-04': ['Comparison response'],
  'L6-05': ['Public identity and shame armour'],
  'L6-06': ['Result-week digital spiral'],
  'L6-07': ['Worth/rank separation'],
  'L6-08': ['Primary emotional-vault trigger'],
  'L7-01': ['Worst-day return anchor'],
  'L7-02': ['Anchor evolution'],
  'L7-03': ['Quitting-thought interrupt'],
  'L7-04': ['Human anchor pressure/fuel'],
  'L7-05': ['Embodied anchor effect'],
  'L7-06': ['Human anchor relationship'],
  'L7-07': ['Human anchor emotional role'],
  'L7-08': ['Character anchor'],
  'L7-09': ['Deep motivator without external applause'],
  'L8-01': ['Belief state'],
  'L8-02': ['Belief evidence source'],
  'L8-03': ['Self-correction capacity'],
  'L8-04': ['Feedback-readiness and stabilization tone'],
  'L8-05': ['Walk-away law', 'Identity-fusion risk'],
  'L8-06': ['Explicit 90-day personal law'],
  'L8-07': ['Natural operating rhythm'],
}

function escapeCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ')
}

function formatDelta(value: number): string {
  return value > 0 ? `+${value}` : String(value)
}

function formatProfile(profile: NonNullable<NonNullable<CardOption['sets']>['profile']>): string[] {
  return Object.entries(profile).map(([key, value]) => `Fact: ${key}=${String(value)}`)
}

function formatMap(option: CardOption): string {
  const entries: string[] = []

  for (const [dimension, delta] of Object.entries(option.weights ?? {})) {
    entries.push(`${DIMENSION_LABELS[dimension as Dimension]} ${formatDelta(delta)}`)
  }

  if (option.sets?.stage_pattern) entries.push(`Stage=${option.sets.stage_pattern}`)
  if (option.sets?.purpose_type) entries.push(`Purpose=${option.sets.purpose_type}`)
  if (option.sets?.self_belief) entries.push(`Self-belief=${option.sets.self_belief}`)
  if (option.sets?.attempt_pressure_delta) {
    entries.push(`Attempt pressure ${formatDelta(option.sets.attempt_pressure_delta)}`)
  }
  if (option.sets?.profile) entries.push(...formatProfile(option.sets.profile))
  if (option.sets?.flags?.length) entries.push(`Flags: ${option.sets.flags.join(', ')}`)

  return entries.length > 0
    ? entries.join('; ')
    : 'Narrative evidence only; no numeric delta or routing override.'
}

function accessLabel(card: Card): string {
  return FREE_DIAGNOSIS_CARD_IDS.has(card.id)
    ? 'Free 40 + Premium 60'
    : 'Premium 60 only'
}

function outputSupport(card: Card): string {
  return [...LEVEL_OUTPUTS[card.level], ...(CARD_OUTPUT_OVERRIDES[card.id] ?? [])]
    .filter((item, index, values) => values.indexOf(item) === index)
    .join(' | ')
}

function renderCard(card: Card): string {
  const rows = card.options.map(option =>
    `| ${option.key.toUpperCase()} | ${escapeCell(option.label)} | ${escapeCell(formatMap(option))} |`,
  )

  return [
    `### ${card.id} - ${accessLabel(card)}`,
    '',
    `**Question:** ${card.question}`,
    '',
    `**Feeds:** ${outputSupport(card)}`,
    '',
    '| Option | Answer | Silent mapping |',
    '| --- | --- | --- |',
    ...rows,
    '',
  ].join('\n')
}

function renderLevel(level: CardLevel): string {
  const cards = CARDS.filter(card => card.level === level)
  const freeCount = cards.filter(card => FREE_DIAGNOSIS_CARD_IDS.has(card.id)).length

  return [
    `## Level ${level}: ${LEVEL_NAMES[level]}`,
    '',
    `> ${LEVEL_SUBTITLES[level]}`,
    '',
    `Cards: ${cards.length} total; ${freeCount} in Free 40; ${cards.length - freeCount} additional in Premium 60.`,
    '',
    ...cards.map(renderCard),
  ].join('\n')
}

function buildDocument(): string {
  if (CARDS.length !== 60) throw new Error(`Expected 60 cards, found ${CARDS.length}`)
  if (FREE_DIAGNOSIS_CARD_IDS.size !== 40) {
    throw new Error(`Expected 40 free cards, found ${FREE_DIAGNOSIS_CARD_IDS.size}`)
  }
  if (CARDS.some(card => card.input === 'text')) throw new Error('All cards must remain multiple choice')

  const freeByLevel = Array.from({ length: 8 }, (_, index) => {
    const level = (index + 1) as CardLevel
    return CARDS.filter(card => card.level === level && FREE_DIAGNOSIS_CARD_IDS.has(card.id)).length
  })
  const totalByLevel = Array.from({ length: 8 }, (_, index) => {
    const level = (index + 1) as CardLevel
    return CARDS.filter(card => card.level === level).length
  })

  const dimensionRows = DIMENSION_GUIDE.map(([dimension, baseline, meaning]) =>
    `| ${DIMENSION_LABELS[dimension]} | ${baseline} | ${meaning} |`,
  )

  return [
    '# KAUTILYA IAS Diagnosis Card Stack',
    '',
    'Generated from the deployed diagnosis registry. This is the complete 60-card instrument, including the curated Free 40 subset and every silent option mapping.',
    '',
    '## Instrument Shape',
    '',
    '| Level | Name | Free 40 | Premium 60 total |',
    '| --- | --- | ---: | ---: |',
    ...totalByLevel.map((total, index) =>
      `| L${index + 1} | ${LEVEL_NAMES[(index + 1) as CardLevel]} | ${freeByLevel[index]} | ${total} |`,
    ),
    `| **Total** |  | **${freeByLevel.reduce((a, b) => a + b, 0)}** | **${totalByLevel.reduce((a, b) => a + b, 0)}** |`,
    '',
    '## How Mapping Works',
    '',
    '1. Every numeric dimension begins at its baseline.',
    '2. The selected option adds or subtracts its listed deltas.',
    '3. Scores are rounded and clamped to 0-100 after all answers are processed.',
    '4. Factual routes set stage, purpose, self-belief, attempts, age, employment, or risk flags.',
    '5. Every selected answer is also passed to the report generator as readable narrative evidence, including options with no numeric delta.',
    '6. Attempt pressure is computed from attempts used and age runway, then adjusted by explicit pressure signals.',
    '7. Integration score is the only exposed meta-score: `100 - resource_chaos`.',
    '',
    'A positive delta increases the named dimension. For protective dimensions such as clarity, consistency, recovery, Prelims nerve, and Mains stamina, higher is generally stronger. For volatility, friction, distraction, chaos, identity fusion, and external pressure, higher indicates greater risk or load.',
    '',
    '## Silent Dimension Baselines',
    '',
    '| Dimension | Baseline | Meaning |',
    '| --- | ---: | --- |',
    ...dimensionRows,
    '',
    '## Archetype Cascade',
    '',
    'The first matching rule wins:',
    '',
    '1. **Comeback Warrior:** stage is `RETURNING` and purpose intensity is at least 75.',
    '2. **Prelims-Trap Scholar:** stage is `PRELIMS_WALL`, attempts are at least 2, cognitive clarity is at least 75, and Prelims nerve is at most 40.',
    '3. **Working-Professional Splitter:** employed and external pressure is at least 60.',
    '4. **Fragmented Maximalist:** resource chaos is at least 80.',
    '5. **First-Flight Idealist:** stage is `FRESH`.',
    '6. Otherwise, the nearest of the five archetype centroids is selected.',
    '',
    'Up to three war-pattern tags are added from explicit flags and score thresholds: Notes Hoarder, Mains Avoider, Newspaper Collector, Revision Collapser, and Strategy Consumer.',
    '',
    '## Report Composition',
    '',
    '| Output | Main evidence |',
    '| --- | --- |',
    '| Cognitive archetype | Stage, attempts, employment, clarity, nerve, pressure, chaos, consistency, recovery, and all silent dimensions. |',
    '| Strengths and vulnerabilities | Repeated behavioural evidence across levels; one answer should not overrule contradictory evidence. |',
    '| Target profile | L2-07 post family, L2-08 rank band, and L2-09 score orientation. Exact numbers are never invented. |',
    '| Emotional vault | L6-08 trigger, corroborated by wounds, comparison, result response, family climate, identity fusion, and pressure. |',
    '| Anchor vault | Human relationship, emotional role, character category, purpose, worst-day return, and embodied anchor effect. |',
    '| Personal laws | L8-06 explicit law plus repeated behavioural leaks from resource, consistency, test, recovery, and operating evidence. |',
    '| Operating profile | L8-07 rhythm combined with employment, available hours, consistency, friction, distraction, recovery, and accountability. |',
    '| Attack plan | Weakest engines, stage, exam-hall behaviour, source pattern, and recovery needs. |',
    '',
    ...Array.from({ length: 8 }, (_, index) => renderLevel((index + 1) as CardLevel)),
    '## Audit Notes',
    '',
    '- All 60 cards are multiple choice.',
    '- Free 40 is curated across all eight levels, not the first 40 in sequence.',
    '- Premium 60 contains every Free 40 card plus 20 deeper-context cards.',
    '- Original 50-card content is fingerprint-protected by automated tests.',
    '- Raw silent scores are not displayed to aspirants.',
    '',
  ].join('\n')
}

mkdirSync(dirname(OUTPUT_PATH), { recursive: true })
writeFileSync(OUTPUT_PATH, buildDocument(), 'utf8')
console.log(`Generated ${OUTPUT_PATH}`)
