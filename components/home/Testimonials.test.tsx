import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Testimonials } from './Testimonials';

expect.extend(toHaveNoViolations);

describe('Testimonials', () => {
  it('renderiza depoimentos (AC2)', () => {
    render(<Testimonials />);
    expect(screen.getAllByRole('listitem').length).toBeGreaterThan(0);
  });

  it('não tem violação de acessibilidade (WCAG AA)', async () => {
    const { container } = render(<Testimonials />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
