# KAUTILYA IAS — Architecture

Technical architecture of the UPSC command system. All claims trace to code under `kautilya ias/`.

## System context

```mermaid
flowchart TB
  subgraph client [Browser]
    Landing[Landing /]
    Diagnosis[/diagnosis]
    Reveal[/reveal]
    Dashboard[/dashboard]
    Mock[/mock/gate/N]
    Report[/report]
  end

  subgraph next [Next.js App Router]
    DiagnosisEngine[DiagnosisEngine]
    TestEngine[TestEngine]
    CommandGen[getOrCreateTodayCommand]
    ReportAPI["POST /api/generate-report"]
    MockAPI["POST /api/mock/submit"]
    CommandAPI["/api/command"]
  end

  subgraph data [Data layer]
  Supabase[(Supabase Postgres)]
  Banks[(data/question-bank/*.json)]
  end

  subgraph ai [AI]
  Gateway[lib/ai/gateway]
  Groq[Groq Llama 3.3]
  Gemini[Gemini Flash/Pro]
  end

  Diagnosis --> DiagnosisEngine
  DiagnosisEngine --> Supabase
  DiagnosisEngine --> ReportAPI
  ReportAPI --> Gateway --> Groq
  Gateway --> Gemini
  ReportAPI --> Supabase

  Dashboard --> CommandGen --> Supabase
  Dashboard --> CommandAPI --> Supabase

  Mock --> TestEngine
  TestEngine --> MockAPI
  MockAPI --> Banks
  MockAPI --> Supabase

  Report --> Supabase
  Report --> ReportAPI
```

## Configuration spine

`lib/config.ts` exports `APP`:

| Key | Purpose |
|-----|---------|
| `APP.exam.prelimsGS` | 100 Q, 200 marks, +2/−0.66, 120 min |
| `APP.exam.csat` | 80 Q, 200 marks, +2.5/−0.83, 120 min, 33% qualifying |
| `APP.exam.attemptsGeneral` / `ageCapGeneral` | `computeAttemptPressure()` inputs |
| `APP.dates.prelimsExpected` | Countdown (`daysUntilPrelims`) |
| `APP.pricing.tiers` | Scout / Warrior / Apex |
| `APP.url` | Metadata + OG (`NEXT_PUBLIC_SITE_URL` fallback) |

Mock catalog (`lib/mock/catalog.ts`) and scoring (`lib/mock/scoring.ts`) **must** read marking from `examShapeForGate`, not literals.

## Pillar 1 — Diagnosis instrument

### Card inventory

- **50 cards** across 8 levels in `lib/diagnosis/cards.ts` (`CARDS`).
- **30-card Scout subset:** `FREE_DIAGNOSIS_CARD_IDS` (curated high-signal cards).
- **Paid path:** `PAID_DIAGNOSIS_CARDS === CARDS` (all 50).

Levels: Journey → Why → Daily Reality → Resource Map → Mind Under Fire → Emotional Core → Anchor → Mirror.

### Scoring pipeline

```
Answers (card_id → option key)
  → calculateHiddenScores()
       BASELINES per Dimension
       + option.weights deltas
       + option.sets (stage_pattern, purpose_type, flags, profile facts)
       + computeAttemptPressure(attempts, age) + ATTEMPT_MATH flag boost
  → HiddenScores (13 numeric dims + enums + flags)
  → deriveOutcome()
       deriveArchetype() — cascade then Euclidean nearest-centroid fallback
       deriveWarPatternTags() — max 3 tags
       integrationScore = 100 - resource_chaos
  → DiagnosisOutcome
```

**Silent dimensions** (never shown raw on reveal): `purpose_intensity`, `anchor_strength`, `emotional_volatility`, `cognitive_clarity`, `execution_friction`, `distraction_risk`, `marathon_consistency`, `recovery_speed`, `prelims_nerve`, `mains_stamina`, `resource_chaos`, `identity_fusion`, `external_pressure`, plus computed `attempt_pressure`.

### Archetypes (MVP: 5)

Cascade in `deriveArchetype()`:

1. `COMEBACK_WARRIOR` — RETURNING + high purpose
2. `PRELIMS_TRAP_SCHOLAR` — PRELIMS_WALL + attempts + clarity/nerve split
3. `WORKING_PROFESSIONAL_SPLITTER` — employed + external pressure
4. `FRAGMENTED_MAXIMALIST` — resource_chaos ≥ 80
5. `FIRST_FLIGHT_IDEALIST` — FRESH stage
6. Else nearest centroid

Non-launch wounds tagged `V11_CANDIDATE` in `storedTags` for v1.1 copy.

### Persistence

On completion (`DiagnosisEngine.handleGeneratingComplete`):

| Store | Content |
|-------|---------|
| `localStorage` `kautilya_diagnosis_outcome` | Immediate reveal payload |
| `aspirant_profiles` | `pillar1_data`, facts, `diagnosis_depth`, timestamps |
| `hidden_scores` | All dimension values + archetype + war_pattern_tags |
| Background `POST /api/generate-report` | Kicks AI report (non-blocking) |

Progress autosaves to `localStorage` (`kautilya_diagnosis_progress_{depth}`).

## Pillar 2 — Command report (AI layer)

Rule-based scores are **inputs**; narrative is **generated**.

```
POST /api/generate-report
  → auth + plan check (paid50 requires paid plan)
  → cache hit? diagnosis_reports (attempt_id IS NULL, report_depth)
  → buildReportPrompt(scores, archetype, facts, resolvedAnswers)
  → generateJSON() via gateway (tier: free → Groq, paid → Gemini primary)
  → insert diagnosis_reports, set anchor_generated
```

`CommandReport.tsx` renders `ReportContent`: cognitive map (4 engines), functional flow, stabilization layer, strengths/vulnerabilities, prelims verdict, anchor card, 7-day attack plan, personal laws, daily command line.

`ReportLoader.tsx` handles cold start with stepped UI; errors surface if gateway has no provider keys.

## Pillar 3 — Daily command

**Philosophy:** dashboard tells; it does not ask.

`getOrCreateTodayCommand(supabase, userId)`:

1. `todayDateString()` — IST calendar date.
2. Read `daily_commands` for today; return if exists.
3. Detect **re-entry** (broken seal chain / gap > 1 day).
4. `pickNotes()` — weak topics from latest `test_attempts`, match `smart_notes`.
5. `buildThreads()` — 4–5 threads (prelims repair, mains answer, current issue, recall, locked optional).
6. Insert with `UNIQUE(user_id, command_date)` race handling.

`CommandBoard` (client) seals threads via `POST /api/command`; all unlocked threads complete → `sealed: true` + random insight from `lib/voice.ts`.

Mains prompt rotated by date: `mainsPromptForDate()` in `lib/command/mains-pool.ts`.

## Pillar 4 — Mock engine

### Catalog

`MOCK_CATALOG`: 100 entries generated in `lib/mock/catalog.ts`.

- Gates **1–50:** full-length (`test_type: 'full_length'`).
- Gates **51–100:** sectional drills cycling Polity/History/Geography/Economy.

`GATE_OVERRIDES` customize gates 1–3 (official GS, practice GS, official CSAT).

### examShapeForGate

```typescript
paperKindForGate(gate) === 'csat'
  ? APP.exam.csat
  : APP.exam.prelimsGS
```

Used by: `TestEngine` (display marking), `calculateResult`, result pages, tests.

### Question banks

Location: `data/question-bank/paper-{NN}.json`

Structure:

```json
{
  "paper": 1,
  "title": "...",
  "source": "...",
  "questions": [ { "question_id", "subject", "answer", "elimination_path", ... } ]
}
```

- **Server** (`mock/gate page`, `/api/mock/submit`): reads full bank including answers.
- **Client** (`TestEngine`): receives `ClientQuestion` with `answer`, `explanation`, `elimination_path` stripped.

Source build scripts: `_source-2026-gs1.cjs`, `_source-2026-csat.cjs`. Template: `TEMPLATE-question.json`.

**Shipped banks:** paper-01 (2026 GS-I), paper-02 (KAUTILYA synthetic baseline), paper-03 (2026 CSAT). Gates 4+ show placeholder until banks land.

### Scoring analytics

`calculateResult(gate, questions, answers, userId, timeMins)`:

- Per-question marks from `examShapeForGate`.
- Subject breakdown (GS vs CSAT subject orders).
- **Guessing discipline** — 47-sure / 35-gamble framework scaled to paper length.
- **Elimination analysis** — tracks misses on questions with `elimination_path !== 'NONE'`.
- Weak topics, score leaks, 7-day repair plan strings.
- `getVerdict()` — GS cutoff bands vs CSAT qualifying bands.

Results stored in `test_attempts` (+ related analytics JSON columns per migration).

## Pillar 5 — Dashboard & Long War UI

### Server page (`app/(dashboard)/dashboard/page.tsx`)

Reads `user_dashboard_summary` view:

- `archetype`, `integration_score`, `stage_pattern`, `prelims_nerve`, `mains_stamina`, `plan_type`, `name`
- `readinessFromIntegration()` — Ready / Strained / Recovery copy
- `getOrCreateTodayCommand()` if diagnosis complete

### LongWarDashboard (`components/kautilya/LongWarDashboard.tsx`)

Sections:

1. **Long-War Command** header — today's dominant thread title
2. **War Signals** — resource chaos, prelims nerve, mains stamina labels
3. **Command** — `CommandBoard`
4. **Resource Integration** — `ResourceChaosMap` + source reduction empty state
5. **Weekly Focus** — `WeeklyCommandCard` ← **`deriveWeeklyCommand()` demo stub**
6. **Repair Surfaces** — notes link + coming-soon mains/CA
7. **Operating Profile** — archetype + daily log link

Pre-diagnosis: `DiagnosisGate` CTA to `/diagnosis`.

### Integration score on dashboard

```typescript
// LongWarDashboard builds ResourceState from DB integration_score:
resourceChaos: integrationScore != null ? 100 - integrationScore : null
sources: []  // not populated yet
computeIntegrationScore(resourceState) ?? integrationScore
```

`ResourceChaosMap` shows empty state when `sources.length === 0` even if integration score exists.

## Pillar 6 — Weekly review

`lib/weekly/review.ts` + `POST /api/cron/weekly-review`:

- Aggregates sealed commands, note revisions, latest mock attempt.
- `integration_score` from `hidden_scores.resource_chaos`.
- Inserts `weekly_reviews`; email via Resend when configured.

**Not yet wired** to `WeeklyCommandCard` on dashboard (uses `demo-data.ts` instead).

## Database (Supabase)

Core migrations: `supabase/migrations/kautilya_001_core.sql`, `002_rls_hardening.sql`, `003_schema_drift.sql`.

Key tables:

| Table | Role |
|-------|------|
| `users` | `plan_type` |
| `aspirant_profiles` | Diagnosis answers, depth, anchor flag |
| `hidden_scores` | Silent dimensions + archetype |
| `diagnosis_reports` | Cached AI `report_content` |
| `daily_commands` | Threads, completed, sealed |
| `mock_tests` | 100-gate seed (mirrors MOCK_CATALOG) |
| `test_attempts` | Mock results + weak_topics |
| `smart_notes` | Repair library content |
| `weekly_reviews` | Sunday integration rollup |

View: `user_dashboard_summary` — joins profile + scores; exposes `integration_score` only (not raw chaos).

## AI gateway

`lib/ai/gateway.ts`:

- **Free tier chain:** Groq Llama 3.3 → Gemini 2.0 Flash → GPT-4o-mini
- **Paid tier chain:** Gemini 2.5 Pro → GPT-4o-mini → Gemini Flash → Groq
- Skips providers without API keys (`availableChain`).
- `generateJSON<T>()` parses JSON from model output; throws `GatewayError` with attempt log.

Also used by admin note generation (`lib/notes/generator.ts` — direct Groq fetch, separate code path).

## Auth & routing

- Email OTP: `(auth)/login`, `auth/callback/route.ts` (origin-derived redirect).
- `(dashboard)/layout.tsx` — nav shell, admin link if `ADMIN_EMAIL` matches.
- Diagnosis page redirects to dashboard if `anchor_generated` and depth satisfied.

## Analytics

- `lib/analytics.ts` — PostHog `track()`
- `lib/kautilya/events.ts` — Kautilya-specific event names for palette / resource map

## Deployment (Netlify)

- Build: `npm run build`, publish `.next`
- Plugin: `@netlify/plugin-nextjs`
- Env vars must be set in Netlify UI (not in `netlify.toml`)

## Type ownership (fragmented by design today)

| Module | Types |
|--------|-------|
| `lib/diagnosis/types.ts` | Cards, dimensions, HiddenScores, DiagnosisOutcome |
| `lib/report/types.ts` | ReportContent, CognitiveDomain |
| `lib/command/types.ts` | CommandThread, DailyCommandRow, MainsPrompt |
| `lib/mock/types.ts` | PrelimsQuestion, MockResult, Subject |
| `types/kautilya.ts` | Source, ResourceState, WeeklyCommand, LongWarDiagnosis (UI-facing subset) |

## Extension points (planned in code comments)

- `ResourceState.sources` — named sources with roles (`final` | `secondary` | `parked` | `dead`)
- `SourceReductionCard` — imports `Source` from `@/types/kautilya`
- `computeIntegrationScore` version constant `INTEGRATION_SCORE_VERSION` for formula changes
- Mains answer repair, CA inbox — dashboard shows coming-soon surfaces
