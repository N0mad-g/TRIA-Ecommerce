import { Lock } from "lucide-react";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Conta",
  description: "Acesse sua conta para gerenciar sua assinatura TRIA.",
};

export default function ContaPage() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center px-6 py-24">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-slate/20 bg-[#0d1218] p-8 text-center">
        <div className="mx-auto flex size-11 items-center justify-center rounded-full border border-slate/30 text-slate-light">
          <Lock size={18} />
        </div>

        <div>
          <h1 className="text-xl font-bold text-white">Área do assinante</h1>
          <p className="text-body-tria mt-2 text-slate-light">
            O login é necessário apenas para gerenciar sua assinatura. Compras
            avulsas não exigem conta.
          </p>
        </div>

        <Separator />

        <p className="text-[11px] text-slate">
          Login em breve. Já assinou um protocolo? A confirmação foi enviada
          por e-mail.
        </p>

        <Button variant="secondary" className="w-full" disabled>
          Entrar (em breve)
        </Button>
      </div>
    </section>
  );
}
