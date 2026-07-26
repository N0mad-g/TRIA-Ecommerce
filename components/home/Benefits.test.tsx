import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Benefits } from './Benefits';

expect.extend(toHaveNoViolations);

describe('Benefits', () => {
  it('renderiza os 3 pilares de benefício (AC2)', () => {
    render(<Benefits />);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('não tem violação de acessibilidade (WCAG AA)', async () => {
    const { container } = render(<Benefits />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
