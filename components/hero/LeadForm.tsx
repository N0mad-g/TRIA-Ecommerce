'use client';

import { useState, type FormEvent } from 'react';
import { submitLead } from '@/lib/api-client';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WHATSAPP_PATTERN = /^\+?\d{10,15}$/;

function detectContactType(contact: string): 'email' | 'whatsapp' | null {
  const trimmed = contact.trim();
  if (EMAIL_PATTERN.test(trimmed)) return 'email';
  if (WHATSAPP_PATTERN.test(trimmed.replace(/[\s()-]/g, ''))) return 'whatsapp';
  return null;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function LeadForm() {
  const [contact, setContact] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const contactType = detectContactType(contact);
    if (!contactType) {
      setStatus('error');
      setFeedback('Informe um e-mail ou WhatsApp válido.');
      return;
    }

    setStatus('submitting');
    setFeedback(null);

    try {
      await submitLead({ contact: contact.trim(), contactType, consentGiven });
      setStatus('success');
      setFeedback('Recebemos seu contato! Em breve entraremos em contato.');
      setContact('');
      setConsentGiven(false);
    } catch {
      setStatus('error');
      setFeedback('Não foi possível enviar seu contato. Tente novamente.');
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Formulário de captura de contato"
      className="flex w-full flex-col gap-3 sm:max-w-sm"
    >
      <label htmlFor="lead-contact" className="text-left text-sm font-medium">
        E-mail ou WhatsApp
      </label>
      <input
        id="lead-contact"
        name="contact"
        type="text"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        required
        placeholder="seu@email.com ou (11) 91234-5678"
        className="w-full rounded border px-3 py-2 text-base"
      />

      <label htmlFor="lead-consent" className="flex items-start gap-2 text-left text-sm">
        <input
          id="lead-consent"
          name="consentGiven"
          type="checkbox"
          checked={consentGiven}
          onChange={(e) => setConsentGiven(e.target.checked)}
          className="mt-1"
        />
        Aceito receber comunicações da TRIA sobre meu contato informado.
      </label>

      <button
        type="submit"
        disabled={!consentGiven || status === 'submitting'}
        className="rounded bg-foreground px-4 py-2 text-background disabled:opacity-40"
      >
        {status === 'submitting' ? 'Enviando...' : 'Quero saber mais'}
      </button>

      <div role="status" aria-live="polite" className="text-sm">
        {feedback}
      </div>
    </form>
  );
}
