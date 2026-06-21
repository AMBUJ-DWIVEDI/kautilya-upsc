-- ============================================================
-- KAUTILYA Migration 004 — Resource audit sources
-- Named study sources with role-based reduction (final|secondary|parked|dead).
-- Apply after kautilya_003_schema_drift.sql.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.kautilya_sources (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  subject    text,
  role       text NOT NULL DEFAULT 'secondary'
               CHECK (role IN ('final', 'secondary', 'parked', 'dead')),
  reason     text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS kautilya_sources_user_id_idx
  ON public.kautilya_sources (user_id);

COMMENT ON TABLE public.kautilya_sources IS
  'User-named study sources for the Resource Audit / Source Reduction engine.';

ALTER TABLE public.kautilya_sources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sources: own rows only" ON public.kautilya_sources;
CREATE POLICY "sources: own rows only"
  ON public.kautilya_sources FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Keep updated_at fresh on role / metadata changes.
CREATE OR REPLACE FUNCTION public.kautilya_sources_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS kautilya_sources_updated_at ON public.kautilya_sources;
CREATE TRIGGER kautilya_sources_updated_at
  BEFORE UPDATE ON public.kautilya_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.kautilya_sources_set_updated_at();
