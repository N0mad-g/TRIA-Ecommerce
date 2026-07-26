import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { WhyTria } from './WhyTria';

expect.extend(toHaveNoViolations);

describe('WhyTria', () => {
  it('renderiza a seção "Por que TRIA" (AC2)', () => {
    render(<WhyTria />);
    expect(screen.getByRole('heading', { name: /por que tria/i })).toBeInTheDocument();
  });

  it('não tem violação de acessibilidade (WCAG AA)', async () => {
    const { container } = render(<WhyTria />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
