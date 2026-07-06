import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { Protocol } from "@/data/protocols";
import { formatBRL } from "@/lib/format";

export function StickyCta({ protocol }: { protocol: Protocol }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-slate/20 bg-onyx/95 px-6 py-4 backdrop-blur-xl md:hidden">
      <div>
        <p className="text-[10px] text-slate">A partir de</p>
        <p className="text-sm font-bold text-white">
          {formatBRL(protocol.price)}/mês
        </p>
      </div>
      <Button asChild variant="primary" className="max-w-[220px] flex-1">
        <Link href={`/checkout?kind=protocolo&slug=${protocol.slug}&mode=assinatura`}>
          Assinar protocolo
        </Link>
      </Button>
    </div>
  );
}
