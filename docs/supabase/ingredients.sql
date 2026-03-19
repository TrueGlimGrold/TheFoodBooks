-- The Food Books: Supabase schema for Ingredients (MVP)
-- Run in Supabase SQL Editor.

create extension if not exists pgcrypto;

-- Admin allowlist (admin-only writes across tables)
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- Only admins can see the admin list (keeps user ids private)
drop policy if exists "admins_select_admin_only" on public.admins;
create policy "admins_select_admin_only"
on public.admins
for select
to authenticated
using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- Ingredients
create table if not exists public.ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  unit text not null default 'g',
  price_per_unit numeric(12, 4) not null default 0,

  calories numeric(12, 4) not null default 0,
  protein_g numeric(12, 4) not null default 0,
  carbs_g numeric(12, 4) not null default 0,
  fat_g numeric(12, 4) not null default 0,
  fiber_g numeric(12, 4) not null default 0,
  sodium_mg numeric(12, 4) not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists ingredients_name_unique on public.ingredients (lower(name));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_ingredients_updated_at on public.ingredients;
create trigger set_ingredients_updated_at
before update on public.ingredients
for each row execute function public.set_updated_at();

alter table public.ingredients enable row level security;

-- Read policy: allow anyone to read ingredients (change later if you want user auth)
drop policy if exists "ingredients_select_public" on public.ingredients;
create policy "ingredients_select_public"
on public.ingredients
for select
to anon, authenticated
using (true);

-- Write policy: admin-only
drop policy if exists "ingredients_write_admin_only" on public.ingredients;
create policy "ingredients_write_admin_only"
on public.ingredients
for all
to authenticated
using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

