# CLAUDE.md — KAUTILYA IAS

Agent guide for the **KAUTILYA UPSC** app (`kautilya-upsc-app`). Sibling product of CHANAKYA SSC; same architectural lineage, UPSC-specific exam shapes and copy.

## What this app is

A **diagnosis-first command system** for UPSC CSE aspirants:

1. **Diagnosis** — 30-card Scout (free) or 50-card deep scan (paid) → silent dimension scores → archetype reveal.
2. **Report** — AI narrative (`/report`) layered on rule-based scores via `lib/ai/gateway.ts`.
3. **Daily command** — server-generated threads (`lib/command/generate.ts`) the dashboard never asks you to plan.
4. **Mock arena** — Prelims GS-I / CSAT baselines + 97 gated papers; scoring in `lib/mock/scoring.ts`.
5. **Repair library** — Smart Notes (`/notes`) with spaced revision.

**Prime directive:** exam-shaped values live in `lib/config.ts` (`APP.exam`). Do not hardcode marks, negatives, or question counts elsewhere.

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router), React 19 |
| DB / Auth | Supabase (Postgres + email OTP) |
| AI | Groq (free tier default) → Gemini/OpenAI failover (`lib/ai/gateway.ts`) |
| Payments | Razorpay |
| Deploy | Netlify (`netlify.toml`, `@netlify/plugin-nextjs`) |
| Motion | Framer Motion (`components/kautilya/motion.ts`, `use-reduced-motion`) |
| Tests | Vitest (`__tests__/`) |

## Repo layout (high-signal paths)

```
app/
  page.tsx                    # Landing
  diagnosis/                  # DiagnosisEngine + flashcard UI
  reveal/                     # Archetype ceremony (reads localStorage first)
  (dashboard)/                # Authenticated shell: dashboard, mock, report, notes, log
  api/
    generate-report/          # AI command diagnosis (cached in diagnosis_reports)
    mock/submit/              # Server-side scoring + test_attempts insert
    command/                  # GET/POST daily command seal
lib/
  config.ts                   # APP — single source of truth
  diagnosis/                  # cards, scoring, archetypes, types
  report/                     # prompt, answers resolver, ReportContent types
  command/                    # daily command generation
  mock/                       # catalog, scoring, types
  kautilya/                   # UI helpers: integrationScore, demo-data, events, toast
  ai/gateway.ts               # Tiered LLM routing
  weekly/review.ts            # Weekly review rows + email HTML
components/kautilya/          # Long-war UI shell (dashboard surfaces, palette, motion)
data/question-bank/           # paper-NN.json banks (server reads answers; client strips them)
types/kautilya.ts             # Shared UI types (Source, WeeklyCommand, ResourceState)
supabase/migrations/          # kautilya_001_core.sql, 002, 003_schema_drift.sql
```

## Core flows (read before editing)

### Diagnosis → scoring → reveal → report

```
/diagnosis → DiagnosisEngine
  → cards (FREE_DIAGNOSIS_CARDS | PAID_DIAGNOSIS_CARDS)
  → calculateHiddenScores()     lib/diagnosis/scoring.ts
  → deriveOutcome()               lib/diagnosis/archetypes.ts
  → localStorage OUTCOME_KEY + Supabase aspirant_profiles + hidden_scores
  → background POST /api/generate-report
  → redirect /reveal
/report → cached diagnosis_reports OR ReportLoader → /api/generate-report
```

**Design laws (enforced in code):**

- Raw dimension scores are **never** shown to the user on reveal; qualitative bands only (`RevealClient.tsx`).
- `integrationScore = 100 - resource_chaos` — the one user-visible meta-metric from diagnosis.
- `identity_fusion >= 80` softens harsh reveal copy (`revealLineFor`, `RevealClient`).
- Archetype cascade order is law (`deriveArchetype` in `archetypes.ts`).

### Daily command

```
/dashboard/page.tsx
  → user_dashboard_summary view
  → getOrCreateTodayCommand()   UNIQUE (user_id, command_date), IST date
  → LongWarDashboard + CommandBoard
  → POST /api/command { thread_id } to seal threads
```

Missed-day detection lightens re-entry commands (`is_reentry` flag).

### Mock engine

```
/mock → MOCK_CATALOG (100 gates)
/mock/gate/[gate]/page.tsx
  → bankFileForGate(gate) → data/question-bank/paper-NN.json
  → strips answer/explanation/elimination_path for client
  → TestEngine → POST /api/mock/submit
  → calculateResult(gate, ...) uses examShapeForGate(gate)
```

**Gate overrides (catalog.ts):**

| Gate | Paper | Kind | Bank file |
|------|-------|------|-----------|
| 1 | UPSC 2026 GS-I (official) | `gs` | `paper-01.json` |
| 2 | KAUTILYA practice baseline | `gs` | `paper-02.json` |
| 3 | UPSC 2026 CSAT Paper II | `csat` | `paper-03.json` |
| 4–50 | Full-length GS simulations | `gs` | `paper-04.json` … (most not inked yet) |
| 51–100 | Subject drills | `gs` sectional | same naming |

`examShapeForGate(gate)` returns `APP.exam.csat` or `APP.exam.prelimsGS` via `paperKindForGate`.

Only **three** bank files exist today (`paper-01`, `paper-02`, `paper-03`). Other gates show “still being inked” UI.

## Integration score (two layers)

1. **Diagnosis core:** `integrationScore(resourceChaos)` in `lib/diagnosis/scoring.ts` — `clamp(100 - resource_chaos)`.
2. **Dashboard:** `user_dashboard_summary.integration_score` SQL view — same inversion from `hidden_scores.resource_chaos`.
3. **UI adapter:** `computeIntegrationScore(ResourceState)` in `lib/kautilya/integrationScore.ts` — today only inverts `resourceChaos`; `sources[]` is reserved for future Source model.

## components/kautilya/ UI

| Component | Role |
|-----------|------|
| `KautilyaShell` | Root chrome: `KautilyaCommandPalette` (⌘K) + Sonner toasts |
| `LongWarDashboard` | Main post-diagnosis command surface |
| `CommandBoard` | Daily thread checklist + seal (lives under `app/(dashboard)/dashboard/`) |
| `ResourceChaosMap` | Integration score bar; empty → `KautilyaEmptyState` |
| `WeeklyCommandCard` | Weekly focus UI (currently fed **demo data**) |
| `KautilyaCommandPalette` | Quick nav to diagnosis, resource map, notes, mock |
| `LandingMotion`, `MotionPage` | Page-level motion wrappers |
| `HoldToSealButton` | Ceremonial seal interaction |
| `KautilyaLoadingState`, `KautilyaEmptyState`, `KautilyaErrorState` | State surfaces (**ErrorState not wired**) |
| `SmartNoteReader`, `NotePremiumReader`, `MainsAnswerRepair`, `CurrentAffairsInbox` | Repair modules (several “coming soon” on dashboard) |

Brand tokens: `lib/kautilya/colors.ts`, global CSS (`app/globals.css`), Cinzel + Inter + Source Serif.

## Plans

| Stored `plan_type` | Label | Access |
|--------------------|-------|--------|
| `free` | Scout | 30-card diagnosis, 3 free mocks (gates 1–3) |
| `prelims` | Warrior | 50-card diagnosis, full mock arena |
| `gs` | Apex | Warrior + full notes vault |

`canAccessPlan(user, 'warrior')` gates paid mocks.

## Environment variables

Copy `.env.local.example`. **Required for core flows:**

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `GROQ_API_KEY` — report generation + smart notes (gateway errors without it)
- `NEXT_PUBLIC_SITE_URL` — must match Supabase Auth redirect URLs

**Netlify:** set the same vars in the dashboard; `netlify.toml` does not declare them. See `FINDINGS.md` for URL/key drift.

## Commands

```bash
npm run dev          # localhost:3000
npm run build
npm run typecheck
npm run test         # vitest: diagnosis-scoring, mock-scoring, question-bank, command-generate
npm run test:archetypes
```

## Editing rules

1. **Minimize scope** — match existing patterns; don't refactor unrelated code.
2. **Never mirror raw hidden scores** to the aspirant UI.
3. **Keep `system` prompts stable** in AI calls (gateway caches prefixes).
4. **Question banks:** server-only fields (`answer`, `explanation`, `elimination_path`) must stay off the client payload.
5. **IST command days** — use `todayDateString()` in `lib/command/generate.ts`, don't invent UTC midnight logic.
6. **Next.js 16** — read `AGENTS.md` / `node_modules/next/dist/docs/` for API drift.

## Tests to run after touching

- `lib/diagnosis/scoring.ts` or `archetypes.ts` → `npm run test -- diagnosis-scoring`
- `lib/mock/scoring.ts` or `catalog.ts` → `npm run test -- mock-scoring`
- Question bank JSON → `npm run test -- question-bank`
- `lib/command/generate.ts` → `npm run test -- command-generate`

## Known gaps (see FINDINGS.md)

- `LongWarDashboard` uses `deriveWeeklyCommand()` from `demo-data.ts` (hardcoded weekly intelligence).
- `KautilyaErrorState` exists but is never imported.
- `types/kautilya.ts` is minimal; domain types remain split across `lib/*/types.ts`.
- Production `GROQ_API_KEY` / site URL configuration on Netlify needs manual verification.
