-- Story 1.2: Seed do catálogo real (5 produtos, 3 protocolos)
-- Fonte: Project Brief original (produtos/preços/ativos) + decisão do fundador
-- sobre preço anual (Opção A: paga 10 meses, leva 12).
-- Nenhuma ocorrência da palavra "Kit" (PRD FR11).
-- stripe_price_id* são placeholders únicos por linha — Story 2.1 substitui
-- via UPDATE quando os Products/Prices reais existirem no Stripe.

insert into products (
  slug, name, category, volume, price_cents, active_ingredients,
  stripe_price_id, image_url,
  social_proof_rating, social_proof_customer_count, social_proof_result_percentage
) values
  ('shampoo-antiqueda', 'Shampoo Antiqueda', 'cabelo', '140ml', 7000,
   array['D-Pantenol', 'Zinco PCA', 'Baicapil', 'Hyaluronic'],
   'pending:shampoo-antiqueda', '/produtos/shampoo-antiqueda.jpg', 4.8, '5k+', 75),

  ('tonico-capilar', 'Tônico Capilar', 'cabelo', '60ml', 18000,
   array['Fricsoxidil', 'VEGF+BFGF', 'Jaborandi', 'Alecrim'],
   'pending:tonico-capilar', '/produtos/tonico-capilar.jpg', 4.8, '5k+', 75),

  ('pomada-fix-carnauba', 'Pomada Fix Carnaúba', 'cabelo', '50g', 9000,
   array['Cera de Carnaúba'],
   'pending:pomada-fix-carnauba', '/produtos/pomada-fix-carnauba.jpg', 4.8, '5k+', 75),

  ('balm-barba', 'Balm para Barba', 'barba', '30g', 7000,
   array['Alecrim', 'Jaborandi', 'Baicapil', 'Ceramidas'],
   'pending:balm-barba', '/produtos/balm-barba.jpg', 4.8, '5k+', 75),

  ('oleo-barba', 'Óleo para Barba', 'barba', '20ml', 6000,
   array['Óleo de Argan', 'Extrato de Jaborandi'],
   'pending:oleo-barba', '/produtos/oleo-barba.jpg', 4.8, '5k+', 75);

insert into protocols (
  slug, name, monthly_price_cents, annual_price_cents, one_time_equivalent_price_cents,
  is_featured, stripe_price_id_monthly, stripe_price_id_annual
) values
  -- Cuidados Diários: R$135/mês, R$1.350/ano (Opção A), R$160 avulso equivalente
  ('cuidados-diarios', 'Cuidados Diários', 13500, 135000, 16000, false,
   'pending:cuidados-diarios-monthly', 'pending:cuidados-diarios-annual'),

  -- Ritual de Autoridade: R$249/mês, R$2.490/ano, R$290 avulso equivalente — "Mais Popular"
  ('ritual-de-autoridade', 'Ritual de Autoridade', 24900, 249000, 29000, true,
   'pending:ritual-de-autoridade-monthly', 'pending:ritual-de-autoridade-annual'),

  -- Implante & Alopecia: R$209/mês, R$2.090/ano, R$250 avulso equivalente
  ('implante-alopecia', 'Implante & Alopecia', 20900, 209000, 25000, false,
   'pending:implante-alopecia-monthly', 'pending:implante-alopecia-annual');

-- protocol_products: relações reais confirmadas (não hipóteses) —
-- Shampoo Antiqueda está nos 3 protocolos, Pomada Fix em 2.
insert into protocol_products (protocol_id, product_id)
select p.id, pr.id
from protocols p, products pr
where (p.slug, pr.slug) in (
  ('cuidados-diarios', 'shampoo-antiqueda'),
  ('cuidados-diarios', 'pomada-fix-carnauba'),

  ('ritual-de-autoridade', 'shampoo-antiqueda'),
  ('ritual-de-autoridade', 'pomada-fix-carnauba'),
  ('ritual-de-autoridade', 'balm-barba'),
  ('ritual-de-autoridade', 'oleo-barba'),

  ('implante-alopecia', 'shampoo-antiqueda'),
  ('implante-alopecia', 'tonico-capilar')
);
