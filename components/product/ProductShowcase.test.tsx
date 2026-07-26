import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ProductShowcase } from './ProductShowcase';
import type { Product } from '@/lib/data/catalog';

expect.extend(toHaveNoViolations);

function makeProduct(overrides: Partial<Product>): Product {
  return {
    id: overrides.id ?? '1',
    slug: overrides.slug ?? 'produto-x',
    name: overrides.name ?? 'Produto X',
    category: 'cabelo',
    volume: '100ml',
    priceCents: 7000,
    activeIngredients: [],
    stripePriceId: 'pending:x',
    imageUrl: '/x.jpg',
    socialProof: { rating: 4.8, customerCount: '5k+', resultPercentage: 75 },
    relatedProtocolIds: [],
    ...overrides,
  };
}

const productsMock: Product[] = [
  makeProduct({ id: '1', slug: 'shampoo-antiqueda', name: 'Shampoo Antiqueda' }),
  makeProduct({ id: '2', slug: 'tonico-capilar', name: 'Tônico Capilar' }),
  makeProduct({ id: '3', slug: 'pomada-fix-carnauba', name: 'Pomada Fix Carnaúba' }),
  makeProduct({ id: '4', slug: 'balm-barba', name: 'Balm para Barba' }),
  makeProduct({ id: '5', slug: 'oleo-barba', name: 'Óleo para Barba' }),
];

describe('ProductShowcase', () => {
  it('exibe uma amostra de produtos avulsos, não o catálogo inteiro (AC4)', () => {
    render(<ProductShowcase products={productsMock} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });

  it('linka para /produtos (AC4)', () => {
    render(<ProductShowcase products={productsMock} />);
    expect(screen.getByRole('link', { name: /ver todos os produtos/i })).toHaveAttribute(
      'href',
      '/produtos'
    );
  });

  it('não tem violação de acessibilidade (WCAG AA)', async () => {
    const { container } = render(<ProductShowcase products={productsMock} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
