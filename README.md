# KAUTILYA IAS

**Knowledge is not enough. Judgement selects.**

KAUTILYA is a diagnosis-first command system for UPSC CSE aspirants. It studies how you prepare — resource chaos, prelims nerve, mains stamina — then tells you what to do next: one sealed daily command, repair-linked Smart Notes, and Prelims mocks that read guessing discipline, not just score.

Sibling product of [CHANAKYA SSC](../chanakyassc-app).

## What ships today

| Surface | Route | Status |
|---------|-------|--------|
| Scout diagnosis (30 cards) | `/diagnosis` | Live — rule-based scoring + archetype reveal |
| Deep diagnosis (50 cards) | `/diagnosis` (Warrior/Apex) | Live |
| Archetype reveal | `/reveal` | Live — localStorage-first ceremony |
| AI command report | `/report` | Live — requires `GROQ_API_KEY` (or fallback providers) |
| Daily command dashboard | `/dashboard` | Live — server-generated threads |
| Mock arena | `/mock` | Live — **3 question banks** (GS-I official, practice GS, CSAT official) |
| Smart Notes | `/notes` | Live — published notes + revision APIs |
| Weekly focus card | `/dashboard` | **Demo data** — not yet wired to `weekly_reviews` |

## Quick start

### Prerequisites

- Node.js 20+
- Supabase project (run migrations in `supabase/migrations/`)
- Groq API key (free tier works for Scout reports)

### Setup

```bash
cd "kautilya ias"
cp .env.local.example .env.local
# Fill Supabase keys, GROQ_API_KEY, NEXT_PUBLIC_SITE_URL
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Verify

```bash
npm run typecheck
npm run test
```

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Client auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Webhooks, admin, server writes |
| `GROQ_API_KEY` | Yes* | Diagnosis reports, note generation |
| `NEXT_PUBLIC_SITE_URL` | Yes | Auth redirects, OG metadata |
| `GEMINI_API_KEY` / `OPENAI_API_KEY` | No | AI gateway failover |
| `RAZORPAY_*` | For payments | Warrior/Apex unlock |
| `RESEND_API_KEY` | No | Weekly review emails |

\*Report generation returns 502 without at least one configured AI provider.

Supabase Auth redirect URLs must include `{SITE_URL}/auth/callback`.

## Architecture overview

```
Diagnosis (flashcards)
  → silent scores + archetype (rule-based)
  → reveal ceremony
  → AI report (Groq/Gemini via gateway)
  → daily command + mock repair loop
```

**Integration score** — the one user-visible diagnosis metric: `100 − resource_chaos`. Drives dashboard readiness labels and the resource map.

**Mock engine** — 100-gate catalog; gates 1–3 load real banks from `data/question-bank/`. `examShapeForGate()` switches GS (+2/−0.66) vs CSAT (+2.5/−0.83) marking.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full system design and [CLAUDE.md](./CLAUDE.md) for agent/editor guidance.

## Project structure

```
app/                 Next.js routes (diagnosis, dashboard, mock, report, api)
components/kautilya/ Long-war UI (dashboard, palette, motion, state surfaces)
lib/
  config.ts          APP.exam shapes, pricing, dates (single source of truth)
  diagnosis/         50-card instrument, scoring, archetypes
  report/            AI prompt + ReportContent types
  command/           Daily command generation
  mock/              Catalog, scoring, types
  kautilya/          UI helpers (integration score, events, demo-data)
  ai/gateway.ts      Tiered LLM routing
data/question-bank/  paper-NN.json mock banks (server-side answers)
types/kautilya.ts    Shared UI types (Source, WeeklyCommand, …)
supabase/            Schema + migrations
__tests__/           Vitest (scoring, catalog, banks, command)
```

## Mock question banks

| Gate | File | Content |
|------|------|---------|
| 1 | `paper-01.json` | UPSC 2026 Prelims GS-I (official) |
| 2 | `paper-02.json` | KAUTILYA synthetic baseline practice |
| 3 | `paper-03.json` | UPSC 2026 CSAT Paper II (official) |
| 4–100 | `paper-NN.json` | Catalog entries exist; banks not yet uploaded |

Template and field rules: `data/question-bank/TEMPLATE-question.json`.

## Plans

| Tier | Price | Key unlock |
|------|-------|------------|
| Scout (`free`) | ₹0 | 30-card diagnosis, 3 free mocks, sample command |
| Warrior (`prelims`) | ₹999 | 50-card diagnosis, full mock arena |
| Apex (`gs`) | ₹1999 | Warrior + full notes vault |

## Deploy (Netlify)

```bash
npm run build
```

- Config: `netlify.toml` (Next.js plugin, Node 20)
- Set all env vars in the Netlify dashboard (not committed)
- Default production URL in code: `https://kautilyaias.netlify.app` — align `NEXT_PUBLIC_SITE_URL` and Supabase Auth with your actual site

## Documentation

| File | Audience |
|------|----------|
| [CLAUDE.md](./CLAUDE.md) | AI agents / contributors — flows, conventions, pitfalls |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Engineers — pillars, data flow, DB, mock engine |
| [FINDINGS.md](./FINDINGS.md) | Audit — known gaps and tech debt |
| [BUILD_CHRONICLE.md](./BUILD_CHRONICLE.md) | Historical build log (partially SSC-derived) |

## Scripts

```bash
npm run dev            # Development server
npm run build          # Production build
npm run typecheck      # tsc --noEmit
npm run test           # Vitest suite
npm run test:archetypes # Archetype cascade script
```

## License

Private — KAUTILYA IAS / CHANAKYA SSC product family.
