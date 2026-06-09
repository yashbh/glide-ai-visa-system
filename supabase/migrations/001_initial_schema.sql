-- Profiles (auto-created on user signup)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text not null,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "Users see own profile" on profiles for select using (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Conversations
create table conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null default 'New conversation',
  country text,
  visa_type text,
  status text default 'active' check (status in ('active', 'completed', 'archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table conversations enable row level security;
create policy "Users see own conversations" on conversations for select using (auth.uid() = user_id);
create policy "Users insert own conversations" on conversations for insert with check (auth.uid() = user_id);
create policy "Users update own conversations" on conversations for update using (auth.uid() = user_id);

-- Messages
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

alter table messages enable row level security;
create policy "Users see own messages" on messages for select using (
  conversation_id in (select id from conversations where user_id = auth.uid())
);
create policy "Users insert own messages" on messages for insert with check (
  conversation_id in (select id from conversations where user_id = auth.uid())
);

-- Visa requirements (static reference data)
create table visa_requirements (
  id uuid primary key default gen_random_uuid(),
  country text not null,
  visa_type text not null,
  category text not null,
  requirement_key text not null,
  title text not null,
  description text not null,
  threshold text,
  recommendation text not null,
  question_hint text,
  display_order int not null default 0,
  created_at timestamptz default now(),
  unique(country, visa_type, requirement_key)
);

alter table visa_requirements enable row level security;
create policy "Anyone can read requirements" on visa_requirements for select using (true);

-- Index for fast requirement lookups
create index idx_requirements_country_type on visa_requirements(country, visa_type, display_order);
