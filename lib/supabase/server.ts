import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Client Supabase para Server Components/Route Handlers, com sessão via cookie.
 * `setAll` é envolvido em try/catch: Server Components não podem escrever cookie
 * durante a renderização (só Server Actions/Route Handlers/middleware podem) —
 * o middleware (Story 3.1+) é quem de fato refresca a sessão.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Chamado de um Server Component — ignorado de propósito.
          }
        },
      },
    }
  );
}
