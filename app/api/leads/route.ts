import { z } from 'zod';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { apiError } from '@/lib/errors';

// Story 1.3 (FR1, AC6/AC7) — endpoint público, sem sessão (security: [] na spec).
const leadSchema = z.object({
  contact: z.string().min(1),
  contactType: z.enum(['email', 'whatsapp']),
  utmSource: z.string().optional(),
  utmCampaign: z.string().optional(),
  consentGiven: z.boolean(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(400, 'INVALID_BODY', 'Corpo da requisição inválido.');
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, 'INVALID_LEAD', 'Dados do formulário inválidos.');
  }

  const { contact, contactType, utmSource, utmCampaign, consentGiven } = parsed.data;

  // Rejeita antes de tocar no banco (Task 2 subtask) — CHECK (consent_given = true)
  // na tabela é defesa em profundidade, não o único ponto de validação.
  if (consentGiven !== true) {
    return apiError(400, 'CONSENT_REQUIRED', 'Consentimento de uso do contato é obrigatório.');
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from('leads').insert({
    contact,
    contact_type: contactType,
    utm_source: utmSource ?? null,
    utm_campaign: utmCampaign ?? null,
    consent_given: consentGiven,
  });

  if (error) {
    return apiError(500, 'INTERNAL_ERROR', 'Não foi possível salvar seu contato. Tente novamente.');
  }

  return NextResponse.json({}, { status: 201 });
}
