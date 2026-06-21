-- ============================================================
-- KAUTILYA Migration 002 — RLS hardening (REVIEW ONLY)
-- Project: ebroqnowncgfelhqkiab
-- Apply in Supabase SQL Editor after kautilya_001_core.sql.
-- No destructive statements (no DROP TABLE / TRUNCATE).
-- ============================================================

-- ── P0 FIX: users.plan_type self-upgrade ───────────────────────
-- Current policy "users: own row only" FOR ALL lets any authenticated
-- user UPDATE their own plan_type to prelims/gs without paying.
-- Restrict client access to SELECT; plan changes go through service_role
-- (webhook / admin routes only).

DROP POLICY IF EXISTS "users: own row only" ON public.users;

CREATE POLICY "users: own row read"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Belt-and-suspenders: block plan_type mutation even if a broad policy
-- is reintroduced later.
CREATE OR REPLACE FUNCTION public.guard_users_plan_type()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.plan_type IS DISTINCT FROM OLD.plan_type THEN
    IF coalesce(auth.jwt() ->> 'role', '') = 'service_role' THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'plan_type is read-only for authenticated clients'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_users_plan_type ON public.users;
CREATE TRIGGER guard_users_plan_type
  BEFORE UPDATE OF plan_type ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_users_plan_type();

-- ── P1 FIX: payments client INSERT (create-order / request-link) ─
-- Base schema only grants SELECT. Pending rows must be insertable by
-- the owning user; status/paid_at upgrades stay service_role-only.

DROP POLICY IF EXISTS "payments: own pending insert" ON public.payments;
CREATE POLICY "payments: own pending insert"
  ON public.payments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND status IN ('created', 'link_requested')
  );

-- Explicit: no client UPDATE/DELETE on payments (webhook uses service_role).
-- If a permissive UPDATE policy exists in live DB from manual edits, drop it:
DROP POLICY IF EXISTS "payments: own rows update" ON public.payments;

-- ── P2: explicit WITH CHECK on legacy user-scoped policies ─────
-- PostgreSQL defaults WITH CHECK = USING for FOR ALL, but explicit
-- checks make intent auditable and survive policy refactors.

DROP POLICY IF EXISTS "profiles: own row only" ON public.aspirant_profiles;
CREATE POLICY "profiles: own row only"
  ON public.aspirant_profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reports: own rows only" ON public.diagnosis_reports;
CREATE POLICY "reports: own rows only"
  ON public.diagnosis_reports FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "attempts: own rows only" ON public.test_attempts;
CREATE POLICY "attempts: own rows only"
  ON public.test_attempts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "logs: own rows only" ON public.daily_logs;
CREATE POLICY "logs: own rows only"
  ON public.daily_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "note_revisions: own rows only" ON public.note_revisions;
CREATE POLICY "note_revisions: own rows only"
  ON public.note_revisions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- weekly_reviews: intentionally read-only for clients (cron = service_role).
-- Reassert in case a write policy was added manually:
DROP POLICY IF EXISTS "reviews: own rows write" ON public.weekly_reviews;
DROP POLICY IF EXISTS "reviews: own rows insert" ON public.weekly_reviews;

-- ── P2: RLS verification query (run manually after apply) ──────
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
--
-- SELECT tablename, policyname, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
