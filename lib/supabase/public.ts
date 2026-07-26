import { createClient } from '@supabase/supabase-js';

/**
 * Client Supabase sem cookies/sessão, para dados públicos (catálogo). Usar
 * `createServerSupabaseClient` (cookies) forçaria toda página que o consumisse
 * a sair de static rendering (Next.js: chamar `cookies()` opta a rota inteira
 * por dynamic) — quebraria o ISR exigido pela Home/Produtos/Assinatura
 * (Architecture Seção 2.5). products/protocols têm RLS SELECT público
 * (`USING (true)`, schema-design.md Seção 8), então não há necessidade de
 * sessão aqui.
 */
export function createPublicSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
