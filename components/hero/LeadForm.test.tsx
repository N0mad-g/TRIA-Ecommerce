import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { LeadForm } from './LeadForm';
import { submitLead } from '@/lib/api-client';

jest.mock('@/lib/api-client', () => ({
  submitLead: jest.fn(),
}));

expect.extend(toHaveNoViolations);

describe('LeadForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('checkbox de consentimento nunca vem pré-marcado (AC7)', () => {
    render(<LeadForm />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('botão de envio fica desabilitado até o checkbox ser marcado (AC7)', () => {
    render(<LeadForm />);
    const button = screen.getByRole('button', { name: /quero saber mais/i });
    expect(button).toBeDisabled();

    fireEvent.click(screen.getByRole('checkbox'));
    expect(button).not.toBeDisabled();
  });

  it('exibe erro de validação para contato inválido, sem chamar submitLead', async () => {
    render(<LeadForm />);
    fireEvent.change(screen.getByLabelText(/e-mail ou whatsapp/i), {
      target: { value: 'não-é-contato-valido' },
    });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /quero saber mais/i }));

    expect(await screen.findByText(/informe um e-mail ou whatsapp válido/i)).toBeInTheDocument();
    expect(submitLead).not.toHaveBeenCalled();
  });

  it('envia lead válido e mostra confirmação de sucesso (AC6)', async () => {
    (submitLead as jest.Mock).mockResolvedValueOnce(undefined);
    render(<LeadForm />);

    fireEvent.change(screen.getByLabelText(/e-mail ou whatsapp/i), {
      target: { value: 'contato@example.com' },
    });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /quero saber mais/i }));

    await waitFor(() =>
      expect(submitLead).toHaveBeenCalledWith({
        contact: 'contato@example.com',
        contactType: 'email',
        consentGiven: true,
      })
    );
    expect(await screen.findByText(/recebemos seu contato/i)).toBeInTheDocument();
  });

  it('mostra mensagem de erro em falha de rede, sem quebrar navegação (AC6)', async () => {
    (submitLead as jest.Mock).mockRejectedValueOnce(new Error('network'));
    render(<LeadForm />);

    fireEvent.change(screen.getByLabelText(/e-mail ou whatsapp/i), {
      target: { value: 'contato@example.com' },
    });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /quero saber mais/i }));

    expect(await screen.findByText(/não foi possível enviar seu contato/i)).toBeInTheDocument();
  });

  it('não tem violação de acessibilidade (WCAG AA)', async () => {
    const { container } = render(<LeadForm />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
