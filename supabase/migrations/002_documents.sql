-- Documents table for tracking uploaded files
create table documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  conversation_id uuid references conversations(id) on delete set null,
  country text not null,
  title text not null,
  file_name text not null,
  file_type text not null,
  file_size int not null,
  storage_path text not null,
  status text default 'uploaded' check (status in ('uploaded', 'verified', 'rejected', 'processing')),
  created_at timestamptz default now()
);

alter table documents enable row level security;
create policy "Users see own documents" on documents for select using (auth.uid() = user_id);
create policy "Users insert own documents" on documents for insert with check (auth.uid() = user_id);
create policy "Users update own documents" on documents for update using (auth.uid() = user_id);
create policy "Users delete own documents" on documents for delete using (auth.uid() = user_id);

create index idx_documents_user_country on documents(user_id, country);
