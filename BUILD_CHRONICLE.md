# CHANAKYA SSC — Complete Build Chronicle
> Everything built, fixed, and decided — from first principle to launch-ready.
> Last updated: 10 June 2026. Use this for the pre-launch 1-to-100 review.

---

## Phase 0 — The Blueprint (the thinking before the code)

**The founding thesis:** "Aspirants fail not from lack of content but lack of direction, anchoring, and personalized execution." Built by the founder (AIR 91, SSC CGL) to externalize the "Majestic Game" — a system that talks to soul + brain + heart simultaneously, not a test series.

**The 7 Pillars defined:**
1. Identity Diagnosis — 7-level flashcard onboarding
2. Baseline Mock Diagnostic — 100Q Gate 1 + analytics
3. Targets — post, score, timeline, daily hours
4. Personalized Study System — the 10-test fortress
5. CHANAKYA Command Diagnosis — 4 cognitive domains → AI report
6. Rules + Commands + Anchor Points — personal laws
7. Daily Logs + Progress Tracker — 2-min daily form + leaderboards

**The 9 Archetypes:** Comeback Warrior, Family Restorer, Silent Rank Hunter, Overthinking Strategist, Chaos-to-Clarity Aspirant, Inconsistent Genius, Disciplined Climber, Pressure-Built Fighter, Numb but Capable Aspirant.

**Design laws:** Dashboard always says "do this next"; one card per screen; max 6 options per flashcard; max 4 items in today's mission; 10 hidden scoring dimensions drive personalization silently; recovery > streaks; never shame-based; never fake scarcity.

**Zero-budget stack:** Next.js 14 + ShadCN + Tailwind + Framer Motion · Supabase Free (Postgres + email OTP) · Cloudflare R2 · Groq LLaMA 3.3 70B + Gemini Flash + GPT-4o-mini ($5, anchor only, cached) · Netlify · Razorpay · Make.com + Telegram + Resend · PostHog + Clarity.

**Pricing:** Free Demo ₹0 · Founding Warrior ₹299 · Commander ₹499.

---

## Phase 1 — Scaffold (30 May 2026)

- `create-next-app` initial commit. Repo: `chanakyassc-app`.

## Phase 2 — The Big Build (committed 8 June 2026)

One large commit landed the entire application:

**Landing & brand**
- `app/page.tsx` — cinematic landing (arc: Struggle → Brutal Truth → Reveal → System → Selection), Cinzel + gold dark theme
- `app/trailer/page.tsx`, `marketing/trailer-script.md`, `marketing/posters.html` (919-line media kit, also in `public/`)
- `logo.svg` + `logo-icon.svg` generated

**Auth**
- Email OTP login (`app/(auth)/login`), `app/auth/callback/route.ts` (origin-derived redirects — works on localhost AND prod without code change), signout route

**Pillar 1 — Diagnosis engine**
- `lib/diagnosis/cards.ts` — 843 lines, ~42 flashcards across 7 levels
- `lib/diagnosis/scoring.ts` — 10 hidden dimensions: purposeIntensity, emotionalVolatility, disciplineStability, recoverySpeed, cognitiveClarity, executionFriction, distractionRisk, mockTemperament, selfBeliefType, anchorStrength
- `deriveArchetype()` — priority cascade mapping scores → 9 archetypes
- UI: FlashCard, IntroScreen, LevelStartScreen, ProgressHeader, GeneratingScreen

**Pillars 2+5 — Mock + Report engines**
- `TestEngine.tsx` — 100Q runner, +2/−0.5/0, 60 min, 4×25 sections
- `lib/mock/scoring.ts` (191 lines) — section breakdown, accuracy, time analytics
- `lib/report/prompt.ts` (223 lines) — AI fusion of hidden scores + mock → Command Diagnosis
- Report UI: ArchetypeReveal, CognitiveMap, AnchorCard, AttackPlan

**Smart Notes system**
- 5-layer format: Story → Core Concept → Mnemonic → Mind Map → Key Facts + Common Traps
- Aspirant: `/notes`, `/notes/[section]`, `/notes/[section]/[slug]`, NoteViewer, MindMapRenderer, weak-notes + revise APIs (spaced repetition)
- Admin: `/admin/notes/generate` + APIs: generate-note (Groq), parse-pyqs (PDF), link-questions, search-questions, save-note

**Dashboard + Payments**
- Dashboard: welcome, countdown, stat cards, "do this next" mission
- Razorpay: create-order, verify, webhook routes; PaymentButton (dual-mode); upgrade page

**Content (Daksha engine)**
- `DAKSHA_BRIEFING.md` (362 lines) — full content-generation protocol, per-gate briefs, validation checklist
- Gates 01–06 built: 600 questions, schema-validated, G0N-X-NNN IDs, 40/40/20 difficulty

## Phase 3 — Payment Bridge (8 June 2026)

- Make.com payment-link bridge for pre-KYC payments: `request-link` route + migration `001_payment_links.sql` + `NEXT_PUBLIC_PAYMENT_MODE` (link/api) switch in PaymentButton.

## Phase 4 — Integration & Hardening (9 June 2026)

**Supabase wired live** (project `ckuvlqcltjxswlfmszew`, ap-northeast-1). 11 tables: users, aspirant_profiles, hidden_scores, diagnosis_reports, mock_tests, test_attempts, daily_logs, payments, smart_notes (23 cols), note_revisions, question_note_links (wrong answer → remedial note bridge).

**Six bugs found & fixed:**
1. Login stuck on "Sending…" → added `middleware.ts` + try/catch in `sendOtp()`
2. Webhook DB writes silently failing → switched to `createAdminClient()` (service role)
3. `hasCompletedDiagnosis` logic inverted → fixed `=== false` to `=== true`
4. Mock "View Report" link broken → select `id`, link via `attempt.id`
5. Notes page querying non-existent `is_published` → changed to `status`
6. Upgrade test-mode banner never showed → fixed to `PAYMENT_MODE !== 'api'`

## Phase 5 — Master Content Drop (9 June 2026)

Two master Smart Notes published to `smart_notes` (status=published, section=gk, high_yield, Hard):

| Note | Slug | Key facts | Traps | Content | Mind map |
|---|---|---|---|---|---|
| Polity | polity-complete-master | 49 Q&A | 30 | ~10.5K chars (20 topics) | 7 branches |
| History | history-complete-master | 94 Q&A | 30 | ~20.7K chars (Ancient→1947) | 4 branches |

Inserted via idempotent migrations (dollar-quoted SQL, ON CONFLICT (slug) DO UPDATE). Verified live by SQL query.

## Phase 6 — Launch Checklist (10 June 2026)

**Decisions:** Netlify subdomain (chanakyassc.netlify.app) · tentative exam date labeled "expected" · dedicated support email.

**Code shipped (typecheck clean, 0 source errors):**
- NEW `lib/site.ts` — single source of truth: `examDate` ('2026-09-15', tentative, `examDateConfirmed` flag), `contactEmail`, site `url`, `daysUntilExam()`
- Dashboard countdown: hardcoded "— days left" → live countdown, "SSC CGL Tier I · expected"
- Footer: `chanakya@ssc.in` → `SITE.contactEmail`; © 2025 → dynamic year
- `/posters.html` verified real (919 lines) — no fix needed
- Payment mode DELIBERATELY left on `link` — flipping to `api` before live Razorpay keys would break checkout

**Manual runbook (owner's hands — secrets/dashboards):**
1. Fill `.env.local`: SUPABASE_SERVICE_ROLE_KEY, GROQ_API_KEY, RAZORPAY_KEY_ID/SECRET/WEBHOOK_SECRET
2. Supabase Auth → Site URL + redirect `https://chanakyassc.netlify.app/auth/callback`
3. Razorpay webhook → `/api/payment/webhook`, events `payment_link.paid` + `payment.captured`
4. Make.com → live creds + activate scenario
5. GitHub push → Netlify → 7 env vars in dashboard
6. After live keys verified → flip `NEXT_PUBLIC_PAYMENT_MODE=api`

**Confirm in `lib/site.ts`:** contactEmail (support@chanakyassc.com — mailbox must exist) · examDate when SSC announces.

## Phase 7 — Brand Playbook (10 June 2026)

Eleven strategy cards answered for CHANAKYA SSC:
1. **Visual signature:** the Vow Knot (Chanakya's untied shikha — open until selection day); Gold Seam (kintsugi) support pattern; Gates as product iconography
2. **Slogan:** "Built by AIR 91." (word-of-mouth winner) + "Selection is a system."
3. **Contrarian belief:** "Recovery speed predicts selection. Streaks don't." (screenshot winner)
4. **Competitor gap:** Testbook's scale = its blind spot; moves: founder proximity → diagnosis-first positioning → own the repeat-aspirant market
5. **Best-fit customers:** Repeat Aspirant (lead), Small-Town Solo Aspirant, Inconsistent Fighter
6. **Voice:** verdict-first · fierce at the system, never the aspirant · speaks to one warrior (Hindi-English allowed)
7. **Origin story:** 150-word "your books were never the problem" narrative
8. **Content pillars:** Burn the Streak (polarizing) · War Room (proof) · Trap Alerts (60 ready posts already in smart_notes) · Which Warrior Are You? (convert)
9. **Deadliest objection:** "I've bought 3 courses that didn't work" → free diagnosis converts "trust me" into "test me"
10. **Bio:** "Built by AIR 91. Tells you exactly what's next, every day." + pitch + manifesto
11. **Monetization:** sell direction + proximity, never content volume; market hole at ₹1K–15K; ladder Scout ₹0 → Warrior ₹299 launch→₹699 → Commander ₹1,999 capped (honest scarcity) → War Room ₹4,999 cohort; ~98% margin; never paywall trap alerts

---

## Current Status

**DONE:** Full app architecture end-to-end · 11-table DB live · auth + payments (link mode) · diagnosis/mock/report/notes/admin engines · Gates 1–6 (600Q) · 2 master notes published · 6 bugs fixed · launch code edits · brand playbook.

**PENDING — Content:** Gates 07–10 (4×100Q) · 27-topic Smart Notes Phase-1 backlog (16 Polity, 6 Misc GK, 5 Science).

**PENDING — Config/Deploy (manual runbook above):** secrets, Supabase Auth URLs, Razorpay webhook, Make.com activation, Netlify deploy + env vars, payment-mode flip.

**PENDING — Confirms:** support email mailbox · official exam date.
