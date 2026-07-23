-- Story 1.2: Database Schema & Catalog Seed
-- Tabelas: products, protocols, protocol_products (junção N:N única)
-- Fonte: docs/schema-design.md Seções 4, 6, 7, 8 — DDL transcrito, não reinventado.

-- =========================================================================
-- products
-- =========================================================================
create table products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null check (category in ('cabelo', 'barba')),
  volume text not null,
  price_cents integer not null check (price_cents > 0),
  active_ingredients text[] not null default '{}',
  stripe_price_id text not null unique,
  image_url text not null,
  social_proof_rating numeric(2,1) not null check (social_proof_rating between 0 and 5),
  social_proof_customer_count text not null,
  social_proof_result_percentage integer not null check (social_proof_result_percentage between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_products_category on products (category);

comment on table products is 'Catálogo de produtos avulsos (Architecture 4.1). Seed único, sem admin panel (PRD 2.4).';
comment on column products.stripe_price_id is 'Price ID do Stripe. Placeholder único por linha (pending:<slug>) até a Story 2.1 preencher o valor real via UPDATE — nunca um valor genérico repetido (violaria UNIQUE).';

-- =========================================================================
-- protocols
-- =========================================================================
create table protocols (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  monthly_price_cents integer not null check (monthly_price_cents > 0),
  annual_price_cents integer not null check (annual_price_cents > 0),
  one_time_equivalent_price_cents integer not null check (one_time_equivalent_price_cents > 0),
  is_featured boolean not null default false,
  stripe_price_id_monthly text not null unique,
  stripe_price_id_annual text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_protocols_monthly_price on protocols (monthly_price_cents desc);

comment on table protocols is 'Catálogo de protocolos de assinatura (Architecture 4.2).';
comment on column protocols.stripe_price_id_monthly is 'Price ID Stripe recorrência mensal. Placeholder único até Story 2.1.';
comment on column protocols.stripe_price_id_annual is 'Price ID Stripe recorrência anual. Placeholder único até Story 2.1.';

-- =========================================================================
-- protocol_products (junção N:N única — Architecture 7.1, correção desta sessão)
-- =========================================================================
create table protocol_products (
  protocol_id uuid not null references protocols(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  primary key (protocol_id, product_id)
);

create index idx_protocol_products_product on protocol_products (product_id);

comment on table protocol_products is 'Junção N:N única entre protocols e products — resolve Protocol.productIds e Product.relatedProtocolIds nas duas direções (Architecture 7.1). Sem created_at/updated_at: tabela de associação pura, seedada uma vez, nunca atualizada programaticamente (schema-design.md Seção 4, nota explícita).';

-- =========================================================================
-- RLS — catálogo público, sem restrição de leitura (Architecture 7.2/7.3, schema-design.md Seção 8)
-- =========================================================================
alter table products enable row level security;
alter table protocols enable row level security;
alter table protocol_products enable row level security;

create policy products_select_public on products for select using (true);
create policy protocols_select_public on protocols for select using (true);
create policy protocol_products_select_public on protocol_products for select using (true);

comment on policy products_select_public on products is 'Catálogo público sem RLS restritivo — mesmo dado já renderizado em HTML público via ISR (Architecture 7.3). Sem policy de INSERT/UPDATE/DELETE para anon/authenticated: escrita só via service role (seed/migration).';
comment on policy protocols_select_public on protocols is 'Mesma razão de products_select_public.';
comment on policy protocol_products_select_public on protocol_products is 'Mesma razão de products_select_public.';
