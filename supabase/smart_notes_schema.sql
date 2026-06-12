-- ============================================================
-- CHANAKYA SSC — Smart Notes Schema  (Daksha-reviewed v2)
-- Run in Supabase SQL Editor AFTER schema.sql
-- ============================================================

-- ── Smart Notes ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.smart_notes (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  section       TEXT        NOT NULL CHECK (section IN ('gk','quant','reasoning','english')),
  category      TEXT        NOT NULL,     -- 'History', 'Polity', 'Geometry', etc.
  topic         TEXT        NOT NULL,
  subtopic      TEXT,
  slug          TEXT        UNIQUE NOT NULL,   -- 'polity-article-21'

  -- 5 content layers (AI-generated, admin-editable)
  story         TEXT,
  core_concept  TEXT,
  mnemonic      TEXT,
  mindmap_json  JSONB       NOT NULL DEFAULT '{}'::JSONB,
  key_facts     JSONB       NOT NULL DEFAULT '[]'::JSONB,
  common_traps  JSONB       NOT NULL DEFAULT '[]'::JSONB,

  -- PYQ intelligence
  pyq_refs      JSONB       NOT NULL DEFAULT '[]'::JSONB,
  pyq_count     INT         NOT NULL DEFAULT 0,
  last_asked    INT,
  high_yield    BOOLEAN     NOT NULL DEFAULT FALSE,

  -- Meta
  read_time_mins INT        NOT NULL DEFAULT 3,
  difficulty    TEXT        CHECK (difficulty IN ('Easy','Medium','Hard')),

  -- Admin workflow (draft → review → published → archived)
  status        TEXT        NOT NULL DEFAULT 'draft'
                            CHECK (status IN ('draft','review','published','archived')),
  source_type   TEXT        NOT NULL DEFAULT 'manual_ai_reviewed',
  version       INT         NOT NULL DEFAULT 1,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.smart_notes IS
  '5-layer topic-level smart notes. Status workflow: draft→review→published→archived.';
COMMENT ON COLUMN public.smart_notes.status IS
  'draft=WIP | review=admin check needed | published=live for users | archived=retired';


-- ── User Revision Tracking (with spaced repetition fields) ────
CREATE TABLE IF NOT EXISTS public.note_revisions (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  note_id         UUID        NOT NULL REFERENCES public.smart_notes(id) ON DELETE CASCADE,
  revised_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revision_count  INT         NOT NULL DEFAULT 1,
  confidence      TEXT        NOT NULL DEFAULT 'Medium'
                              CHECK (confidence IN ('Low','Medium','High')),
  -- Next recommended revision date (spaced repetition)
  -- Low → 1 day, Medium → 3 days, High → 7 days
  next_due_at     TIMESTAMPTZ,

  UNIQUE (user_id, note_id)
);

COMMENT ON TABLE public.note_revisions IS
  'Tracks revisions per user-note. Confidence drives spaced repetition next_due_at.';


-- ── Mock Question → Smart Note Links ──────────────────────────
-- When a user gets a question wrong, CHANAKYA sends them to the right Smart Note.
CREATE TABLE IF NOT EXISTS public.question_note_links (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id TEXT        NOT NULL,         -- matches Question.id e.g. 'G01-G-031'
  note_id     UUID        NOT NULL REFERENCES public.smart_notes(id) ON DELETE CASCADE,
  link_type   TEXT        NOT NULL DEFAULT 'weak_topic'
                          CHECK (link_type IN ('weak_topic','concept','trap','formula')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (question_id, note_id)
);

COMMENT ON TABLE public.question_note_links IS
  'Links every wrong question to the Smart Note that repairs the gap.';


-- ── Indexes ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_smart_notes_section    ON public.smart_notes (section);
CREATE INDEX IF NOT EXISTS idx_smart_notes_category   ON public.smart_notes (section, category);
CREATE INDEX IF NOT EXISTS idx_smart_notes_slug       ON public.smart_notes (slug);
CREATE INDEX IF NOT EXISTS idx_smart_notes_status     ON public.smart_notes (status);
CREATE INDEX IF NOT EXISTS idx_smart_notes_topic      ON public.smart_notes (topic);
CREATE INDEX IF NOT EXISTS idx_note_revisions_user    ON public.note_revisions (user_id);
CREATE INDEX IF NOT EXISTS idx_note_revisions_due     ON public.note_revisions (user_id, next_due_at);
CREATE INDEX IF NOT EXISTS idx_qnl_question           ON public.question_note_links (question_id);
CREATE INDEX IF NOT EXISTS idx_qnl_note               ON public.question_note_links (note_id);


-- ── Auto-updated_at trigger ────────────────────────────────────
DROP TRIGGER IF EXISTS set_smart_notes_updated_at ON public.smart_notes;
CREATE TRIGGER set_smart_notes_updated_at
  BEFORE UPDATE ON public.smart_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ── Row Level Security ─────────────────────────────────────────
ALTER TABLE public.smart_notes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_revisions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_note_links ENABLE ROW LEVEL SECURITY;

-- Users can only see published notes
CREATE POLICY "smart_notes: authenticated read published"
  ON public.smart_notes FOR SELECT
  USING (auth.role() = 'authenticated' AND status = 'published');

-- Only service_role (admin server actions) can insert/update/delete smart_notes
-- No client-write policy — all writes go through /api/admin/* with service_role key

-- Users own their revision rows
CREATE POLICY "note_revisions: own rows only"
  ON public.note_revisions FOR ALL
  USING (auth.uid() = user_id);

-- Authenticated users can read question-note links (needed for mock result recommendations)
CREATE POLICY "question_note_links: authenticated read"
  ON public.question_note_links FOR SELECT
  USING (auth.role() = 'authenticated');
