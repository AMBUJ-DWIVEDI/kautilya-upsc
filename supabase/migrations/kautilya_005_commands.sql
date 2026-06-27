create table if not exists public.kautilya_commands (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  command_type text not null
    check (command_type in (
      'daily',
      'weekly',
      'recovery',
      'source_reduction',
      'prelims',
      'mains',
      'current_affairs',
      'optional',
      'revision'
    )),

  status text default 'active'
    check (status in ('active', 'sealed', 'completed', 'missed', 'recalibrated')),

  title text not null,
  seen_text text,
  long_war_signal text,
  primary_leak text,
  command text not null,

  do_more jsonb default '[]'::jsonb,
  do_less jsonb default '[]'::jsonb,
  focus_areas jsonb default '{}'::jsonb,

  avoid_today text,
  why_this_matters text,

  command_window text not null
    check (command_window in ('today', 'this_week')),

  sealed_at timestamptz,
  completed_at timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.kautilya_commands enable row level security;

drop policy if exists "Users can access own kautilya commands"
on public.kautilya_commands;

create policy "Users can access own kautilya commands"
on public.kautilya_commands
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create table if not exists public.kautilya_command_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  command_id uuid references public.kautilya_commands(id) on delete cascade,

  completed boolean,
  what_moved text,
  what_leaked text,
  source_chaos_change text,
  prelims_signal text,
  mains_signal text,
  tomorrow_first_move text,

  created_at timestamptz default now()
);

alter table public.kautilya_command_reviews enable row level security;

drop policy if exists "Users can access own kautilya command reviews"
on public.kautilya_command_reviews;

create policy "Users can access own kautilya command reviews"
on public.kautilya_command_reviews
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
