# KAUTILYA IAS 60-Card Diagnosis Extension Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the diagnosis from a curated free 30/full 50 model to a curated free 40/full 60 model, then use the added evidence to generate targets, emotional and anchor vaults, personal laws, and an operating profile without changing the original 50 cards.

**Architecture:** Keep the existing eight-level card registry and append ten multiple-choice cards inside L2, L6, L7, and L8. Introduce version-aware diagnosis depths so historical `free30` and `paid50` rows remain readable while new sessions use `free40` and `paid60`; extend the report JSON and read-only Anchor Vault to consume structured evidence from the new answers.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Vitest, Supabase/Postgres, Tailwind CSS, existing AI gateway.

---

## File Map

- `lib/diagnosis/cards.ts`: append the ten approved cards and curate the free 40 IDs.
- `lib/diagnosis/types.ts`: update instrument documentation only; all cards remain the existing `Card` type.
- `lib/report/depth.ts`: own current and historical depth types, normalization, tier predicates, and labels.
- `lib/report/types.ts`: define structured target, emotional-vault, anchor-vault, and operating-profile report fields.
- `lib/report/prompt.ts`: require supported structured output from the added card evidence.
- `lib/report/answers.ts`: continue resolving all multiple-choice answers; no free-text path is introduced.
- `lib/kautilya/anchor.ts`: convert the expanded report into the read-only Anchor Vault view model.
- `app/diagnosis/page.tsx`: select `free40` or `paid60` for new sessions.
- `app/diagnosis/DiagnosisEngine.tsx`: select the new card sets and persist answers by current depth while preserving the existing `router.push` change.
- `app/diagnosis/components/IntroScreen.tsx`: show 40/60 timing and access copy.
- `app/reveal/page.tsx`, `app/reveal/RevealClient.tsx`: normalize all four historical/current depths and show current upgrade copy.
- `app/(dashboard)/report/page.tsx`, `ReportLoader.tsx`, `CommandReport.tsx`: load, render, and upgrade-gate current and historical reports.
- `app/(dashboard)/anchor/page.tsx`: display the generated target profile, emotional vault, anchor vault, laws, and operating profile.
- `app/(dashboard)/upgrade/page.tsx`: update product tier card counts.
- `app/api/generate-report/route.ts`: gate both premium depth versions, merge paid answers correctly, and preserve the existing rate limit.
- `supabase/migrations/kautilya_007_diagnosis_60_depths.sql`: widen database constraints without rewriting historical rows.
- `supabase/schema.sql`: keep the canonical schema aligned with the migration.
- `scripts/test-archetypes.ts`: update acceptance assertions to 40/60.
- `__tests__/diagnosis-instrument.test.ts`: protect counts, IDs, level coverage, multiple-choice-only behavior, and the original 50-card fingerprint.
- `__tests__/report-depth.test.ts`: protect depth normalization and historical compatibility.
- `__tests__/report-prompt.test.ts`: protect new structured report requirements.
- `__tests__/kautilya-anchor.test.ts`: protect expanded Anchor Vault extraction.
- `__tests__/diagnosis-product-copy.test.ts`: protect all user-facing 40/60 product copy.

## Task 1: Lock And Extend The Card Instrument

**Files:**
- Create: `__tests__/diagnosis-instrument.test.ts`
- Modify: `lib/diagnosis/cards.ts`
- Modify: `lib/diagnosis/types.ts`
- Modify: `scripts/test-archetypes.ts`

- [ ] **Step 1: Write the failing instrument test**

Create a test that asserts:

```ts
import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import {
  CARDS,
  FREE_DIAGNOSIS_CARDS,
  PAID_DIAGNOSIS_CARDS,
} from '@/lib/diagnosis/cards'

const LEGACY_IDS = Array.from(
  { length: 8 },
  (_, levelIndex) => {
    const counts = [7, 6, 6, 6, 8, 7, 5, 5]
    return Array.from(
      { length: counts[levelIndex] },
      (_, cardIndex) => `L${levelIndex + 1}-${String(cardIndex + 1).padStart(2, '0')}`,
    )
  },
).flat()

function fingerprint(cards: typeof CARDS): string {
  return createHash('sha256')
    .update(JSON.stringify(cards.map(({ id, level, question, microcopy, input, placeholder, options }) => ({
      id, level, question, microcopy, input, placeholder, options,
    }))))
    .digest('hex')
}

describe('60-card diagnosis instrument', () => {
  it('contains 60 unique premium cards and 40 unique free cards', () => {
    expect(PAID_DIAGNOSIS_CARDS).toHaveLength(60)
    expect(new Set(PAID_DIAGNOSIS_CARDS.map(card => card.id))).toHaveLength(60)
    expect(FREE_DIAGNOSIS_CARDS).toHaveLength(40)
    expect(new Set(FREE_DIAGNOSIS_CARDS.map(card => card.id))).toHaveLength(40)
  })

  it('keeps every card multiple choice', () => {
    expect(CARDS.every(card => card.input !== 'text' && card.options.length >= 2)).toBe(true)
  })

  it('covers all eight levels in the free instrument', () => {
    expect([...new Set(FREE_DIAGNOSIS_CARDS.map(card => card.level))]).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('preserves the original 50 cards byte-for-byte at the data level', () => {
    const legacyCards = CARDS.filter(card => LEGACY_IDS.includes(card.id))
    expect(legacyCards).toHaveLength(50)
    expect(fingerprint(legacyCards)).toBe('5269daaeed5f38af101fd772936cd16f25e5540fef7c4a62dfc5952f585a0fb7')
  })
})
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```powershell
npm test -- __tests__/diagnosis-instrument.test.ts
```

Expected: FAIL because premium has 50 cards and free has 30.

- [ ] **Step 3: Append the ten approved cards**

Add `L2-07` through `L2-09`, `L6-08`, `L7-06` through `L7-09`, and `L8-06` through `L8-07` using the exact questions and options in `docs/superpowers/specs/2026-06-28-diagnosis-60-card-extension-design.md`.

Use only existing dimensions and factual sets:

```ts
// Target cards primarily preserve report evidence. Add only modest purpose/cognitive weights.
// Emotional and anchor cards may weight:
// emotional_volatility, external_pressure, identity_fusion,
// anchor_strength, purpose_intensity, recovery_speed.
// Operating rhythm and personal law may weight:
// cognitive_clarity, execution_friction, marathon_consistency, resource_chaos.
```

Do not modify any existing card object. Do not add `input: 'text'`.

- [ ] **Step 4: Curate the free 40**

Keep every current free ID and add exactly:

```ts
'L2-02', 'L3-04', 'L7-04', 'L8-03',
'L2-07', 'L6-08', 'L7-06', 'L7-09', 'L8-06', 'L8-07',
```

Update comments in `lib/diagnosis/types.ts` and acceptance assertions in `scripts/test-archetypes.ts` to 40/60.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run:

```powershell
npm test -- __tests__/diagnosis-instrument.test.ts __tests__/diagnosis-scoring.test.ts
npm run test:archetypes
```

Expected: all tests and all scripted archetype assertions pass.

- [ ] **Step 6: Commit the instrument**

```powershell
git add -- lib/diagnosis/cards.ts lib/diagnosis/types.ts scripts/test-archetypes.ts __tests__/diagnosis-instrument.test.ts
git commit -m "Expand diagnosis instrument to 60 cards"
```

## Task 2: Add Version-Aware Depth Handling

**Files:**
- Create: `__tests__/report-depth.test.ts`
- Modify: `lib/report/depth.ts`
- Modify: `app/diagnosis/page.tsx`
- Modify: `app/diagnosis/DiagnosisEngine.tsx`
- Modify: `app/diagnosis/components/IntroScreen.tsx`
- Modify: `app/reveal/page.tsx`
- Modify: `app/reveal/RevealClient.tsx`
- Modify: `app/(dashboard)/report/page.tsx`
- Modify: `app/(dashboard)/report/ReportLoader.tsx`
- Modify: `app/(dashboard)/report/CommandReport.tsx`
- Modify: `app/(dashboard)/upgrade/page.tsx`

- [ ] **Step 1: Write the failing depth-domain test**

```ts
import { describe, expect, it } from 'vitest'
import {
  isFreeDepth,
  isPaidDepth,
  normalizeReportDepth,
  reportDepthLabel,
} from '@/lib/report/depth'

describe('report depth compatibility', () => {
  it.each([
    ['free30', 'free30'],
    ['paid50', 'paid50'],
    ['free40', 'free40'],
    ['paid60', 'paid60'],
    ['unknown', 'free40'],
    [null, 'free40'],
  ])('normalizes %s to %s', (input, expected) => {
    expect(normalizeReportDepth(input)).toBe(expected)
  })

  it('groups historical and current depths by access tier', () => {
    expect(['free30', 'free40'].every(isFreeDepth)).toBe(true)
    expect(['paid50', 'paid60'].every(isPaidDepth)).toBe(true)
  })

  it('labels current card counts without losing historical labels', () => {
    expect(reportDepthLabel('free30')).toContain('30-card')
    expect(reportDepthLabel('paid50')).toContain('50-card')
    expect(reportDepthLabel('free40')).toContain('40-card')
    expect(reportDepthLabel('paid60')).toContain('60-card')
  })
})
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```powershell
npm test -- __tests__/report-depth.test.ts
```

Expected: FAIL because `free40`, `paid60`, `isFreeDepth`, and `isPaidDepth` do not exist.

- [ ] **Step 3: Implement the depth domain**

Use:

```ts
export type HistoricalReportDepth = 'free30' | 'paid50'
export type CurrentReportDepth = 'free40' | 'paid60'
export type ReportDepth = HistoricalReportDepth | CurrentReportDepth
export type DiagnosisDepth = CurrentReportDepth

export function isPaidDepth(depth: string | null | undefined): depth is 'paid50' | 'paid60' {
  return depth === 'paid50' || depth === 'paid60'
}

export function isFreeDepth(depth: string | null | undefined): depth is 'free30' | 'free40' {
  return depth === 'free30' || depth === 'free40'
}

export function normalizeReportDepth(value?: string | null): ReportDepth {
  if (value === 'free30' || value === 'paid50' || value === 'free40' || value === 'paid60') return value
  return 'free40'
}
```

Return exact card-count labels for each version.

- [ ] **Step 4: Route all new diagnosis sessions to current depths**

Use `paid ? 'paid60' : 'free40'` in `app/diagnosis/page.tsx`.

In `DiagnosisEngine.tsx`:

- import `DiagnosisDepth` and `isPaidDepth` from `lib/report/depth`
- select paid cards with `isPaidDepth(depth)`
- migrate only the legacy unversioned local-storage key into `free40`
- write `pillar1_data` for free 40 and `paid_extra_data` for paid 60
- preserve the user's existing `useRouter()` and `router.push('/reveal')` changes

- [ ] **Step 5: Update UI depth props and copy**

Replace local unions with `ReportDepth` or `DiagnosisDepth`. Use `isPaidDepth()` to handle historical reports.

Current product copy:

```text
Free: 40 contextual signals, about 8 minutes
Premium: 60 contextual signals, about 11 minutes
Upgrade CTA: Unlock the complete 60-card diagnosis
```

Historical report rendering must continue to accept `free30` and `paid50`.

- [ ] **Step 6: Run tests and typecheck**

Run:

```powershell
npm test -- __tests__/report-depth.test.ts
npm run typecheck
```

Expected: PASS with no TypeScript errors.

- [ ] **Step 7: Commit depth compatibility**

Stage only files changed in this task. Preserve unrelated working-tree edits in `DiagnosisEngine.tsx`.

```powershell
git commit -m "Version diagnosis depths for 40 and 60 cards"
```

## Task 3: Expand The Structured Report Contract

**Files:**
- Create: `__tests__/report-prompt.test.ts`
- Modify: `lib/report/types.ts`
- Modify: `lib/report/prompt.ts`
- Modify: `app/api/generate-report/route.ts`
- Modify: `app/(dashboard)/report/CommandReport.tsx`

- [ ] **Step 1: Write the failing report contract test**

Construct a paid-60 prompt with resolved answers for all ten new IDs and assert that the stable system prompt requires:

```ts
expect(system).toContain('"target_profile"')
expect(system).toContain('"emotional_vault"')
expect(system).toContain('"anchor_vault"')
expect(system).toContain('"operating_profile"')
expect(system).toContain('never invent')
expect(user).toContain('Report depth: paid60')
expect(user).toContain('When you picture the work after selection')
expect(user).toContain('Under real pressure')
```

- [ ] **Step 2: Run the test and verify RED**

```powershell
npm test -- __tests__/report-prompt.test.ts
```

Expected: FAIL because the structured fields are absent.

- [ ] **Step 3: Extend `ReportContent`**

Add:

```ts
target_profile: {
  post: string
  rank: string
  score: string
}
emotional_vault: {
  primary_trigger: string
  pressure_story: string
  protection_rule: string
}
anchor_vault: {
  human_anchor: string
  anchor_role: string
  character_anchor: string
  deepest_motivator: string
  return_point: string
}
operating_profile: {
  rhythm: string
  starts_best_when: string
  sustained_by: string
  disrupted_by: string
  recovery_protocol: string
  protected_environment: string
}
```

Make these fields optional when rendering historical report JSON, either by marking the top-level properties optional or by guarding every renderer.

- [ ] **Step 4: Extend the report prompt**

Require the four objects in the exact JSON schema. Add grounding rules:

```text
- target_profile must preserve the selected bands and must never convert them into invented numbers.
- emotional_vault must be phrased as a preparation pattern, never a medical or psychological diagnosis.
- anchor_vault may combine relationship and role only when both answers support the combination.
- operating_profile must use rhythm plus hours, employment, consistency, friction, recovery, and accountability evidence.
- If evidence is absent in a historical report, use "Not established by this diagnosis" instead of inventing specificity.
```

Treat `paid60` as the deepest current report while retaining `paid50` historical behavior.

- [ ] **Step 5: Update report generation tier checks**

In `app/api/generate-report/route.ts`:

- use `isPaidDepth(depth)` for access checks, answer merging, AI tier, temperature, and token budget
- change the current 403 copy to 60 cards
- preserve the existing `rateLimit` block exactly
- continue querying cached reports by exact depth

- [ ] **Step 6: Render the new report sections**

In `CommandReport.tsx`, add restrained full-width sections for targets, emotional vault, anchor vault, and operating profile. Guard each section so historical reports without the new keys render normally.

Do not nest cards. Use existing `card-calm`, `institutional-surface`, border, grid, and typography conventions.

- [ ] **Step 7: Run focused tests, typecheck, and lint**

```powershell
npm test -- __tests__/report-prompt.test.ts __tests__/diagnosis-instrument.test.ts
npm run typecheck
npm run lint
```

Expected: PASS.

- [ ] **Step 8: Commit the report contract**

```powershell
git commit -m "Generate structured diagnosis vault evidence"
```

## Task 4: Feed The Read-Only Anchor Vault

**Files:**
- Modify: `__tests__/kautilya-anchor.test.ts`
- Modify: `lib/kautilya/anchor.ts`
- Modify: `app/(dashboard)/anchor/page.tsx`

- [ ] **Step 1: Extend the anchor test and verify RED**

Add structured fixture fields and assertions:

```ts
expect(result.targets.post).toBe('IAS: field administration')
expect(result.emotionalVault.primaryTrigger).toBe('Fear that the years amount to nothing')
expect(result.anchorVault.humanAnchor).toBe('Mother')
expect(result.operatingProfile.rhythm).toBe('Quiet repetition')
expect(result.diagnosisLaws[0].name).toBe('Final Source')
```

Also assert stable empty strings for missing historical fields.

Run:

```powershell
npm test -- __tests__/kautilya-anchor.test.ts
```

Expected: FAIL because the extractor does not expose the new groups.

- [ ] **Step 2: Expand `extractAnchorSnapshot`**

Return:

```ts
{
  source: 'diagnosis_report',
  cognitiveArchetype,
  targets: { post, rank, score },
  emotionalVault: {
    primaryTrigger,
    pressureStory,
    protectionRule,
    fightingFor,
    mustProtect,
    mustBecome,
    comebackLine,
  },
  anchorVault: {
    humanAnchor,
    anchorRole,
    characterAnchor,
    deepestMotivator,
    returnPoint,
  },
  operatingProfile: {
    rhythm,
    startsBestWhen,
    sustainedBy,
    disruptedBy,
    recoveryProtocol,
    protectedEnvironment,
  },
  diagnosisLaws,
}
```

Use empty-string defaults so historical reports remain renderable.

- [ ] **Step 3: Replace Anchor page placeholders**

Render:

- target post, rank band, and score orientation
- emotional trigger, pressure story, protection rule, and return line
- human anchor, emotional role, character anchor, motivator, and return point
- operating rhythm, start condition, sustaining mechanism, disruption, recovery, and protected environment
- existing personal laws and report link

Keep the page read-only and preserve the evidence-law message.

- [ ] **Step 4: Run tests and typecheck**

```powershell
npm test -- __tests__/kautilya-anchor.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit Anchor Vault integration**

```powershell
git commit -m "Populate Anchor Vault from diagnosis evidence"
```

## Task 5: Widen Supabase Constraints Without Rewriting History

**Files:**
- Create: `supabase/migrations/kautilya_007_diagnosis_60_depths.sql`
- Modify: `supabase/schema.sql`
- Create: `__tests__/diagnosis-depth-migration.test.ts`

- [ ] **Step 1: Write the failing migration source test**

Read the migration and schema as text, then assert both include:

```text
'none', 'free30', 'paid50', 'free40', 'paid60'
'free30', 'paid50', 'free40', 'paid60', 'mock_result'
```

Also assert the migration contains no statement that updates old depth values to new ones.

- [ ] **Step 2: Run the test and verify RED**

```powershell
npm test -- __tests__/diagnosis-depth-migration.test.ts
```

Expected: FAIL because migration 007 does not exist and the schema constraints lack current depths.

- [ ] **Step 3: Add the additive migration**

Use:

```sql
alter table public.aspirant_profiles
  drop constraint if exists aspirant_profiles_diagnosis_depth_check;

alter table public.aspirant_profiles
  add constraint aspirant_profiles_diagnosis_depth_check
  check (diagnosis_depth in ('none', 'free30', 'paid50', 'free40', 'paid60'));

alter table public.diagnosis_reports
  drop constraint if exists diagnosis_reports_report_depth_check;

alter table public.diagnosis_reports
  add constraint diagnosis_reports_report_depth_check
  check (report_depth in ('free30', 'paid50', 'free40', 'paid60', 'mock_result'));
```

Do not update existing rows.

- [ ] **Step 4: Align `supabase/schema.sql`**

Widen only the two checks. Keep defaults unchanged for bootstrap compatibility unless the surrounding schema requires an explicit new-session default.

- [ ] **Step 5: Run the migration test**

```powershell
npm test -- __tests__/diagnosis-depth-migration.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit the migration**

```powershell
git add -- supabase/migrations/kautilya_007_diagnosis_60_depths.sql supabase/schema.sql __tests__/diagnosis-depth-migration.test.ts
git commit -m "Allow versioned diagnosis report depths"
```

## Task 6: Protect Product Copy And Complete Verification

**Files:**
- Create: `__tests__/diagnosis-product-copy.test.ts`
- Modify only if the test exposes missed copy: diagnosis/reveal/report/upgrade files listed above.

- [ ] **Step 1: Write the product-copy source test**

Assert current user-facing files contain `40-card`/`60-card` or equivalent current count copy and do not advertise `30-card`/`50-card` as the current offer. Historical labels in `lib/report/depth.ts` are explicitly exempt.

- [ ] **Step 2: Run the test and verify RED if any copy was missed**

```powershell
npm test -- __tests__/diagnosis-product-copy.test.ts
```

Expected: PASS after Tasks 1-5, or a focused FAIL identifying stale copy.

- [ ] **Step 3: Correct only stale product copy**

Do not remove historical depth support. Change current offer text only.

- [ ] **Step 4: Run the complete automated verification**

```powershell
npm test
npm run test:archetypes
npm run typecheck
npm run lint
npm run build
```

Expected: every command exits 0.

- [ ] **Step 5: Start or reuse a local dev server**

Use an available port and keep the process running:

```powershell
npm run dev -- --port 3004
```

- [ ] **Step 6: Verify in a real browser**

Check desktop and mobile:

- `/diagnosis` shows the correct 40 or 60 total for the signed-in tier.
- all new cards remain the existing visual design and use radio-style options
- progress counts do not jump or overflow
- long options wrap without horizontal scroll
- completing a diagnosis reaches `/reveal`
- `/report` renders the structured sections when present
- `/anchor` renders the same evidence read-only
- browser console has no errors

- [ ] **Step 7: Inspect the final diff**

```powershell
git diff --check
git status --short
git diff --stat HEAD~5..HEAD
```

Confirm unrelated pre-existing modifications remain unstaged and intact.

- [ ] **Step 8: Commit any final test/copy correction**

```powershell
git commit -m "Verify 40 and 60 card diagnosis experience"
```

- [ ] **Step 9: Push the feature branch**

```powershell
git push origin codex/kautilya-product-shell
```

Record the pushed commit and do not claim production deployment unless Netlify is separately verified.

## Self-Review

- Spec coverage: all ten cards, free 40 curation, premium 60, all-multiple-choice constraint, original-card preservation, structured targets/vaults/laws/operating profile, read-only Anchor integration, historical depths, mobile checks, and production build are assigned to tasks.
- Placeholder scan: every implementation step defines exact IDs, fields, commands, and migration SQL.
- Type consistency: `ReportDepth` owns all four values; `DiagnosisDepth` owns only `free40 | paid60`; `isPaidDepth` is shared across current and historical rendering/generation; report and Anchor field names match between Tasks 3 and 4.
- Dirty-tree safety: Task 2 preserves the existing `useRouter` navigation change; Task 3 preserves the existing report-generation rate limit; commits stage only scoped files.
