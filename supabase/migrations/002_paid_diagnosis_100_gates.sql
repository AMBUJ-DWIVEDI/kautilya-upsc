-- Paid diagnosis depths + 100-gate catalog.
-- Apply this in Supabase after 001_payment_links.sql.

ALTER TABLE public.aspirant_profiles
  ADD COLUMN IF NOT EXISTS paid_extra_data JSONB NOT NULL DEFAULT '{}'::JSONB;

ALTER TABLE public.aspirant_profiles
  ADD COLUMN IF NOT EXISTS diagnosis_depth TEXT NOT NULL DEFAULT 'none';

ALTER TABLE public.aspirant_profiles
  DROP CONSTRAINT IF EXISTS aspirant_profiles_diagnosis_depth_check;

ALTER TABLE public.aspirant_profiles
  ADD CONSTRAINT aspirant_profiles_diagnosis_depth_check
  CHECK (diagnosis_depth IN ('none', 'free30', 'paid50'));

ALTER TABLE public.aspirant_profiles
  ADD COLUMN IF NOT EXISTS core_completed_at TIMESTAMPTZ;

ALTER TABLE public.aspirant_profiles
  ADD COLUMN IF NOT EXISTS paid_completed_at TIMESTAMPTZ;

UPDATE public.aspirant_profiles
SET
  diagnosis_depth = 'free30',
  core_completed_at = COALESCE(core_completed_at, updated_at, NOW())
WHERE diagnosis_depth = 'none'
  AND jsonb_object_length(pillar1_data) >= 30;

ALTER TABLE public.diagnosis_reports
  ADD COLUMN IF NOT EXISTS report_depth TEXT NOT NULL DEFAULT 'free30';

ALTER TABLE public.diagnosis_reports
  DROP CONSTRAINT IF EXISTS diagnosis_reports_report_depth_check;

ALTER TABLE public.diagnosis_reports
  ADD CONSTRAINT diagnosis_reports_report_depth_check
  CHECK (report_depth IN ('free30', 'paid50', 'mock_result'));

UPDATE public.diagnosis_reports
SET report_depth = 'mock_result'
WHERE attempt_id IS NOT NULL;

UPDATE public.diagnosis_reports
SET report_depth = 'free30'
WHERE attempt_id IS NULL
  AND report_depth IS NULL;

CREATE INDEX IF NOT EXISTS idx_diagnosis_reports_depth
  ON public.diagnosis_reports (user_id, report_depth, generated_at DESC);

ALTER TABLE public.mock_tests
  DROP CONSTRAINT IF EXISTS mock_tests_gate_number_check;

ALTER TABLE public.mock_tests
  ADD CONSTRAINT mock_tests_gate_number_check
  CHECK (gate_number BETWEEN 1 AND 100);

ALTER TABLE public.mock_tests
  ADD COLUMN IF NOT EXISTS test_type TEXT NOT NULL DEFAULT 'full_length';

ALTER TABLE public.mock_tests
  DROP CONSTRAINT IF EXISTS mock_tests_test_type_check;

ALTER TABLE public.mock_tests
  ADD CONSTRAINT mock_tests_test_type_check
  CHECK (test_type IN ('full_length', 'sectional'));

ALTER TABLE public.mock_tests
  ADD COLUMN IF NOT EXISTS section TEXT;

ALTER TABLE public.mock_tests
  DROP CONSTRAINT IF EXISTS mock_tests_section_check;

ALTER TABLE public.mock_tests
  ADD CONSTRAINT mock_tests_section_check
  CHECK (section IS NULL OR section IN ('Reasoning', 'GK', 'Quant', 'English'));

ALTER TABLE public.mock_tests
  ADD COLUMN IF NOT EXISTS max_score INT NOT NULL DEFAULT 200;

ALTER TABLE public.mock_tests
  ADD COLUMN IF NOT EXISTS is_baseline BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.mock_tests
  ADD COLUMN IF NOT EXISTS unlock_plan TEXT NOT NULL DEFAULT 'warrior';

ALTER TABLE public.mock_tests
  DROP CONSTRAINT IF EXISTS mock_tests_unlock_plan_check;

ALTER TABLE public.mock_tests
  ADD CONSTRAINT mock_tests_unlock_plan_check
  CHECK (unlock_plan IN ('free', 'warrior'));

ALTER TABLE public.mock_tests
  ADD COLUMN IF NOT EXISTS topic_tags JSONB NOT NULL DEFAULT '[]'::JSONB;

INSERT INTO public.mock_tests (
  gate_number, title, test_type, section, duration_mins,
  total_questions, max_score, is_baseline, unlock_plan, topic_tags
)
SELECT
  g,
  CASE
    WHEN g <= 50 THEN 'Gate ' || g || ' - ' ||
      (ARRAY['Baseline Battle','Speed Trial','Accuracy Trial','GK Retention War','Revision Checkpoint','Pressure Simulation','Weakness Hunt','Rank Push','Final Repair','Chanakya Verdict'])[((g - 1) % 10) + 1]
    ELSE 'Gate ' || g || ' - ' ||
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
  (SELECT dl.streak_day
   FROM public.daily_logs dl
   WHERE dl.user_id = u.id
   ORDER BY dl.log_date DESC
   LIMIT 1)                               AS current_streak,
  EXISTS (
    SELECT 1 FROM public.daily_logs dl
    WHERE dl.user_id = u.id
      AND dl.log_date = CURRENT_DATE
  )                                       AS logged_today
FROM public.users u
LEFT JOIN public.aspirant_profiles p  ON p.user_id = u.id
LEFT JOIN public.hidden_scores hs     ON hs.user_id = u.id;
