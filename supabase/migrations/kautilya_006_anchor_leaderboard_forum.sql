-- KAUTILYA 006: private Anchor, privacy-safe composite rank, moderated forum.

create table if not exists public.kautilya_anchor_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  target_score int check (target_score between 0 and 300),
  target_rank int check (target_rank > 0),
  target_post text check (char_length(target_post) <= 160),
  family_anchors jsonb not null default '[]'::jsonb,
  character_anchors jsonb not null default '[]'::jsonb,
  personal_laws jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.kautilya_anchor_profiles enable row level security;
create policy "anchor owner select" on public.kautilya_anchor_profiles
  for select to authenticated using ((select auth.uid()) = user_id);

alter table public.aspirant_profiles
  add column if not exists leaderboard_display_name text,
  add column if not exists leaderboard_visible boolean not null default true;

create table if not exists public.kautilya_leaderboard_entries (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 40),
  visible boolean not null default true,
  mock_performance int not null default 0 check (mock_performance between 0 and 100),
  command_consistency int not null default 0 check (command_consistency between 0 and 100),
  integration int not null default 0 check (integration between 0 and 100),
  answer_writing int not null default 0 check (answer_writing between 0 and 100),
  recovery int not null default 0 check (recovery between 0 and 100),
  updated_at timestamptz not null default now()
);

alter table public.kautilya_leaderboard_entries enable row level security;
create policy "visible leaderboard or own row" on public.kautilya_leaderboard_entries
  for select to authenticated
  using (visible or (select auth.uid()) = user_id);

create or replace view public.kautilya_leaderboard
with (security_invoker = true) as
select
  user_id,
  display_name,
  visible,
  mock_performance,
  command_consistency,
  integration,
  answer_writing,
  recovery,
  round(
    mock_performance * 0.30 +
    command_consistency * 0.25 +
    integration * 0.20 +
    answer_writing * 0.15 +
    recovery * 0.10
  )::int as kautilya_rank_score,
  updated_at
from public.kautilya_leaderboard_entries;

create table if not exists public.kautilya_forum_rooms (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.kautilya_forum_threads (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.kautilya_forum_rooms(id) on delete restrict,
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 4 and 140),
  body text not null check (char_length(body) between 10 and 5000),
  hidden_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.kautilya_forum_replies (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.kautilya_forum_threads(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 2 and 3000),
  hidden_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.kautilya_forum_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  thread_id uuid references public.kautilya_forum_threads(id) on delete cascade,
  reply_id uuid references public.kautilya_forum_replies(id) on delete cascade,
  reason text not null check (char_length(reason) between 4 and 500),
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  check ((thread_id is not null)::int + (reply_id is not null)::int = 1),
  unique nulls not distinct (reporter_id, thread_id, reply_id)
);

create index if not exists kautilya_forum_threads_room_created_idx
  on public.kautilya_forum_threads(room_id, created_at desc);
create index if not exists kautilya_forum_replies_thread_created_idx
  on public.kautilya_forum_replies(thread_id, created_at);
create index if not exists kautilya_forum_reports_status_idx
  on public.kautilya_forum_reports(status, created_at);

alter table public.kautilya_forum_rooms enable row level security;
alter table public.kautilya_forum_threads enable row level security;
alter table public.kautilya_forum_replies enable row level security;
alter table public.kautilya_forum_reports enable row level security;

create policy "authenticated rooms read" on public.kautilya_forum_rooms
  for select to authenticated using (true);
create policy "visible threads read" on public.kautilya_forum_threads
  for select to authenticated using (hidden_at is null and deleted_at is null);
create policy "thread author insert" on public.kautilya_forum_threads
  for insert to authenticated with check ((select auth.uid()) = author_id);
create policy "thread author update" on public.kautilya_forum_threads
  for update to authenticated using ((select auth.uid()) = author_id)
  with check ((select auth.uid()) = author_id);
create policy "visible replies read" on public.kautilya_forum_replies
  for select to authenticated using (hidden_at is null and deleted_at is null);
create policy "reply author insert" on public.kautilya_forum_replies
  for insert to authenticated with check ((select auth.uid()) = author_id);
create policy "reply author update" on public.kautilya_forum_replies
  for update to authenticated using ((select auth.uid()) = author_id)
  with check ((select auth.uid()) = author_id);
create policy "reporter insert" on public.kautilya_forum_reports
  for insert to authenticated with check ((select auth.uid()) = reporter_id);
create policy "reporter read own" on public.kautilya_forum_reports
  for select to authenticated using ((select auth.uid()) = reporter_id);

insert into public.kautilya_forum_rooms (slug, name, description, sort_order) values
  ('weekly-command', 'Weekly Command Brief', 'Weekly reduction, integration, writing, and revision decisions.', 10),
  ('resource-audit', 'Resource Audit', 'Source authority, parking, and reduction.', 20),
  ('prelims-nerve', 'Prelims Nerve', 'Elimination, risk, and statement-trap diagnosis.', 30),
  ('mains-architecture', 'Mains Answer Architecture', 'Structure, dimensions, examples, and feedback.', 40),
  ('current-affairs', 'Current Affairs Integration', 'Attach the issue to static ground and answer use.', 50),
  ('optional-stability', 'Optional Stability', 'Source finalization and answer-writing rhythm.', 60),
  ('recovery-desk', 'Recovery Desk', 'Smallest valid return after a broken day or week.', 70)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order;

grant select on public.kautilya_anchor_profiles to authenticated;
grant select on public.kautilya_leaderboard_entries, public.kautilya_leaderboard to authenticated;
grant select on public.kautilya_forum_rooms to authenticated;
grant select, insert, update on public.kautilya_forum_threads, public.kautilya_forum_replies to authenticated;
grant select, insert on public.kautilya_forum_reports to authenticated;
