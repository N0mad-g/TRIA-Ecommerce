/**
 * @jest-environment node
 */
// Achado da revisão QA da Story 1.2: os testes de lib/data/catalog.ts só
// cobriam leitura — nenhum verificava que a policy de RLS de fato *bloqueia*
// escrita pro catálogo, que é a propriedade de segurança que a migration
// (20260719032150_catalog_schema.sql) afirma existir. Local designado pela
// Architecture Seção 14.3 (`supabase/rls.test.ts`) para testes de RLS.

import { createClient } from '@supabase/supabase-js';

jest.setTimeout(15000);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

describe('RLS — catálogo (products/protocols/protocol_products) bloqueia escrita via anon key', () => {
  it('INSERT em products é bloqueado pela RLS', async () => {
    const { error } = await supabase.from('products').insert({
      slug: 'produto-teste-rls',
      name: 'Teste RLS',
      category: 'cabelo',
      volume: '1ml',
      price_cents: 100,
      stripe_price_id: 'pending:teste-rls',
      image_url: '/x.jpg',
      social_proof_rating: 5,
      social_proof_customer_count: '1',
      social_proof_result_percentage: 1,
    });
    expect(error).not.toBeNull(); // RLS deve rejeitar — sem policy de INSERT pra anon
  });

  it('UPDATE em products é bloqueado pela RLS (nenhuma linha afetada, sem erro explícito)', async () => {
    const { data, error } = await supabase
      .from('products')
      .update({ name: 'Nome Alterado Sem Permissão' })
      .eq('slug', 'shampoo-antiqueda')
      .select();
    // Sem policy de UPDATE: Postgres/PostgREST não retorna erro, só zero linhas afetadas —
    // importante o teste checar isso, não só ausência de erro (seria falso positivo).
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it('DELETE em protocols é bloqueado pela RLS (nenhuma linha afetada)', async () => {
    const { data, error } = await supabase
      .from('protocols')
      .delete()
      .eq('slug', 'cuidados-diarios')
      .select();
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it('INSERT em protocol_products é bloqueado pela RLS', async () => {
    const { error } = await supabase.from('protocol_products').insert({
      protocol_id: '00000000-0000-0000-0000-000000000000',
      product_id: '00000000-0000-0000-0000-000000000000',
    });
    expect(error).not.toBeNull();
  });

  it('confirma que os dados reais continuam intactos depois das tentativas de escrita acima', async () => {
    const { data } = await supabase
      .from('products')
      .select('name')
      .eq('slug', 'shampoo-antiqueda')
      .single();
    expect(data?.name).toBe('Shampoo Antiqueda'); // não virou "Nome Alterado Sem Permissão"
  });
});

// Achado da revisão QA da Story 1.3: a migration de `leads`
// (20260726183028_leads_schema.sql) afirma duas garantias de segurança via
// COMMENT ON POLICY/COMMENT ON COLUMN — RLS sem policy de SELECT, e
// CHECK (consent_given = true) como defesa em profundidade — mas nenhum teste
// verificava nenhuma das duas empiricamente, mesmo padrão do achado da 1.2
// (RLS write-blocking nunca testada).
describe('RLS — leads (Story 1.3) bloqueia leitura via anon key e o banco reforça consentimento', () => {
  it('SELECT em leads é bloqueado pela RLS (lista vazia, não erro) — ninguém lê a própria submissão de volta', async () => {
    const { data, error } = await supabase.from('leads').select('*');
    expect(error).toBeNull();
    expect(data).toEqual([]); // deny-by-default: sem policy de SELECT pra anon/authenticated
  });

  it('INSERT com consent_given=false é bloqueado pelo CHECK constraint do banco, mesmo contornando a validação da aplicação', async () => {
    const { error } = await supabase.from('leads').insert({
      contact: 'rls-test-consent-false@example.com',
      contact_type: 'email',
      consent_given: false,
    });
    expect(error).not.toBeNull();
    expect(error?.code).toBe('23514'); // check_violation — leads_consent_given_check
  });

  it('INSERT com consent_given=true é aceito (RLS INSERT WITH CHECK(true) permite o fluxo real)', async () => {
    const { error } = await supabase.from('leads').insert({
      contact: `rls-test-consent-true-${Date.now()}@example.com`,
      contact_type: 'email',
      consent_given: true,
    });
    expect(error).toBeNull();
  });
});
