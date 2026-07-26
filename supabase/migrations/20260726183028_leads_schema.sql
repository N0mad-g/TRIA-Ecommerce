-- Story 1.3: Home Page — Lead capture
-- Tabela: leads (isolada, sem relacionamento)
-- Fonte: docs/schema-design.md Seções 4, 6, 7, 8 — DDL transcrito, não reinventado.

-- =========================================================================
-- leads
-- =========================================================================
create table leads (
  id uuid primary key default gen_random_uuid(),
  contact text not null,
  contact_type text not null check (contact_type in ('email', 'whatsapp')),
  utm_source text,
  utm_campaign text,
  consent_given boolean not null check (consent_given = true),
  created_at timestamptz not null default now()
);

create index idx_leads_created_at on leads (created_at);

comment on table leads is 'Captura de contato do hero (Architecture 4.5), isolada, sem relacionamento com User/Order/Subscription no MVP.';
comment on column leads.consent_given is 'CHECK (= true) é redundante com a validação de aplicação (Route Handler já rejeita submit sem checkbox marcado, PRD Story 1.3 AC7) — mantido como defesa em profundidade: se um bug de aplicação algum dia tentar inserir sem consentimento, o banco recusa, não só o código.';

-- =========================================================================
-- RLS — INSERT público, sem SELECT para anon/authenticated (schema-design.md Seção 8)
-- =========================================================================
alter table leads enable row level security;

create policy leads_insert_public on leads for insert with check (true);

comment on policy leads_insert_public on leads is 'leads sem policy de SELECT é decisão consciente — nenhum usuário, nem mesmo autenticado, lê a própria submissão de volta (o formulário só confirma sucesso via resposta HTTP do POST). Deny-by-default do Postgres RLS cobre a ausência de policy de leitura/update/delete para anon/authenticated.';
