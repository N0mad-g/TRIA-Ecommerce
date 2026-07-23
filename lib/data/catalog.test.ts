/**
 * @jest-environment node
 */
// jsdom não expõe `fetch` global (usado pelo @supabase/supabase-js) — este
// teste não toca DOM, então `node` é o ambiente correto (e resolve o gap).

// Mock de next/headers: cookies() só funciona dentro de request scope real do
// Next.js (Server Component/Route Handler), não em ambiente de teste puro.
// Seguro pra esta story: as políticas RLS de products/protocols/protocol_products
// são SELECT público (schema-design.md Seção 8), não dependem de sessão.
jest.mock('next/headers', () => ({
  cookies: async () => ({
    getAll: () => [],
    set: () => {},
  }),
}));

import { getProducts, getProtocols, getProductBySlug } from './catalog';

// Timeout de integração real (rede) — o default de 5s do Jest é curto pra
// chamadas HTTP de verdade contra o Supabase dev/preview.
jest.setTimeout(15000);

describe('catalog data layer (integração real contra Supabase dev/preview)', () => {
  it('getProducts retorna os 5 produtos seedados com relatedProtocolIds corretos', async () => {
    const products = await getProducts();
    expect(products).toHaveLength(5);

    const shampoo = products.find((p) => p.slug === 'shampoo-antiqueda');
    expect(shampoo).toBeDefined();
    expect(shampoo!.relatedProtocolIds).toHaveLength(3); // está nos 3 protocolos (dado real)

    const pomada = products.find((p) => p.slug === 'pomada-fix-carnauba');
    expect(pomada!.relatedProtocolIds).toHaveLength(2); // está em 2 (dado real)

    expect(shampoo!.priceCents).toBe(7000);
    expect(shampoo!.category).toBe('cabelo');
  });

  it('getProtocols retorna os 3 protocolos seedados, ordenados por preço mensal DESC', async () => {
    const protocols = await getProtocols();
    expect(protocols).toHaveLength(3);

    expect(protocols[0].slug).toBe('ritual-de-autoridade'); // maior monthlyPriceCents
    expect(protocols[0].isFeatured).toBe(true);
    expect(protocols[0].productIds).toHaveLength(4);
    expect(protocols[0].monthlyPriceCents).toBe(24900);
    expect(protocols[0].annualPriceCents).toBe(249000);
  });

  it('getProductBySlug retorna o produto certo', async () => {
    const product = await getProductBySlug('tonico-capilar');
    expect(product?.name).toBe('Tônico Capilar');
    expect(product?.priceCents).toBe(18000);
  });

  it('getProductBySlug retorna null para slug inexistente', async () => {
    const product = await getProductBySlug('produto-que-nao-existe');
    expect(product).toBeNull();
  });

  it('nenhum produto/protocolo tem a palavra "Kit" no nome (PRD FR11)', async () => {
    const [products, protocols] = await Promise.all([getProducts(), getProtocols()]);
    const allNames = [...products.map((p) => p.name), ...protocols.map((p) => p.name)];
    allNames.forEach((name) => expect(name.toLowerCase()).not.toContain('kit'));
  });
});
