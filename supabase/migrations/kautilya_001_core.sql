-- ============================================================
-- KAUTILYA UPSC — Core Migration 001
-- Run AFTER schema.sql + smart_notes_schema.sql in the
-- KAUTILYA Supabase project (separate from CHANAKYA SSC).
-- Transforms the CHANAKYA base shapes into the UPSC variant.
-- ============================================================

-- ── 1. users: plan tiers become scout(free)/prelims/gs ─────────
-- KAUTILYA-DECISION: 'free' is kept as the storage value for the Scout tier so
-- the auth trigger default and existing plan checks keep working.
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_plan_type_check;
ALTER TABLE public.users
  ADD CONSTRAINT users_plan_type_check
  CHECK (plan_type IN ('free', 'prelims', 'gs'));

ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_plan_check;
ALTER TABLE public.payments
  ADD CONSTRAINT payments_plan_check
  CHECK (plan IN ('prelims', 'gs'));

-- ── 2. aspirant_profiles: UPSC-native columns ──────────────────
ALTER TABLE public.aspirant_profiles
  ADD COLUMN IF NOT EXISTS attempts_taken   INT     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS attempts_mains   INT     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS prep_years       NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS employed         BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS age              INT,
  ADD COLUMN IF NOT EXISTS optional_subject TEXT;

-- ── 3. hidden_scores: replace SSC dimensions with the UPSC 15 ──
-- The CHANAKYA view depends on the old columns; rebuild both.
DROP VIEW IF EXISTS public.user_dashboard_summary;
DROP TABLE IF EXISTS public.hidden_scores;

CREATE TABLE public.hidden_scores (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  -- 15 declared dimensions (0–100, scored silently, never mirrored back raw)
  purpose_intensity    int, anchor_strength      int, emotional_volatility int,
  cognitive_clarity    int, execution_friction   int, distraction_risk     int,
  self_belief_type     text,
  marathon_consistency int, recovery_speed       int,
  prelims_nerve        int, mains_stamina        int,
  attempt_pressure     int, resource_chaos       int,
  identity_fusion      int, external_pressure    int,
  -- 2 derived enums
  stage_pattern text CHECK (stage_pattern IN
    ('FRESH','PRELIMS_WALL','MAINS_PLATEAU','INTERVIEW_EDGE','CLEARED_LOWER','RETURNING')),
  purpose_type  text CHECK (purpose_type IN
    ('SERVICE','RESTORATION','ESCAPE','STATUS','PROOF','UNTESTED')),
  archetype     text,
  war_pattern_tags text[],          -- behavioral tags, max 3 (+ routing flags like V11_CANDIDATE)
  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.hidden_scores IS
  'UPSC silent scoring: 15 declared dimensions + stage/purpose enums + archetype. Never shown raw.';

-- ── 4. demonstrated_dimensions: the LIVING PROFILE layer ───────
-- Updated from real work (mock behavior in MVP; more sources later).
CREATE TABLE IF NOT EXISTS public.demonstrated_dimensions (
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  dimension text,                    -- e.g. 'elimination_discipline','revision_followthrough'
  score int, sample_size int, updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, dimension)
);

-- ── 5. daily_commands: the 5-thread daily mission system ───────
CREATE TABLE IF NOT EXISTS public.daily_commands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  command_date date,
  threads jsonb,        -- [{type:'prelims_revision',target:'45min',note_ids:[]},...]
  completed jsonb DEFAULT '[]',
  sealed boolean DEFAULT false,      -- all threads done → Seal stamps the day
  is_reentry boolean DEFAULT false,  -- lighter command after a missed day; never shame
  insight text,                      -- variable-reward line shown when sealed
  UNIQUE(user_id, command_date)
);

-- ── 6. weekly_reviews: the engineered END of the peak-end loop ─
CREATE TABLE IF NOT EXISTS public.weekly_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  week_start date,
  verdict text, wins jsonb, integration_score int,   -- 100 - resource_chaos
  dimension_deltas jsonb, generated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, week_start)
);

-- ── 7. smart_notes: the 12-block UPSC anatomy ──────────────────
-- content JSON carries keys: issueStory, coreConcept, dimensions, constitutionalLink,
-- dataReport, caseStudy, argumentsFor, argumentsAgainst, pyqLink, answerFramework,
-- mainsExamples, prelimsFacts, revisionBox
ALTER TABLE public.smart_notes
  ADD COLUMN IF NOT EXISTS anatomy text DEFAULT 'upsc12',
  ADD COLUMN IF NOT EXISTS content jsonb DEFAULT '{}'::jsonb;

-- ── 8. mock_tests: UPSC Prelims papers (re-seed titles & shape) ─
-- Gates 1–50: full Prelims GS papers (100Q / 120min / 200 marks).
-- Gates 51–100: subject drills (Polity/History/Geography/Economy rotation).
UPDATE public.mock_tests SET
  title = CASE
    WHEN gate_number <= 50 THEN 'Paper ' || gate_number || ' — ' ||
      (ARRAY['Baseline Prelims','Statement Discipline','Elimination Drill','Polity Density','Revision Checkpoint',
             'Pressure Simulation','Weakness Hunt','Cutoff Push','Final Repair','Kautilya Verdict'])[((gate_number - 1) % 10) + 1]
    ELSE 'Drill ' || gate_number || ' — ' ||
      (ARRAY['Polity','History','Geography','Economy'])[((gate_number - 51) % 4) + 1] || ' ' || (((gate_number - 51) / 4) + 1)
  END,
  section = CASE WHEN gate_number <= 50 THEN NULL
    ELSE (ARRAY['Polity','History','Geography','Economy'])[((gate_number - 51) % 4) + 1] END,
  duration_mins   = CASE WHEN gate_number <= 50 THEN 120 ELSE 30 END,
  total_questions = CASE WHEN gate_number <= 50 THEN 100 ELSE 25 END,
  max_score       = CASE WHEN gate_number <= 50 THEN 200 ELSE 50 END,
  unlock_plan     = CASE WHEN gate_number = 1 THEN 'free' ELSE 'warrior' END;

-- mock_tests.section check was SSC sections; widen to GS subjects.
ALTER TABLE public.mock_tests DROP CONSTRAINT IF EXISTS mock_tests_section_check;
ALTER TABLE public.mock_tests
  ADD CONSTRAINT mock_tests_section_check
  CHECK (section IS NULL OR section IN ('Polity','History','Geography','Economy','Environment','SciTech','CurrentAffairs'));

-- ── 9. RLS ─────────────────────────────────────────────────────
ALTER TABLE public.hidden_scores            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demonstrated_dimensions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_commands           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reviews           ENABLE ROW LEVEL SECURITY;

-- hidden_scores was dropped, so its old policy went with it.
CREATE POLICY "scores: own row only"
  ON public.hidden_scores FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "demonstrated: own rows only"
  ON public.demonstrated_dimensions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "commands: own rows only"
  ON public.daily_commands FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- weekly_reviews are written by the service-role cron only; users read their own.
CREATE POLICY "reviews: own rows read"
  ON public.weekly_reviews FOR SELECT
  USING (auth.uid() = user_id);

-- ── 10. Rebuild the dashboard summary view (UPSC shape) ────────
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
  -- Integration Score: the ONE user-visible meta-metric (rising number, sage color)
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
  'One-query dashboard data for KAUTILYA. Raw dimensions stay hidden; only integration_score is user-visible.';

-- ── 11. RLS smoke tests (run manually; documented for M2 acceptance) ──
-- As anon/authenticated user A:
--   INSERT INTO hidden_scores (user_id, purpose_intensity) VALUES (auth.uid(), 70);   -- ok
--   SELECT * FROM hidden_scores;                                                      -- only own row
--   INSERT INTO daily_commands (user_id, command_date, threads)
--     VALUES (auth.uid(), CURRENT_DATE, '[]'::jsonb);                                 -- ok
--   INSERT INTO weekly_reviews (user_id, week_start) VALUES (auth.uid(), CURRENT_DATE); -- DENIED (read-only)
-- As service role: all inserts succeed (bypasses RLS).
