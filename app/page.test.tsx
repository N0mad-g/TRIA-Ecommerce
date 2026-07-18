import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Home from './page';

expect.extend(toHaveNoViolations);

describe('Home (health check)', () => {
  it('renders without error', () => {
    render(<Home />);
    expect(screen.getByText(/health check ok/i)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Home />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
