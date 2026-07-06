import { Check } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getProductBySlug } from "@/data/products";
import type { Protocol } from "@/data/protocols";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ProtocolCard({ protocol }: { protocol: Protocol }) {
  const savings = protocol.fullPrice - protocol.price;

  return (
    <div
      className={cn(
        "flex flex-col gap-6 rounded-2xl border p-7",
        protocol.highlight
          ? "scale-[1.03] border-slate bg-[#0e1c28]"
          : "border-slate/[0.18] bg-[#0d1218]",
      )}
    >
      {protocol.highlight && (
        <Badge variant="alabaster" className="w-fit">
          Mais popular
        </Badge>
      )}

      <div className="space-y-2">
        <p className="text-label-section text-slate">{protocol.name}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-price-highlight text-white">
            {formatBRL(protocol.price)}
          </span>
          <span className="text-sm text-slate">/mês</span>
        </div>
        <p className="text-[11px] text-slate">{protocol.sub}</p>
      </div>

      <Separator />

      <ul className="space-y-2.5">
        {protocol.items.map((slug) => {
          const product = getProductBySlug(slug);
          if (!product) return null;
          return (
            <li
              key={slug}
              className="flex items-center gap-2 text-sm text-arctic"
            >
              <Check size={14} className="shrink-0 text-slate-light" />
              {product.name}
            </li>
          );
        })}
      </ul>

      <p className="text-[11px] text-slate">
        Avulso: {formatBRL(protocol.fullPrice)} · Economize {formatBRL(savings)}
      </p>

      <Button
        asChild
        variant={protocol.highlight ? "alabaster" : "secondary"}
        className="w-full"
      >
        <Link href={`/protocolo/${protocol.slug}`}>Assinar protocolo</Link>
      </Button>
    </div>
  );
}
