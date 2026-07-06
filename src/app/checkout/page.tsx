import { redirect } from "next/navigation";

import { createCheckoutSession } from "@/actions/create-checkout-session";

type CheckoutSearchParams = {
  kind?: "protocolo" | "produto";
  slug?: string;
  mode?: "assinatura" | "avulso";
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: CheckoutSearchParams;
}) {
  const { kind, slug, mode } = searchParams;

  if (!kind || !slug || !mode) {
    redirect("/protocolos");
  }

  const session = await createCheckoutSession({ kind, slug, mode });

  redirect(session.url);
}
