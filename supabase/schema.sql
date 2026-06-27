-- ============================================================
-- CHANAKYA SSC — Complete Database Schema
-- Run this once in the Supabase SQL Editor (Dashboard → SQL)
-- ============================================================

-- ── EXTENSIONS ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- TABLE: users
-- Mirrors auth.users for app-level plan data.
-- Auto-populated by trigger on_auth_user_created below.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT        NOT NULL,
  plan_type   TEXT        NOT NULL DEFAULT 'free'
                          CHECK (plan_type IN ('free', 'warrior', 'commander')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.users IS 'App-level user data. id matches auth.users.id.';


-- ============================================================
-- TABLE: aspirant_profiles
-- Full onboarding questionnaire output + anchor flag.
-- One row per user. Updated when diagnosis is submitted.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.aspirant_profiles (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID        NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  name            TEXT        NOT NULL DEFAULT '',
  -- Pillar 1: full identity + emotional vault + learning style + lifestyle answers
  pillar1_data    JSONB       NOT NULL DEFAULT '{}'::JSONB,
  -- Paid 20-card continuation answers for Warrior/Commander
  paid_extra_data JSONB       NOT NULL DEFAULT '{}'::JSONB,
  -- Pillar 3: goal architecture answers
  pillar3_data    JSONB       NOT NULL DEFAULT '{}'::JSONB,
  diagnosis_depth TEXT        NOT NULL DEFAULT 'none'
                          CHECK (diagnosis_depth IN ('none', 'free30', 'paid50', 'free40', 'paid60')),
  core_completed_at TIMESTAMPTZ,
  paid_completed_at TIMESTAMPTZ,
  -- TRUE after OpenAI anchor statement has been generated and cached
  anchor_generated BOOLEAN    NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN public.aspirant_profiles.pillar1_data IS
  'Core and merged diagnosis answers. Keys are card IDs (e.g. "1.1", "2.3"). Values are string | string[].';
COMMENT ON COLUMN public.aspirant_profiles.paid_extra_data IS
  'Paid 20-card deep-scan answers for Warrior/Commander users.';
COMMENT ON COLUMN public.aspirant_profiles.pillar3_data IS
  'Extracted goal fields: targetPost, targetScore, urgency, dailyHours, mockTarget.';


-- ============================================================
-- TABLE: hidden_scores
-- 10 scoring dimensions computed from pillar1_data.
-- Updated every time diagnosis is re-submitted.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.hidden_scores (
  user_id               UUID    PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  -- Cognitive domains (0–100)
  purpose_intensity     NUMERIC(5,2) NOT NULL DEFAULT 0,
  emotional_volatility  NUMERIC(5,2) NOT NULL DEFAULT 0,
  discipline_stability  NUMERIC(5,2) NOT NULL DEFAULT 0,
  recovery_speed        NUMERIC(5,2) NOT NULL DEFAULT 0,
  cognitive_clarity     NUMERIC(5,2) NOT NULL DEFAULT 0,
  execution_friction    NUMERIC(5,2) NOT NULL DEFAULT 0,
  distraction_risk      NUMERIC(5,2) NOT NULL DEFAULT 0,
  mock_temperament      NUMERIC(5,2) NOT NULL DEFAULT 0,
  -- Qualitative fields
  self_belief_type      TEXT    NOT NULL DEFAULT 'medium'
                                CHECK (self_belief_type IN ('high', 'medium', 'low', 'volatile')),
  anchor_strength       NUMERIC(5,2) NOT NULL DEFAULT 0,
  -- Derived archetype
  archetype             TEXT    NOT NULL DEFAULT '',
  scored_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.hidden_scores IS
  'Silent scoring dimensions. Never shown as raw numbers to the aspirant.';


-- ============================================================
-- TABLE: diagnosis_reports
-- AI-generated CHANAKYA Command Diagnosis. Generated once
-- per user (anchor_generated gate). Cached as JSONB.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.diagnosis_reports (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  -- NULL for the initial questionnaire-based report (before any mock)
  attempt_id      UUID,
  report_depth    TEXT        NOT NULL DEFAULT 'free30'
                              CHECK (report_depth IN ('free30', 'paid50', 'free40', 'paid60', 'mock_result')),
  report_content  JSONB       NOT NULL DEFAULT '{}'::JSONB,
  generated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN public.diagnosis_reports.report_content IS
  'Sections: archetype, modus_operandi, cognitive_map, functional_flow,
   stabilization_layer, strengths, vulnerabilities, anchor_card,
   mock_verdict, attack_plan, personal_laws, daily_command.';


-- ============================================================
-- TABLE: mock_tests
-- The 100 Gates. Seeded below. Question bank lives in
-- public/question-bank/gate-NN.json (CDN), NOT here.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mock_tests (
  id              UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  gate_number     INT     NOT NULL UNIQUE CHECK (gate_number BETWEEN 1 AND 100),
  title           TEXT    NOT NULL,
  test_type       TEXT    NOT NULL DEFAULT 'full_length'
                          CHECK (test_type IN ('full_length', 'sectional')),
  section         TEXT    CHECK (section IN ('Reasoning', 'GK', 'Quant', 'English')),
  duration_mins   INT     NOT NULL DEFAULT 60,
  total_questions INT     NOT NULL DEFAULT 100,
  max_score       INT     NOT NULL DEFAULT 200,
  is_baseline     BOOLEAN NOT NULL DEFAULT FALSE,
  unlock_plan     TEXT    NOT NULL DEFAULT 'warrior'
                          CHECK (unlock_plan IN ('free', 'warrior')),
  topic_tags      JSONB   NOT NULL DEFAULT '[]'::JSONB,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

COMMENT ON TABLE public.mock_tests IS
  'Static definition of the 100 Gates. Questions are in CDN JSON files.';


-- ============================================================
-- TABLE: test_attempts
-- One row per user-per-gate attempt. Stores all analytics
-- needed for the post-mock diagnosis.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.test_attempts (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  mock_test_id     UUID        NOT NULL REFERENCES public.mock_tests(id),
  -- {question_id: 'a' | 'b' | 'c' | 'd' | null}
  answers          JSONB       NOT NULL DEFAULT '{}'::JSONB,
  score            INT         NOT NULL DEFAULT 0,
  max_score        INT         NOT NULL DEFAULT 200,   -- 2 marks per Q, -0.5 per wrong
  accuracy         NUMERIC(5,2),                       -- correct / attempted * 100
  total_time_secs  INT,
  -- {Quant: {score, attempted, correct, wrong}, ...}
  section_breakdown JSONB      NOT NULL DEFAULT '{}'::JSONB,
  -- [{topic, wrong_count, difficulty}]
  weak_topics      JSONB       NOT NULL DEFAULT '[]'::JSONB,
  -- Marks lost to negative marking
  negative_marks   NUMERIC(5,2) NOT NULL DEFAULT 0,
  -- Attempt strategy signals
  questions_skipped INT        NOT NULL DEFAULT 0,
  time_pressure_flag BOOLEAN   NOT NULL DEFAULT FALSE,  -- accuracy drop in last 15 min
  completed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN public.test_attempts.answers IS
  'Keyed by question_id from the gate JSON file. Value is selected option or null (skipped).';


-- ============================================================
-- TABLE: daily_logs
-- 2-minute nightly log. One row per user per calendar date.
-- Streak calculated from consecutive rows.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.daily_logs (
  id                  UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID    NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  log_date            DATE    NOT NULL,
  study_hours         NUMERIC(4,2) NOT NULL DEFAULT 0,
  mood                SMALLINT NOT NULL CHECK (mood BETWEEN 1 AND 10),
  energy              SMALLINT NOT NULL CHECK (energy BETWEEN 1 AND 10),
  mission_completed   BOOLEAN NOT NULL DEFAULT FALSE,
  biggest_leak        TEXT,
  tomorrow_correction TEXT,
  -- Single AI-generated insight line (Gemini Flash)
  ai_insight          TEXT,
  -- Computed streak day at time of logging
  streak_day          INT     NOT NULL DEFAULT 1,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, log_date)
);

COMMENT ON COLUMN public.daily_logs.streak_day IS
  'Denormalized for display speed. Recomputed server-side on each log submission.';


-- ============================================================
-- TABLE: payments
-- Razorpay payment records. plan_type updated on users
-- table only after status = paid.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id                  UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID    NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  razorpay_order_id   TEXT    NOT NULL,
  razorpay_payment_id TEXT,   -- populated on success
  amount_paise        INT     NOT NULL,  -- 49900 = ₹499
  status              TEXT    NOT NULL DEFAULT 'created'
                              CHECK (status IN ('created', 'paid', 'failed')),
  plan                TEXT    NOT NULL
                              CHECK (plan IN ('warrior', 'commander')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at             TIMESTAMPTZ
);

COMMENT ON COLUMN public.payments.amount_paise IS '99900 = ₹999, 199900 = ₹1999';


-- ============================================================
-- FOREIGN KEY: diagnosis_reports.attempt_id
-- Added after test_attempts so the reference resolves.
-- ============================================================
ALTER TABLE public.diagnosis_reports
  ADD CONSTRAINT fk_attempt
  FOREIGN KEY (attempt_id)
  REFERENCES public.test_attempts(id)
  ON DELETE SET NULL;


-- ============================================================
-- INDEXES
-- ============================================================
-- Most queries filter by user_id — cover the hot paths.
CREATE INDEX IF NOT EXISTS idx_aspirant_profiles_user   ON public.aspirant_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_hidden_scores_user       ON public.hidden_scores (user_id);
CREATE INDEX IF NOT EXISTS idx_diagnosis_reports_user   ON public.diagnosis_reports (user_id);
CREATE INDEX IF NOT EXISTS idx_diagnosis_reports_depth  ON public.diagnosis_reports (user_id, report_depth, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_test_attempts_user       ON public.test_attempts (user_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_mock       ON public.test_attempts (mock_test_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date     ON public.daily_logs (user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_payments_user            ON public.payments (user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order           ON public.payments (razorpay_order_id);


-- ============================================================
-- TRIGGER: auto-create public.users row on auth signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at)
  VALUES (NEW.id, NEW.email, NEW.created_at)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- TRIGGER: update aspirant_profiles.updated_at automatically
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_aspirant_profiles_updated_at ON public.aspirant_profiles;
CREATE TRIGGER set_aspirant_profiles_updated_at
  BEFORE UPDATE ON public.aspirant_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- ROW LEVEL SECURITY
-- Every table is locked to the authenticated user's own rows.
-- ============================================================

ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aspirant_profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hidden_scores      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnosis_reports  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_tests         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments           ENABLE ROW LEVEL SECURITY;

-- users
CREATE POLICY "users: own row only"
  ON public.users FOR ALL
  USING (auth.uid() = id);

-- aspirant_profiles
CREATE POLICY "profiles: own row only"
  ON public.aspirant_profiles FOR ALL
  USING (auth.uid() = user_id);

-- hidden_scores
CREATE POLICY "scores: own row only"
  ON public.hidden_scores FOR ALL
  USING (auth.uid() = user_id);

-- diagnosis_reports
CREATE POLICY "reports: own rows only"
  ON public.diagnosis_reports FOR ALL
  USING (auth.uid() = user_id);

-- mock_tests: everyone authenticated can read, nobody writes from client
CREATE POLICY "mock_tests: authenticated read"
  ON public.mock_tests FOR SELECT
  USING (auth.role() = 'authenticated');

-- test_attempts
CREATE POLICY "attempts: own rows only"
  ON public.test_attempts FOR ALL
  USING (auth.uid() = user_id);

-- daily_logs
CREATE POLICY "logs: own rows only"
  ON public.daily_logs FOR ALL
  USING (auth.uid() = user_id);

-- payments: users can see their own; inserts only via service role (webhook)
CREATE POLICY "payments: own rows read"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);


-- ============================================================
-- SEED: 100 Gates (mock_tests)
-- ============================================================
INSERT INTO public.mock_tests (
  gate_number, title, test_type, section, duration_mins,
  total_questions, max_score, is_baseline, unlock_plan, topic_tags
)
SELECT
  g,
  CASE
    WHEN g <= 50 THEN 'Gate ' || g || ' — ' ||
      (ARRAY['Baseline Battle','Speed Trial','Accuracy Trial','GK Retention War','Revision Checkpoint','Pressure Simulation','Weakness Hunt','Rank Push','Final Repair','Chanakya Verdict'])[((g - 1) % 10) + 1]
    ELSE 'Gate ' || g || ' — ' ||
      (ARRAY['Reasoning','GK','Quant','English'])[((g - 51) % 4) + 1] || ' Repair ' || (((g - 51) / 4) + 1)
  END,
  CASE WHEN g <= 50 THEN 'full_length' ELSE 'sectional' END,
  CASE WHEN g <= 50 THEN NULL ELSE (ARRAY['Reasoning','GK','Quant','English'])[((g - 51) % 4) + 1] END,
  CASE WHEN g <= 50 THEN 60 ELSE 25 END,
  CASE WHEN g <= 50 THEN 100 ELSE 30 END,
  CASE WHEN g <= 50 THEN 200 ELSE 60 END,
  g = 1,
  CASE WHEN g = 1 THEN 'free' ELSE 'warrior' END,
  CASE WHEN g <= 50 THEN '["full-length"]'::jsonb ELSE '["sectional"]'::jsonb END
FROM generate_series(1, 100) AS g
ON CONFLICT (gate_number) DO UPDATE SET
  title = EXCLUDED.title,
  test_type = EXCLUDED.test_type,
  section = EXCLUDED.section,
  duration_mins = EXCLUDED.duration_mins,
  total_questions = EXCLUDED.total_questions,
  max_score = EXCLUDED.max_score,
  is_baseline = EXCLUDED.is_baseline,
  unlock_plan = EXCLUDED.unlock_plan,
  topic_tags = EXCLUDED.topic_tags;


-- ============================================================
-- HELPER VIEW: user_dashboard_summary
-- Single query for the dashboard's hero row. Joins across
-- the hot tables so the dashboard page makes one DB call.
-- ============================================================
CREATE OR REPLACE VIEW public.user_dashboard_summary
WITH (security_invoker = true) AS
SELECT
  u.id                                    AS user_id,
  u.plan_type,
  p.name,
  p.pillar1_data->>'1.1'                  AS aspirant_name,
  p.diagnosis_depth,
  p.pillar3_data->>'targetPost'           AS target_post,
  p.pillar3_data->>'targetScore'          AS target_score,
  p.anchor_generated,
  hs.archetype,
  hs.discipline_stability,
  hs.distraction_risk,
  hs.self_belief_type,
  -- Latest attempt score
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
  -- Gates completed count
  (SELECT COUNT(DISTINCT ta.mock_test_id)
   FROM public.test_attempts ta
   WHERE ta.user_id = u.id)               AS gates_completed,
  -- Current streak
  (SELECT dl.streak_day
   FROM public.daily_logs dl
   WHERE dl.user_id = u.id
   ORDER BY dl.log_date DESC
   LIMIT 1)                               AS current_streak,
  -- Logged today?
  EXISTS (
    SELECT 1 FROM public.daily_logs dl
    WHERE dl.user_id = u.id
      AND dl.log_date = CURRENT_DATE
  )                                       AS logged_today
FROM public.users u
LEFT JOIN public.aspirant_profiles p  ON p.user_id = u.id
LEFT JOIN public.hidden_scores hs     ON hs.user_id = u.id;

COMMENT ON VIEW public.user_dashboard_summary IS
  'One-query dashboard data. Accessible only via RLS on underlying tables.';
