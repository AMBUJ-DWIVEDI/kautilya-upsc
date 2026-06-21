# FINDINGS.md — KAUTILYA IAS Code Audit

Audit date: 21 June 2026. Branch: `cursor/kautilya-docs`. Method: full read of `kautilya ias/` application code, migrations, question banks, and tests. No runtime/deploy inspection.

---

## Executive summary

KAUTILYA has a **coherent core loop** (diagnosis → hidden scores → reveal → AI report → daily command → mock repair) with strong rule-based scoring and a well-structured mock catalog. The **Long War dashboard UI is ahead of its data layer**: weekly command intelligence is hardcoded, resource sources are never populated, and several repair surfaces are explicitly “coming soon.” Production AI and Netlify configuration carry **operational debt** that will break reports in deploy if keys/URLs are wrong.

---

## P0 — User-visible fidelity gaps

### 1. Live faked intelligence in `LongWarDashboard` (`demo-data.ts`)

**Evidence:**

```70:70:kautilya ias/components/kautilya/LongWarDashboard.tsx
  const weeklyCommand = deriveWeeklyCommand('Resource chaos')
```

```5:14:kautilya ias/lib/kautilya/demo-data.ts
export function deriveWeeklyCommand(primaryLeak: string): WeeklyCommand {
  return {
    weekSignal: 'Integration debt is the dominant front.',
    primaryLeak,
    doMore: ['One Smart Note repair', 'One answer rewrite', 'Close two open loops'],
    ...
  }
}
```

**Impact:** Every diagnosed user sees the same weekly focus regardless of `weekly_reviews`, mock leaks, or sealed-command history. `lib/weekly/review.ts` already generates real `WeeklyReviewRow` data (integration score, wins, verdict) but **nothing on the dashboard consumes it**.

**Also hardcoded on dashboard:**

- `stagePattern` default `'PRELIMS_WALL'` in props destructuring (server passes real value, but default masks missing data).
- Operating profile copy: `Primary leak: resource chaos` — static string, not derived from war pattern tags or latest mock.
- `ResourceState.sources` always `[]` — integration score displays, but resource map always shows empty-state UX.

**Recommendation:** Wire `WeeklyCommandCard` to `generateWeeklyReviewForUser()` or a thin mapper from `weekly_reviews` + latest `test_attempts.weak_topics`. Replace `deriveWeeklyCommand` with server-fetched props.

---

### 2. `KautilyaErrorState` — defined, never used

**Evidence:** `components/kautilya/KautilyaErrorState.tsx` exists (tracks `kautilya_data_load_failed`, retry button). Grep shows **zero imports** outside its own file.

**Contrast:** Error paths today use ad-hoc markup:

- `ReportLoader.tsx` — inline error div + reload button (not `KautilyaErrorState`).
- `LongWarDashboard` / `dashboard/page.tsx` — no error boundary if `user_dashboard_summary` or `getOrCreateTodayCommand` fails.
- `TestEngine` submit failure — `console.error` only.

**Impact:** Inconsistent error UX; institutional “signal interrupted” copy and analytics event never fire.

**Recommendation:** Use `KautilyaErrorState` in `ReportLoader`, dashboard data-fetch failure wrapper, and mock submit errors.

---

### 3. `types/kautilya.ts` — fragmented type surface

**Current state:** File **exists** at `types/kautilya.ts` (37 lines):

- `Source`, `SourceRole`, `ResourceState`, `LongWarDiagnosis`, `WeeklyCommand`

**Problem (why it was flagged “absent”):** UI components were built importing `@/types/kautilya` before this file was a complete domain module. Types remain **split across five locations**:

| Location | Owns |
|----------|------|
| `lib/diagnosis/types.ts` | Dimensions, cards, HiddenScores, archetypes |
| `lib/report/types.ts` | ReportContent |
| `lib/command/types.ts` | DailyCommandRow, CommandThread |
| `lib/mock/types.ts` | PrelimsQuestion, MockResult |
| `types/kautilya.ts` | Narrow UI subset only |

`SourceReductionCard.tsx` still carries `/** @deprecated Use Source from @/types/kautilya */` — suggests local types predated the shared file.

**Impact:** No single import for “Kautilya domain”; agents and humans must discover types per feature. `LongWarDiagnosis` interface in `types/kautilya.ts` is unused in components (dashboard uses inline props).

**Recommendation:** Either expand `types/kautilya.ts` as a re-export barrel or document permanently that domain types live under `lib/*/types.ts`.

---

### 4. Invalid / missing Netlify `GROQ_API_KEY` debt

**Evidence:**

| Source | Finding |
|--------|---------|
| `netlify.toml` | No `GROQ_API_KEY` or env documentation — only `NODE_VERSION` and Next plugin |
| `.env.local.example` | Documents `GROQ_API_KEY=gsk_your_groq_key_here` placeholder |
| `scripts/generate-smart-notes.mjs` | Rejects keys containing `your_groq_key` |
| `lib/ai/gateway.ts` | `availableChain()` drops Groq if key missing; empty chain → `GatewayError` |
| `app/api/generate-report/route.ts` | Returns **502** `"AI generation failed"` on gateway failure |
| `lib/notes/generator.ts` | Throws `'GROQ_API_KEY not set'` (separate from gateway) |

**URL drift (compounds auth/report issues):**

| File | URL |
|------|-----|
| `lib/config.ts` default | `https://kautilyaias.netlify.app` |
| `.env.local.example` comment | `https://kautilyaupsc.netlify.app` |
| `BUILD_CHRONICLE.md` runbook | Still references `chanakyassc.netlify.app` (SSC copy-paste) |

**Impact:** Deploying to Netlify without a **valid** Groq key breaks `/report` and admin note generation. Mismatched `NEXT_PUBLIC_SITE_URL` vs Supabase Auth redirect causes login callback failures independent of Groq.

**Recommendation:** Netlify checklist: valid `GROQ_API_KEY`, aligned `NEXT_PUBLIC_SITE_URL`, Supabase redirect whitelist, optional `GEMINI_API_KEY` as failover. Update `BUILD_CHRONICLE.md` for KAUTILYA-specific URLs.

---

## P1 — Architecture / data gaps

### 5. Resource map never activates

`ResourceChaosMap` renders `KautilyaEmptyState` when `sources.length === 0`. Dashboard always passes empty `sources`. No API or diagnosis card persistence maps L4 resource answers into `Source[]` rows.

**Impact:** “Resource Integration” section shows integration score in sidebar metrics but map section stays in “name your sources” empty state forever.

### 6. Question bank coverage vs catalog

- Catalog: **100 gates** in `MOCK_CATALOG`.
- Banks on disk: **3 files** (`paper-01`, `paper-02`, `paper-03`).
- Gates 4+ show friendly “still being inked” UI (`mock/gate/[gate]/page.tsx`).

**Minor metadata bug:** `paper-02.json` header says `"paper": 1` while it serves gate 2.

### 7. `mock_tests` DB dependency

`/api/mock/submit` requires a `mock_tests` row for the gate (`404` if missing). JSON bank alone is insufficient. Seeds must stay in sync with `MOCK_CATALOG` via migrations.

### 8. Dual AI paths for notes

- Reports: `lib/ai/gateway.ts` (tiered failover).
- Admin notes: `lib/notes/generator.ts` (direct Groq `fetch`, no gateway).

Different error handling and model config — maintenance hazard.

### 9. `ReportLoader` vs background generation race

Diagnosis fires `fetch('/api/generate-report')` without awaiting. User may hit `/report` before cache exists → `ReportLoader` POSTs again (idempotent cache helps, but doubles load on cold start).

### 10. `KautilyaCommandPalette` hash targets

Palette links to `#resource-map`, `#source-reduction`, etc. `ResourceChaosMap` uses `id="resource-map"` but empty-state path never shows the scored map UI. Several anchors land on empty or coming-soon sections.

---

## P2 — Documentation / repo hygiene

### 11. README was stock `create-next-app`

Replaced in this audit with product README. **BUILD_CHRONICLE.md** remains SSC-oriented (chanakyassc URLs, SSC archetypes, Gate 1–6 SSC content).

### 12. `CLAUDE.md` was a one-line pointer

Previously only `@AGENTS.md`. Replaced with KAUTILYA-specific agent guide.

### 13. `AGENTS.md` is Next.js 16 generic warning only

No KAUTILYA product context (intentionally minimal).

---

## What is solid (no action required for audit)

| Area | Notes |
|------|-------|
| Diagnosis scoring | Tested in `__tests__/diagnosis-scoring.test.ts`; `integrationScore` inversion documented |
| Archetype cascade | Tested; V11 routing for non-launch wounds |
| Mock scoring | Guessing discipline + elimination analytics; `examShapeForGate` tested |
| Exam config centralization | `APP.exam` in `lib/config.ts`; catalog/scoring respect it |
| Command idempotency | UNIQUE `(user_id, command_date)`, re-entry detection, IST dates |
| Client/server mock split | Answers stripped before `TestEngine`; scored server-side |
| RLS migrations | `kautilya_002_rls_hardening.sql`, `003_schema_drift.sql` for dashboard view |
| UI motion accessibility | `use-reduced-motion` + `createKautilyaMotion` |

---

## Test coverage map

| File | Covers |
|------|--------|
| `__tests__/diagnosis-scoring.test.ts` | `integrationScore`, `deriveOutcome`, attempt pressure |
| `__tests__/mock-scoring.test.ts` | `examShapeForGate`, `paperKindForGate`, CSAT vs GS |
| `__tests__/question-bank.test.ts` | Bank JSON schema validation |
| `__tests__/command-generate.test.ts` | `todayDateString`, thread building |

**Not covered:** `LongWarDashboard`, `demo-data.ts`, AI gateway, report prompt output, E2E auth/mock flows.

---

## Suggested fix order

1. **Netlify env** — valid `GROQ_API_KEY`, unified site URL, Supabase redirects.
2. **Weekly command** — replace `deriveWeeklyCommand` with `weekly_reviews` data.
3. **Resource sources** — persist L4 diagnosis answers → `Source[]` (table or JSON on profile).
4. **Wire `KautilyaErrorState`** — report loader, dashboard, mock submit.
5. **Type barrel** — consolidate or document `types/kautilya.ts` vs `lib/*/types.ts`.
6. **Question banks** — content pipeline for gates 4–50 or reduce catalog until ready.

---

## Files touched in this documentation pass

| File | Action |
|------|--------|
| `CLAUDE.md` | Rewritten — agent guide |
| `ARCHITECTURE.md` | Created |
| `README.md` | Replaced boilerplate |
| `FINDINGS.md` | Created (this file) |

No application code changed per audit scope.
