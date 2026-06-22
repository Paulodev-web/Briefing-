create extension if not exists "pgcrypto";

-- Briefings
create table briefings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  client_name text,
  status text not null default 'draft',
  access_token text not null unique default encode(gen_random_bytes(16), 'hex'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Blocos de perguntas
create table briefing_blocks (
  id uuid primary key default gen_random_uuid(),
  briefing_id uuid not null references briefings(id) on delete cascade,
  title text not null,
  order_index int not null,
  created_at timestamptz not null default now()
);

-- Perguntas
create table briefing_questions (
  id uuid primary key default gen_random_uuid(),
  block_id uuid not null references briefing_blocks(id) on delete cascade,
  label text not null,
  helper_text text,
  type text not null,
  required boolean not null default true,
  order_index int not null,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Respostas
create table briefing_answers (
  id uuid primary key default gen_random_uuid(),
  briefing_id uuid not null references briefings(id) on delete cascade,
  question_id uuid not null references briefing_questions(id) on delete cascade,
  value_text text,
  value_json jsonb,
  updated_at timestamptz not null default now(),
  unique (question_id)
);

-- Uploads
create table briefing_uploads (
  id uuid primary key default gen_random_uuid(),
  briefing_id uuid not null references briefings(id) on delete cascade,
  question_id uuid not null references briefing_questions(id) on delete cascade,
  file_path text not null,
  file_name text not null,
  mime_type text,
  size_bytes int,
  created_at timestamptz not null default now()
);

-- Índices
create index on briefing_blocks (briefing_id);
create index on briefing_questions (block_id);
create index on briefing_answers (briefing_id);
create index on briefing_uploads (briefing_id);

-- Trigger para updated_at em briefings
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger briefings_updated_at
  before update on briefings
  for each row execute procedure update_updated_at();

-- RLS
alter table briefings enable row level security;
alter table briefing_blocks enable row level security;
alter table briefing_questions enable row level security;
alter table briefing_answers enable row level security;
alter table briefing_uploads enable row level security;

-- Admin (autenticado) lê e escreve tudo
create policy "admin_all_briefings" on briefings
  for all to authenticated using (true) with check (true);

create policy "admin_all_blocks" on briefing_blocks
  for all to authenticated using (true) with check (true);

create policy "admin_all_questions" on briefing_questions
  for all to authenticated using (true) with check (true);

create policy "admin_all_answers" on briefing_answers
  for all to authenticated using (true) with check (true);

create policy "admin_all_uploads" on briefing_uploads
  for all to authenticated using (true) with check (true);

-- Público lê briefing publicado via token (validado na aplicação via service role)
-- As operações públicas (insert de respostas/uploads) usam service role key server-side
