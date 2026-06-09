-- Travelers table (people in a visa application)
create table travelers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  conversation_id uuid references conversations(id) on delete set null,
  name text not null,
  relationship text not null default 'self' check (relationship in ('self', 'spouse', 'child', 'parent', 'sibling', 'other')),
  passport_number text,
  date_of_birth text,
  created_at timestamptz default now()
);

alter table travelers enable row level security;
create policy "Users see own travelers" on travelers for select using (auth.uid() = user_id);
create policy "Users insert own travelers" on travelers for insert with check (auth.uid() = user_id);
create policy "Users update own travelers" on travelers for update using (auth.uid() = user_id);
create policy "Users delete own travelers" on travelers for delete using (auth.uid() = user_id);

-- Add traveler_id to documents (nullable — old docs won't have it)
alter table documents add column traveler_id uuid references travelers(id) on delete set null;
alter table documents add column traveler_name text;
