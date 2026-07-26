import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import type { Product, Protocol } from '@/lib/data/catalog';

// Home compõe as seções (Task 6) — dados de catálogo mockados aqui, já
// cobertos por integração real em lib/data/catalog.test.ts.
const productsMock: Product[] = [
  {
    id: '1',
    slug: 'shampoo-antiqueda',
    name: 'Shampoo Antiqueda',
    category: 'cabelo',
    volume: '140ml',
    priceCents: 7000,
    activeIngredients: [],
    stripePriceId: 'pending:x',
    imageUrl: '/x.jpg',
    socialProof: { rating: 4.8, customerCount: '5k+', resultPercentage: 75 },
    relatedProtocolIds: [],
  },
];

const protocolsMock: Protocol[] = [
  {
    id: '1',
    slug: 'ritual-de-autoridade',
    name: 'Ritual de Autoridade',
    productIds: [],
    monthlyPriceCents: 24900,
    annualPriceCents: 249000,
    oneTimeEquivalentPriceCents: 29000,
    isFeatured: true,
    stripePriceIdMonthly: 'pending:x',
    stripePriceIdAnnual: 'pending:y',
  },
];

jest.mock('@/lib/data/catalog', () => ({
  getProducts: jest.fn().mockResolvedValue(productsMock),
  getProtocols: jest.fn().mockResolvedValue(protocolsMock),
}));

import Home from './page';

expect.extend(toHaveNoViolations);

describe('Home', () => {
  it('renderiza hero, seções institucionais e vitrines (AC1-4)', async () => {
    render(await Home());

    expect(screen.getByRole('heading', { name: /por que tria/i })).toBeInTheDocument();
    expect(screen.getByText('Shampoo Antiqueda')).toBeInTheDocument();
    expect(screen.getByText('Ritual de Autoridade')).toBeInTheDocument();
  });

  it('não tem violação de acessibilidade (WCAG AA)', async () => {
    const { container } = render(await Home());
    expect(await axe(container)).toHaveNoViolations();
  });
});
