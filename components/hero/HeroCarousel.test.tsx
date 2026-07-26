import { render, screen, fireEvent, act } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { HeroCarousel } from './HeroCarousel';

expect.extend(toHaveNoViolations);

describe('HeroCarousel', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renderiza 3 slides via dots (AC1)', () => {
    render(<HeroCarousel />);
    expect(screen.getAllByRole('button', { name: /ir para slide/i })).toHaveLength(3);
  });

  it('avança automaticamente (autoplay) após o intervalo (AC1)', () => {
    render(<HeroCarousel />);
    expect(screen.getByText(/ciência para reconstruir sua identidade/i)).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(6000);
    });

    expect(screen.getByText(/ritual de autoridade/i)).toBeInTheDocument();
  });

  it('navega manualmente via seta (AC1)', () => {
    render(<HeroCarousel />);
    fireEvent.click(screen.getByRole('button', { name: /próximo slide/i }));
    expect(screen.getByText(/ritual de autoridade/i)).toBeInTheDocument();
  });

  it('navega manualmente via dots, com aria-current no slide ativo (AC1)', () => {
    render(<HeroCarousel />);
    const dots = screen.getAllByRole('button', { name: /ir para slide/i });
    fireEvent.click(dots[2]);
    expect(screen.getByRole('form', { name: /formulário de captura de contato/i })).toBeInTheDocument();
    expect(dots[2]).toHaveAttribute('aria-current', 'true');
  });

  it('pausa o autoplay ao receber foco de teclado', () => {
    render(<HeroCarousel />);
    const nextButton = screen.getByRole('button', { name: /próximo slide/i });
    fireEvent.focus(nextButton);

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    // Ainda no slide 0 — autoplay pausado pelo foco.
    expect(screen.getByText(/ciência para reconstruir sua identidade/i)).toBeInTheDocument();
  });

  it('não tem violação de acessibilidade (WCAG AA)', async () => {
    jest.useRealTimers();
    const { container } = render(<HeroCarousel />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
