/**
 * @jest-environment node
 */
// Integração real contra Supabase dev/preview (mesmo padrão de lib/data/catalog.test.ts) —
// mocka apenas next/headers, que só funciona dentro de request scope real do Next.js.
jest.mock('next/headers', () => ({
  cookies: async () => ({
    getAll: () => [],
    set: () => {},
  }),
}));

import { POST } from './route';

jest.setTimeout(15000);

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/leads', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('POST /api/leads', () => {
  it('rejeita consentGiven: false com 400, antes de tocar no banco', async () => {
    const res = await POST(
      makeRequest({
        contact: 'teste@example.com',
        contactType: 'email',
        consentGiven: false,
      })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('CONSENT_REQUIRED');
  });

  it('rejeita contactType inválido com 400', async () => {
    const res = await POST(
      makeRequest({
        contact: 'teste@example.com',
        contactType: 'sms',
        consentGiven: true,
      })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('INVALID_LEAD');
  });

  it('persiste lead válido e retorna 201', async () => {
    const res = await POST(
      makeRequest({
        contact: `lead-teste-${Date.now()}@example.com`,
        contactType: 'email',
        utmSource: 'instagram',
        utmCampaign: 'post-lancamento',
        consentGiven: true,
      })
    );
    expect(res.status).toBe(201);
  });
});
