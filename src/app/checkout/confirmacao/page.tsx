import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { stripe } from "@/lib/stripe";

export default async function ConfirmacaoPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams.session_id;

  const session = sessionId
    ? await stripe.checkout.sessions
        .retrieve(sessionId)
        .catch(() => null)
    : null;

  return (
    <section className="flex min-h-[70vh] items-center justify-center px-6 py-24">
      <div className="max-w-md space-y-6 text-center">
        <CheckCircle2 size={40} className="mx-auto text-slate-light" />
        <h1 className="text-headline-section text-white">
          Pedido confirmado
        </h1>
        <p className="text-body-tria text-slate-light">
          {session?.customer_details?.email
            ? `Enviamos a confirmação para ${session.customer_details.email}.`
            : "Seu protocolo está a caminho. Você receberá a confirmação por e-mail."}
        </p>
        <Button asChild variant="primary">
          <Link href="/">Voltar para o início</Link>
        </Button>
      </div>
    </section>
  );
}
