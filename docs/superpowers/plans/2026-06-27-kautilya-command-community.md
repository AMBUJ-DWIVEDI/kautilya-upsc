# KAUTILYA Command And Community Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the complete KAUTILYA landing page plus authenticated Command, Anchor, composite Leaderboard, and persistent moderated Forum.

**Architecture:** Keep Next.js App Router pages server-first and move reusable domain rules into pure TypeScript modules. Supabase owns persistence and row-level security; authenticated mutations run through route handlers that re-check identity and validate with Zod. Shared shell metadata, analytics, and landing/profile content remain centralized.

**Tech Stack:** Next.js 16.2 App Router, React 19.2, TypeScript, Tailwind CSS 4, Supabase SSR/Postgres/RLS, Zod 4, Framer Motion, Lucide React, Vitest.

---

## File Map

Create:

- `lib/kautilya/landing.ts`: landing sections and ten-profile copy.
- `lib/kautilya/leaderboard.ts`: composite score normalization and factor types.
- `lib/kautilya/anchor.ts`: Anchor data types and report extraction.
- `lib/kautilya/forum.ts`: forum types, schemas, and permission helpers.
- `components/kautilya/landing/KautilyaLandingPage.tsx`: landing composition.
- `components/kautilya/landing/KautilyaProfileIndex.tsx`: interactive profile dossier.
- `components/kautilya/landing/KautilyaProductPreview.tsx`: real product mechanism preview.
- `components/kautilya/anchor/AnchorEditor.tsx`: editable targets, anchors, and laws.
- `components/kautilya/leaderboard/LeaderboardTable.tsx`: rank factor presentation and filters.
- `components/kautilya/forum/ForumComposer.tsx`: create-thread form.
- `components/kautilya/forum/ReplyComposer.tsx`: reply form.
- `components/kautilya/forum/ForumModerationMenu.tsx`: report/delete/hide actions.
- `app/(dashboard)/leaderboard/page.tsx`: authenticated leaderboard.
- `app/(dashboard)/forum/[threadId]/page.tsx`: thread and reply view.
- `app/api/anchor/route.ts`: owner-only Anchor update.
- `app/api/forum/threads/route.ts`: create thread.
- `app/api/forum/threads/[threadId]/route.ts`: delete/report/hide thread.
- `app/api/forum/threads/[threadId]/replies/route.ts`: create reply.
- `app/api/forum/replies/[replyId]/route.ts`: delete/report/hide reply.
- `supabase/migrations/kautilya_006_anchor_leaderboard_forum.sql`: persistence, RLS, rank view, seeded rooms.
- `__tests__/kautilya-landing.test.ts`: profile completeness.
- `__tests__/kautilya-leaderboard.test.ts`: rank math.
- `__tests__/kautilya-anchor.test.ts`: extraction and boundaries.
- `__tests__/kautilya-forum.test.ts`: validation and permissions.

Modify:

- `app/page.tsx`: render the new landing composition.
- `app/(dashboard)/anchor/page.tsx`: load report and Anchor state.
- `app/(dashboard)/forum/page.tsx`: load persisted rooms and threads.
- `app/(dashboard)/kautilya/command/page.tsx`: load authenticated command data.
- `components/kautilya/command/KautilyaCommandShell.tsx`: accept server data and persist seal/review.
- `components/kautilya/KautilyaAppShell.tsx`: render new shell icons.
- `components/kautilya/KautilyaCommandPalette.tsx`: render new shell icons.
- `lib/kautilya/shell.ts`: add Leaderboard and complete briefs/actions.
- `lib/kautilya/events.ts`: add landing, Anchor, leaderboard, and forum events.
- `app/globals.css`: landing and authenticated surface primitives.
- `supabase/migrations/kautilya_005_commands.sql`: retain as the command schema prerequisite.

## Task 1: Lock Landing And Rank Domain Rules

**Files:**
- Create: `__tests__/kautilya-landing.test.ts`
- Create: `__tests__/kautilya-leaderboard.test.ts`
- Create: `lib/kautilya/landing.ts`
- Create: `lib/kautilya/leaderboard.ts`

- [ ] **Step 1: Write failing profile and rank tests**

```ts
import { describe, expect, it } from 'vitest'
import { KAUTILYA_PROFILES } from '@/lib/kautilya/landing'
import { calculateKautilyaRank } from '@/lib/kautilya/leaderboard'

describe('KAUTILYA profiles', () => {
  it('defines ten complete and unique aspirant profiles', () => {
    expect(KAUTILYA_PROFILES).toHaveLength(10)
    expect(new Set(KAUTILYA_PROFILES.map(profile => profile.id)).size).toBe(10)
    for (const profile of KAUTILYA_PROFILES) {
      expect(profile.seenLanguage.length).toBeGreaterThan(20)
      expect(profile.needs.length).toBeGreaterThanOrEqual(4)
      expect(profile.offer.length).toBeGreaterThan(5)
    }
  })
})

describe('calculateKautilyaRank', () => {
  it('uses the approved 30/25/20/15/10 weighting', () => {
    expect(calculateKautilyaRank({
      mockPerformance: 80,
      commandConsistency: 60,
      integration: 70,
      answerWriting: 40,
      recovery: 90,
    })).toBe(68)
  })

  it('clamps every factor before weighting', () => {
    expect(calculateKautilyaRank({
      mockPerformance: 150,
      commandConsistency: -20,
      integration: 100,
      answerWriting: 100,
      recovery: 100,
    })).toBe(75)
  })
})
```

- [ ] **Step 2: Run tests and verify missing-module failures**

Run: `npm test -- __tests__/kautilya-landing.test.ts __tests__/kautilya-leaderboard.test.ts`

Expected: FAIL because `lib/kautilya/landing.ts` and `lib/kautilya/leaderboard.ts` do not exist.

- [ ] **Step 3: Implement pure profile and ranking modules**

```ts
export interface KautilyaRankFactors {
  mockPerformance: number
  commandConsistency: number
  integration: number
  answerWriting: number
  recovery: number
}

const clamp = (value: number) => Math.max(0, Math.min(100, value))

export function calculateKautilyaRank(factors: KautilyaRankFactors): number {
  return Math.round(
    clamp(factors.mockPerformance) * 0.3 +
    clamp(factors.commandConsistency) * 0.25 +
    clamp(factors.integration) * 0.2 +
    clamp(factors.answerWriting) * 0.15 +
    clamp(factors.recovery) * 0.1,
  )
}
```

Define all ten approved profiles in `landing.ts` with `id`, `name`, `whoTheyAre`, `innerSentence`, `seenLanguage`, `needs`, `offer`, and `marketBlindSpot`.

- [ ] **Step 4: Run focused tests**

Run: `npm test -- __tests__/kautilya-landing.test.ts __tests__/kautilya-leaderboard.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit domain rules**

```powershell
git add -- __tests__/kautilya-landing.test.ts __tests__/kautilya-leaderboard.test.ts lib/kautilya/landing.ts lib/kautilya/leaderboard.ts
git commit -m "Add KAUTILYA audience and rank rules"
```

## Task 2: Add Anchor, Leaderboard, And Forum Persistence

**Files:**
- Create: `supabase/migrations/kautilya_006_anchor_leaderboard_forum.sql`
- Create: `lib/kautilya/anchor.ts`
- Create: `lib/kautilya/forum.ts`
- Create: `__tests__/kautilya-anchor.test.ts`
- Create: `__tests__/kautilya-forum.test.ts`

- [ ] **Step 1: Write failing extraction, validation, and permission tests**

```ts
import { describe, expect, it } from 'vitest'
import { extractAnchorSnapshot } from '@/lib/kautilya/anchor'
import { canModerateForum, forumThreadInput } from '@/lib/kautilya/forum'

describe('extractAnchorSnapshot', () => {
  it('extracts report anchors without making them editable', () => {
    const result = extractAnchorSnapshot({
      archetype: 'Fragmented Maximalist',
      anchor_card: {
        fighting_for: 'Family',
        must_protect: 'Health',
        must_prove: 'Consistency',
        must_become: 'A calm administrator',
        biggest_enemy: 'Expansion',
        daily_command: 'Reduce one source',
        warning: 'Do not collect',
        comeback_line: 'Return to one page',
      },
      personal_laws: [{ law_name: 'Final Source', law: 'One source speaks', detail: 'Revise before adding' }],
    })
    expect(result.cognitiveArchetype).toBe('Fragmented Maximalist')
    expect(result.emotionalVault.fightingFor).toBe('Family')
    expect(result.source).toBe('diagnosis_report')
  })
})

describe('forum rules', () => {
  it('rejects empty and oversized threads', () => {
    expect(forumThreadInput.safeParse({ roomId: 'x', title: '', body: '' }).success).toBe(false)
    expect(forumThreadInput.safeParse({
      roomId: '00000000-0000-0000-0000-000000000000',
      title: 'A'.repeat(141),
      body: 'Valid body',
    }).success).toBe(false)
  })

  it('allows admins to moderate and denies ordinary members', () => {
    expect(canModerateForum('admin@example.com', 'admin@example.com')).toBe(true)
    expect(canModerateForum('member@example.com', 'admin@example.com')).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests and verify failures**

Run: `npm test -- __tests__/kautilya-anchor.test.ts __tests__/kautilya-forum.test.ts`

Expected: FAIL because the modules do not exist.

- [ ] **Step 3: Implement domain types and Zod schemas**

Implement `extractAnchorSnapshot(report: Partial<ReportContent>)`, `forumThreadInput`, `forumReplyInput`, `forumReportInput`, and:

```ts
export function canModerateForum(email: string | null | undefined, adminEmail: string | undefined) {
  return Boolean(email && adminEmail && email === adminEmail)
}
```

Use title length `4..140`, thread body `10..5000`, reply body `2..3000`, and report reason `4..500`.

- [ ] **Step 4: Create the idempotent migration**

The migration must:

- create owner-only `kautilya_anchor_profiles`
- add `leaderboard_display_name` and `leaderboard_visible` to `aspirant_profiles`
- create forum rooms, threads, replies, and reports with timestamps and hidden/deleted fields
- seed the seven approved forum rooms with stable slugs
- enable RLS on all new tables
- allow authenticated users to read visible forum content
- allow owners to insert/update their Anchor and own forum content
- allow reports only from the reporting user
- expose `kautilya_leaderboard` as a `security_invoker` view with only display-safe columns and approved weighted factors

The SQL composite expression must match:

```sql
round(
  mock_performance * 0.30 +
  command_consistency * 0.25 +
  integration * 0.20 +
  answer_writing * 0.15 +
  recovery * 0.10
)::int as kautilya_rank_score
```

- [ ] **Step 5: Run focused tests and SQL static checks**

Run: `npm test -- __tests__/kautilya-anchor.test.ts __tests__/kautilya-forum.test.ts`

Run: `rg -n "ENABLE ROW LEVEL SECURITY|security_invoker|kautilya_rank_score" supabase/migrations/kautilya_006_anchor_leaderboard_forum.sql`

Expected: tests PASS and each required SQL guard is present.

- [ ] **Step 6: Commit persistence**

```powershell
git add -- supabase/migrations/kautilya_006_anchor_leaderboard_forum.sql lib/kautilya/anchor.ts lib/kautilya/forum.ts __tests__/kautilya-anchor.test.ts __tests__/kautilya-forum.test.ts
git commit -m "Add KAUTILYA anchor rank and forum schema"
```

## Task 3: Rebuild The Public Landing Page

**Files:**
- Create: `components/kautilya/landing/KautilyaLandingPage.tsx`
- Create: `components/kautilya/landing/KautilyaProfileIndex.tsx`
- Create: `components/kautilya/landing/KautilyaProductPreview.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Add a render contract test**

Extend `__tests__/kautilya-landing.test.ts` to assert that every profile offer maps to a non-empty route and that landing section IDs are unique.

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- __tests__/kautilya-landing.test.ts`

Expected: FAIL until route and section metadata are added.

- [ ] **Step 3: Implement the landing composition**

Build semantic sections for Hero, Problem, Why KAUTILYA, Profiles, Workflow, Product Preview, Belief, Early Access, and Final CTA. Use the approved copy and actual routes. Keep the H1 literal:

```tsx
<h1>
  The syllabus is visible.
  <span>The real enemy is hidden.</span>
</h1>
```

Use Lucide icons, existing `Seal`, paper surfaces, restrained motion, and a mobile sticky diagnosis CTA. Do not add nested cards or decorative SVG assets.

- [ ] **Step 4: Implement the interactive profile index**

`KautilyaProfileIndex` owns only selected-profile state. Desktop renders a ten-item rail and one dossier; mobile renders accessible disclosure buttons with `aria-expanded`.

- [ ] **Step 5: Run tests and typecheck**

Run: `npm test -- __tests__/kautilya-landing.test.ts`

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 6: Commit the landing page**

```powershell
git add -- app/page.tsx app/globals.css components/kautilya/landing lib/kautilya/landing.ts __tests__/kautilya-landing.test.ts
git commit -m "Build KAUTILYA institutional landing page"
```

## Task 4: Connect The Command Center To Authenticated Data

**Files:**
- Modify: `app/(dashboard)/kautilya/command/page.tsx`
- Modify: `components/kautilya/command/KautilyaCommandShell.tsx`
- Modify: `lib/kautilya/deriveKautilyaCommand.ts`
- Modify: `lib/kautilya/commandTemplates.ts`
- Create: `app/api/kautilya-command/route.ts`
- Create: `__tests__/kautilya-command.test.ts`

- [ ] **Step 1: Write failing command mapping tests**

Test database row to `KautilyaCommand` conversion, source-reduction priority, recovery priority, and empty input behavior.

- [ ] **Step 2: Run tests and verify failure**

Run: `npm test -- __tests__/kautilya-command.test.ts`

Expected: FAIL until row mapping and input fallback exist.

- [ ] **Step 3: Load or derive the active command server-side**

The page must authenticate, query the latest active weekly command, and derive one only when diagnosis signals exist. Pass `initialCommand` and `initialReviews` into the client shell. Render `CommandEmptyState` when no diagnosis signals exist.

- [ ] **Step 4: Add authenticated command mutations**

`PATCH /api/kautilya-command` accepts:

```ts
type CommandMutation =
  | { action: 'seal'; commandId: string }
  | { action: 'complete'; commandId: string }
  | { action: 'review'; commandId: string; tomorrowFirstMove: string; whatMoved?: string; whatLeaked?: string }
```

Validate ownership on every update and persist `sealed_at`, `completed_at`, or a review row.

- [ ] **Step 5: Replace mock state in the shell**

Accept server data as props, use optimistic sealed/completed state with rollback on error, preserve review text after failures, and fire analytics only after successful persistence.

- [ ] **Step 6: Run command tests and typecheck**

Run: `npm test -- __tests__/kautilya-command.test.ts __tests__/command-generate.test.ts`

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 7: Commit Command persistence**

```powershell
git add -- "app/(dashboard)/kautilya/command/page.tsx" app/api/kautilya-command components/kautilya/command lib/kautilya/commandTemplates.ts lib/kautilya/commandTypes.ts lib/kautilya/deriveKautilyaCommand.ts __tests__/kautilya-command.test.ts supabase/migrations/kautilya_005_commands.sql
git commit -m "Connect KAUTILYA Command to live signals"
```

## Task 5: Build The Private Anchor Dossier

**Files:**
- Modify: `app/(dashboard)/anchor/page.tsx`
- Create: `components/kautilya/anchor/AnchorEditor.tsx`
- Create: `app/api/anchor/route.ts`
- Modify: `lib/kautilya/events.ts`

- [ ] **Step 1: Extend Anchor tests with update boundaries**

Assert that target score/rank/post, user anchor arrays, and personal laws are writable while diagnosis snapshot keys are rejected by the update schema.

- [ ] **Step 2: Run the test and verify failure**

Run: `npm test -- __tests__/kautilya-anchor.test.ts`

Expected: FAIL until `anchorUpdateInput` is implemented.

- [ ] **Step 3: Load and compose the dossier**

In the server page, fetch authenticated user, dashboard summary, latest diagnosis report, and `kautilya_anchor_profiles` in parallel. Extract a read-only report snapshot and pass editable values to `AnchorEditor`.

- [ ] **Step 4: Implement the owner-only update endpoint**

Validate `anchorUpdateInput`, force `user_id` from the session, and upsert only approved editable columns. Return the normalized saved payload.

- [ ] **Step 5: Implement accessible edit states**

Use labeled inputs for target score/rank/post, repeatable text inputs for family/friend and character anchors, and repeatable laws. Save explicitly, disable while pending, preserve unsaved content after errors, and announce success via the existing toast system.

- [ ] **Step 6: Test and commit**

Run: `npm test -- __tests__/kautilya-anchor.test.ts`

Run: `npm run typecheck`

```powershell
git add -- "app/(dashboard)/anchor/page.tsx" app/api/anchor components/kautilya/anchor lib/kautilya/anchor.ts lib/kautilya/events.ts __tests__/kautilya-anchor.test.ts
git commit -m "Build private KAUTILYA Anchor dossier"
```

## Task 6: Build The Composite Leaderboard

**Files:**
- Create: `app/(dashboard)/leaderboard/page.tsx`
- Create: `components/kautilya/leaderboard/LeaderboardTable.tsx`
- Modify: `lib/kautilya/shell.ts`
- Modify: `lib/kautilya/events.ts`

- [ ] **Step 1: Extend rank tests with coverage state**

Test `getRankConfidence` returns `provisional` below three populated factors and `established` at three or more.

- [ ] **Step 2: Run and verify failure**

Run: `npm test -- __tests__/kautilya-leaderboard.test.ts`

Expected: FAIL until confidence logic exists.

- [ ] **Step 3: Query only the restricted leaderboard view**

Load visible rows ordered by composite score and the current user's private row separately. Never select from private Anchor or diagnosis tables for public rows.

- [ ] **Step 4: Render the calibrated board**

Show rank, privacy-safe display name, composite score, factor breakdown, confidence state, and current-user position. Add `This week`, `30 days`, and `All time` controls; unsupported periods remain disabled rather than pretending to filter.

- [ ] **Step 5: Test and commit**

Run: `npm test -- __tests__/kautilya-leaderboard.test.ts`

Run: `npm run typecheck`

```powershell
git add -- "app/(dashboard)/leaderboard/page.tsx" components/kautilya/leaderboard lib/kautilya/leaderboard.ts lib/kautilya/shell.ts lib/kautilya/events.ts __tests__/kautilya-leaderboard.test.ts
git commit -m "Add transparent KAUTILYA leaderboard"
```

## Task 7: Build Persistent Forum Threads And Replies

**Files:**
- Modify: `app/(dashboard)/forum/page.tsx`
- Create: `app/(dashboard)/forum/[threadId]/page.tsx`
- Create: `components/kautilya/forum/ForumComposer.tsx`
- Create: `components/kautilya/forum/ReplyComposer.tsx`
- Create: `components/kautilya/forum/ForumModerationMenu.tsx`
- Create: `app/api/forum/threads/route.ts`
- Create: `app/api/forum/threads/[threadId]/route.ts`
- Create: `app/api/forum/threads/[threadId]/replies/route.ts`
- Create: `app/api/forum/replies/[replyId]/route.ts`
- Modify: `lib/kautilya/events.ts`

- [ ] **Step 1: Extend forum tests with mutation authorization**

Cover author delete, non-author denial, admin hide/restore, duplicate report rejection, and normalized plain-text output.

- [ ] **Step 2: Run and verify failure**

Run: `npm test -- __tests__/kautilya-forum.test.ts`

Expected: FAIL until authorization helpers are complete.

- [ ] **Step 3: Implement thread and reply creation**

Authenticate, apply the existing rate-limit helper, validate Zod input, and insert using the session user ID. Return `201` with the created row; return `400`, `401`, `403`, `404`, or `429` without leaking private row details.

- [ ] **Step 4: Implement report/delete/moderation mutations**

Authors set `deleted_at`; admins set or clear `hidden_at`; authenticated non-authors can submit one report per target. All moderator checks use `ADMIN_EMAIL` server-side.

- [ ] **Step 5: Implement the forum index and thread pages**

The index loads rooms, visible threads, reply counts, and create-thread form. The thread page awaits `params`, loads visible replies, and provides reply/report/delete/hide controls based on ownership and moderator status.

- [ ] **Step 6: Test and commit**

Run: `npm test -- __tests__/kautilya-forum.test.ts`

Run: `npm run typecheck`

```powershell
git add -- "app/(dashboard)/forum" app/api/forum components/kautilya/forum lib/kautilya/forum.ts lib/kautilya/events.ts __tests__/kautilya-forum.test.ts
git commit -m "Add persistent moderated KAUTILYA forum"
```

## Task 8: Complete Shared Navigation And Analytics

**Files:**
- Modify: `lib/kautilya/shell.ts`
- Modify: `components/kautilya/KautilyaAppShell.tsx`
- Modify: `components/kautilya/KautilyaCommandPalette.tsx`
- Modify: `lib/kautilya/events.ts`
- Modify: `__tests__/kautilya-shell.test.ts`

- [ ] **Step 1: Write failing shell coverage assertions**

Assert that `/kautilya/command`, `/anchor`, `/leaderboard`, and `/forum` each appear once, have route briefs, and are returned by command-palette flattening.

- [ ] **Step 2: Run and verify failure**

Run: `npm test -- __tests__/kautilya-shell.test.ts`

Expected: FAIL because Leaderboard is absent or route metadata is incomplete.

- [ ] **Step 3: Complete central shell configuration**

Add Leaderboard with a Lucide trophy icon, keep Command first, and place Anchor, Leaderboard, and Forum in groups matching their product role. Add route briefs and searchable hints.

- [ ] **Step 4: Complete privacy-safe analytics events**

Add profile viewed/offer clicked, Anchor viewed/saved, leaderboard viewed/period changed, forum thread/reply/report/delete/moderate, and command mutation events. Event props contain IDs, slugs, counts, and status only, never user-authored text.

- [ ] **Step 5: Run shell tests and typecheck**

Run: `npm test -- __tests__/kautilya-shell.test.ts`

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 6: Commit shell integration**

```powershell
git add -- lib/kautilya/shell.ts lib/kautilya/events.ts components/kautilya/KautilyaAppShell.tsx components/kautilya/KautilyaCommandPalette.tsx __tests__/kautilya-shell.test.ts
git commit -m "Integrate KAUTILYA command community navigation"
```

## Task 9: Full Verification And Visual QA

**Files:**
- Modify only files implicated by verification failures.

- [ ] **Step 1: Run all tests**

Run: `npm test`

Expected: all suites PASS.

- [ ] **Step 2: Run static verification**

Run: `npm run typecheck`

Run: `npm run lint`

Run: `npm run build`

Expected: typecheck and build PASS. Record pre-existing lint failures separately; fix only failures introduced by this work.

- [ ] **Step 3: Start the development server**

Run: `npm run dev -- --port 3003`

Expected: server reports ready at `http://localhost:3003`.

- [ ] **Step 4: Verify public and authenticated flows in the browser**

At desktop and mobile widths, verify:

- landing hero, all ten profiles, CTAs, and no overlap
- login redirect for all authenticated routes
- Command empty/live/sealed/review states
- Anchor read/edit/save/error states
- Leaderboard public/private/provisional states
- Forum create thread, open thread, reply, report, author delete, and moderator hide/restore
- no browser console errors

- [ ] **Step 5: Compare screenshots and fix visible regressions**

Check spacing, typography, borders, wrapping, focus states, mobile sticky actions, and interaction feedback against the approved ivory/navy/bronze direction.

- [ ] **Step 6: Run the final verification set**

Run: `npm test && npm run typecheck && npm run build`

Expected: PASS.
