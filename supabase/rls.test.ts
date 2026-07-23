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
