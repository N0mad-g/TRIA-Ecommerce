import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ProtocolShowcase } from './ProtocolShowcase';
import type { Protocol } from '@/lib/data/catalog';

expect.extend(toHaveNoViolations);

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
  {
    id: '2',
    slug: 'cuidados-diarios',
    name: 'Cuidados Diários',
    productIds: [],
    monthlyPriceCents: 13500,
    annualPriceCents: 135000,
    oneTimeEquivalentPriceCents: 16000,
    isFeatured: false,
    stripePriceIdMonthly: 'pending:x2',
    stripePriceIdAnnual: 'pending:y2',
  },
];

describe('ProtocolShowcase', () => {
  it('exibe os protocolos com "Ritual de Autoridade" destacado (AC3)', () => {
    render(<ProtocolShowcase protocols={protocolsMock} />);
    expect(screen.getByText('Ritual de Autoridade')).toBeInTheDocument();
    expect(screen.getByText('Mais Popular')).toBeInTheDocument();
  });

  it('linka para /assinatura (AC3)', () => {
    render(<ProtocolShowcase protocols={protocolsMock} />);
    expect(screen.getByRole('link', { name: /ver assinaturas/i })).toHaveAttribute(
      'href',
      '/assinatura'
    );
  });

  it('não tem violação de acessibilidade (WCAG AA)', async () => {
    const { container } = render(<ProtocolShowcase protocols={protocolsMock} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
