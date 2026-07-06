"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Protocol } from "@/data/protocols";
import { formatBRL } from "@/lib/format";

export function PurchasePanel({ protocol }: { protocol: Protocol }) {
  const [mode, setMode] = useState<"assinatura" | "avulso">("assinatura");

  const price = mode === "assinatura" ? protocol.price : protocol.fullPrice;
  const suffix = mode === "assinatura" ? "/mês" : " à vista";

  return (
    <div className="space-y-6 rounded-2xl border border-slate/20 bg-[#0d1218] p-7">
      <Tabs value={mode} onValueChange={(value) => setMode(value as typeof mode)}>
        <TabsList>
          <TabsTrigger value="assinatura">Assinatura</TabsTrigger>
          <TabsTrigger value="avulso">Avulso</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-baseline gap-2">
        <span className="text-price-highlight text-white">
          {formatBRL(price)}
        </span>
        <span className="text-sm text-slate">{suffix}</span>
      </div>

      {mode === "assinatura" && (
        <p className="text-[11px] text-slate">
          Economize {formatBRL(protocol.fullPrice - protocol.price)} por mês em
          relação à compra avulsa.
        </p>
      )}

      <Button asChild className="w-full" variant="primary" size="lg">
        <Link href={`/checkout?kind=protocolo&slug=${protocol.slug}&mode=${mode}`}>
          Assinar protocolo
        </Link>
      </Button>
    </div>
  );
}
