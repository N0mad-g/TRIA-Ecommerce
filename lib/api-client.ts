// Wrapper fino sobre fetch para as rotas internas (Architecture Seção 5, 8.4).
export class ApiError extends Error {
  constructor(public body: { error: { code: string; message: string } }) {
    super(body.error.message);
  }
}

export interface SubmitLeadInput {
  contact: string;
  contactType: 'email' | 'whatsapp';
  utmSource?: string;
  utmCampaign?: string;
  consentGiven: boolean;
}

export async function submitLead(input: SubmitLeadInput): Promise<void> {
  const res = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    // 429 do Vercel Firewall não segue o formato ApiErrorBody (Architecture Seção 16.4,
    // "Exceção documentada") — não assume que body.error.code existe.
    if (res.status === 429) {
      throw new ApiError({ error: { code: 'RATE_LIMITED', message: 'Muitas tentativas. Tente novamente em instantes.' } });
    }
    throw new ApiError(await res.json());
  }
}
