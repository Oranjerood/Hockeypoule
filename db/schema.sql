-- =============================================================================
-- HockeyPoule — Supabase (PostgreSQL) schema
-- =============================================================================
-- This mirrors the mock data model used in src/types/index.ts and
-- src/data/mock-data.ts so the prototype's UI can be pointed at a real
-- Supabase project with minimal changes to the data-access layer
-- (replace src/lib/store.ts calls with Supabase queries / RPCs).
--
-- Designed to be sport- and level-agnostic: `sport` is a free-form slug on
-- tournaments, so football, hockey, or any other sport/competition
-- (e.g. Hoofdklasse, FIH Pro League, a company five-a-side league) can be
-- added later without schema changes.
-- =============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- USERS (mirrors auth.users; Supabase Auth handles credentials/login)
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null unique,
  avatar_color text not null default '#EA580C',
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- TOURNAMENTS — any sport, any level, any year
-- ---------------------------------------------------------------------------
create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,                 -- e.g. "WK Hockey 2026", "Hoofdklasse 2026/27"
  sport text not null default 'hockey', -- 'hockey' | 'football' | ... (extensible)
  year int not null,
  start_date date not null,
  end_date date not null,
  groups text[] not null default '{}', -- e.g. {"Pool A","Pool B"}
  logo_url text,
  is_active boolean not null default true,
  created_by uuid references public.users (id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- TEAMS
-- ---------------------------------------------------------------------------
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments (id) on delete cascade,
  name text not null,
  country text not null,
  flag_emoji text,
  logo_url text,
  "group" text
);

-- ---------------------------------------------------------------------------
-- MATCHES
-- ---------------------------------------------------------------------------
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments (id) on delete cascade,
  home_team_id uuid not null references public.teams (id),
  away_team_id uuid not null references public.teams (id),
  match_date date not null,
  match_time time not null,
  location text,
  "group" text,
  round text not null,                 -- "Groepsfase - Ronde 1", "Halve finale", ...
  status text not null default 'upcoming' check (status in ('upcoming','live','finished')),
  home_score int,
  away_score int,
  home_shootout int,
  away_shootout int,
  updated_at timestamptz not null default now()
);

create index if not exists matches_tournament_idx on public.matches (tournament_id);

-- ---------------------------------------------------------------------------
-- POOLS (a "poule" a user creates or the national pool for a tournament)
-- ---------------------------------------------------------------------------
create table if not exists public.pools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  visibility text not null default 'private' check (visibility in ('public','private')),
  invite_code text not null unique,
  tournament_id uuid not null references public.tournaments (id),
  owner_id uuid not null references public.users (id),
  entry_fee_cents int not null default 0,
  is_national boolean not null default false,
  is_company boolean not null default false,
  -- Mollie payment reference for the pool-creation fee (see docs/payments.md)
  mollie_payment_id text,
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- POOL MEMBERS
-- ---------------------------------------------------------------------------
create table if not exists public.pool_members (
  pool_id uuid not null references public.pools (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  role text not null default 'member' check (role in ('owner','member')),
  has_paid boolean not null default false,
  mollie_payment_id text,
  joined_at timestamptz not null default now(),
  primary key (pool_id, user_id)
);

-- ---------------------------------------------------------------------------
-- PREDICTIONS (per match, per user, per pool)
-- ---------------------------------------------------------------------------
create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references public.pools (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  match_id uuid not null references public.matches (id) on delete cascade,
  home_score int not null,
  away_score int not null,
  updated_at timestamptz not null default now(),
  unique (pool_id, user_id, match_id)
);

-- ---------------------------------------------------------------------------
-- SPECIAL PREDICTIONS (champion / finalists / topscorer)
-- ---------------------------------------------------------------------------
create table if not exists public.special_predictions (
  pool_id uuid not null references public.pools (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  tournament_id uuid not null references public.tournaments (id),
  champion_team_id uuid references public.teams (id),
  finalist_team_ids uuid[],
  topscorer_name text,
  updated_at timestamptz not null default now(),
  primary key (pool_id, user_id)
);

-- ---------------------------------------------------------------------------
-- SETTINGS — flexible, admin-editable points system, per pool
-- ---------------------------------------------------------------------------
create table if not exists public.settings (
  pool_id uuid primary key references public.pools (id) on delete cascade,
  exact_score int not null default 5,
  correct_winner int not null default 3,
  correct_draw int not null default 3,
  correct_goal_difference int not null default 1,
  champion int not null default 20,
  finalist int not null default 10,
  topscorer int not null default 15
);

-- ---------------------------------------------------------------------------
-- SCORES — cached/derived per-match points per user (optional, for speed)
-- Populated by a trigger/edge function whenever a match result is entered,
-- so the leaderboard is a simple SELECT instead of recomputing every time.
-- ---------------------------------------------------------------------------
create table if not exists public.scores (
  pool_id uuid not null references public.pools (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  match_id uuid not null references public.matches (id) on delete cascade,
  points int not null default 0,
  primary key (pool_id, user_id, match_id)
);

-- ---------------------------------------------------------------------------
-- LEADERBOARD — materialized view for fast reads; refresh after each result
-- ---------------------------------------------------------------------------
create materialized view if not exists public.leaderboard as
select
  s.pool_id,
  s.user_id,
  u.name,
  u.avatar_color,
  sum(s.points) as points,
  count(*) filter (where s.points > 0) as correct_predictions,
  count(*) as total_predictions,
  round(100.0 * count(*) filter (where s.points > 0) / greatest(count(*), 1), 0) as accuracy
from public.scores s
join public.users u on u.id = s.user_id
group by s.pool_id, s.user_id, u.name, u.avatar_color;

-- ---------------------------------------------------------------------------
-- Row Level Security (enable + baseline policies)
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.pools enable row level security;
alter table public.pool_members enable row level security;
alter table public.predictions enable row level security;
alter table public.special_predictions enable row level security;
alter table public.settings enable row level security;

create policy "Users can read their own profile" on public.users
  for select using (auth.uid() = id);

create policy "Members can read pools they belong to or public pools" on public.pools
  for select using (
    visibility = 'public'
    or exists (select 1 from public.pool_members pm where pm.pool_id = pools.id and pm.user_id = auth.uid())
  );

create policy "Users manage their own predictions" on public.predictions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own special predictions" on public.special_predictions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Tournaments/teams/matches are public reference data — readable by anyone,
-- writable only by admins (enforce via a separate `is_admin` check in your
-- Supabase Edge Function / API route that fronts writes).
alter table public.tournaments enable row level security;
alter table public.teams enable row level security;
alter table public.matches enable row level security;

create policy "Anyone can read tournaments" on public.tournaments for select using (true);
create policy "Anyone can read teams" on public.teams for select using (true);
create policy "Anyone can read matches" on public.matches for select using (true);
