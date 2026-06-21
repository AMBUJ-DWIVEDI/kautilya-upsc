-- ============================================================
-- KAUTILYA Migration 003 — Schema drift reconciliation (REVIEW ONLY)
-- Aligns live DB + migrations with columns the app reads/writes.
-- Idempotent (IF NOT EXISTS / DROP CONSTRAINT IF EXISTS).
-- No destructive statements.
-- ============================================================

-- ── smart_notes.section: SSC enum → UPSC GS subjects ───────────
-- App types (lib/notes/types.ts) use Polity|History|…|CurrentAffairs.
-- smart_notes_schema.sql still CHECKs gk|quant|reasoning|english.
-- Legacy rows keep working via the union below.

ALTER TABLE public.smart_notes
  DROP CONSTRAINT IF EXISTS smart_notes_section_check;

ALTER TABLE public.smart_notes
  ADD CONSTRAINT smart_notes_section_check
  CHECK (section IN (
    'Polity', 'History', 'Geography', 'Economy',
    'Environment', 'SciTech', 'CurrentAffairs',
    -- legacy SSC values (existing seeded rows)
    'gk', 'quant', 'reasoning', 'english'
  ));

-- UPSC 12-block columns (also in kautilya_001; repeated for drift safety)
ALTER TABLE public.smart_notes
  ADD COLUMN IF NOT EXISTS anatomy text DEFAULT 'upsc12',
  ADD COLUMN IF NOT EXISTS content jsonb DEFAULT '{}'::jsonb;

-- ── aspirant_profiles UPSC facts (kautilya_001; drift safety) ────
ALTER TABLE public.aspirant_profiles
  ADD COLUMN IF NOT EXISTS attempts_taken   INT     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS attempts_mains   INT     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS prep_years       NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS employed         BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS age              INT,
  ADD COLUMN IF NOT EXISTS optional_subject TEXT;

-- ── payments: link flow + KAUTILYA plan tiers ────────────────────
ALTER TABLE public.payments
  ALTER COLUMN razorpay_order_id DROP NOT NULL;

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS razorpay_link_id TEXT;

ALTER TABLE public.payments
  DROP CONSTRAINT IF EXISTS payments_status_check;

ALTER TABLE public.payments
  ADD CONSTRAINT payments_status_check
  CHECK (status IN ('created', 'link_requested', 'paid', 'failed'));

ALTER TABLE public.payments
  DROP CONSTRAINT IF EXISTS payments_plan_check;

ALTER TABLE public.payments
  ADD CONSTRAINT payments_plan_check
  CHECK (plan IN ('prelims', 'gs'));

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_plan_type_check;

ALTER TABLE public.users
  ADD CONSTRAINT users_plan_type_check
  CHECK (plan_type IN ('free', 'prelims', 'gs'));

-- ── user_dashboard_summary: columns dashboard reads but view omits ─
-- dashboard/page.tsx selects prelims_nerve, mains_stamina from the view.

DROP VIEW IF EXISTS public.user_dashboard_summary;

CREATE OR REPLACE VIEW public.user_dashboard_summary
WITH (security_invoker = true) AS
SELECT
  u.id                                    AS user_id,
  u.plan_type,
  p.name,
  p.pillar1_data->>'L1-01'                AS aspirant_name,
  p.diagnosis_depth,
  p.anchor_generated,
  p.attempts_taken,
  p.employed,
  hs.archetype,
  hs.stage_pattern,
  hs.purpose_type,
  hs.resource_chaos,
  hs.identity_fusion,
  hs.war_pattern_tags,
  hs.prelims_nerve,
  hs.mains_stamina,
  GREATEST(0, LEAST(100, 100 - COALESCE(hs.resource_chaos, 50))) AS integration_score,
  (SELECT ta.score
   FROM public.test_attempts ta
   WHERE ta.user_id = u.id
   ORDER BY ta.completed_at DESC
   LIMIT 1)                               AS latest_score,
  (SELECT ta.max_score
   FROM public.test_attempts ta
   WHERE ta.user_id = u.id
   ORDER BY ta.completed_at DESC
   LIMIT 1)                               AS latest_max_score,
  (SELECT COUNT(DISTINCT ta.mock_test_id)
   FROM public.test_attempts ta
   WHERE ta.user_id = u.id)               AS gates_completed,
  EXISTS (
    SELECT 1 FROM public.daily_commands dc
    WHERE dc.user_id = u.id
      AND dc.command_date = CURRENT_DATE
      AND dc.sealed
  )                                       AS sealed_today
FROM public.users u
LEFT JOIN public.aspirant_profiles p  ON p.user_id = u.id
LEFT JOIN public.hidden_scores hs     ON hs.user_id = u.id;

COMMENT ON VIEW public.user_dashboard_summary IS
  'One-query dashboard data for KAUTILYA. Raw dimensions stay hidden; integration_score is user-visible.';

-- ── KAUTILYA core tables (if kautilya_001 not yet applied) ───────
-- Safe no-ops when already present.

CREATE TABLE IF NOT EXISTS public.demonstrated_dimensions (
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  dimension text,
  score int,
  sample_size int,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, dimension)
);

CREATE TABLE IF NOT EXISTS public.daily_commands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  command_date date,
  threads jsonb,
  completed jsonb DEFAULT '[]',
  sealed boolean DEFAULT false,
  is_reentry boolean DEFAULT false,
  insight text,
  UNIQUE(user_id, command_date)
);

CREATE TABLE IF NOT EXISTS public.weekly_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  week_start date,
  verdict text,
  wins jsonb,
  integration_score int,
  dimension_deltas jsonb,
  generated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, week_start)
);

ALTER TABLE public.demonstrated_dimensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_commands           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reviews           ENABLE ROW LEVEL SECURITY;

-- hidden_scores UPSC shape (only runs if table still has SSC columns)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'hidden_scores'
      AND column_name = 'discipline_stability'
  ) THEN
    RAISE NOTICE 'hidden_scores still has SSC columns — run kautilya_001_core.sql (DROP/CREATE) before this block';
  END IF;
END $$;
