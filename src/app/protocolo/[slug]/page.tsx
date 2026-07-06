import { FlaskConical } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PurchasePanel } from "@/app/protocolo/[slug]/components/purchase-panel";
import { StickyCta } from "@/app/protocolo/[slug]/components/sticky-cta";
import { ScrollReveal } from "@/components/ui/animated/scroll-reveal";
import { getProductBySlug } from "@/data/products";
import { getProtocolBySlug, PROTOCOLS } from "@/data/protocols";

export function generateStaticParams() {
  return PROTOCOLS.map((protocol) => ({ slug: protocol.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const protocol = getProtocolBySlug(params.slug);
  if (!protocol) return {};

  return {
    title: protocol.name,
    description: protocol.description,
  };
}

export default function ProtocoloPage({
  params,
}: {
  params: { slug: string };
}) {
  const protocol = getProtocolBySlug(params.slug);

  if (!protocol) {
    notFound();
  }

  const products = protocol.items
    .map((slug) => getProductBySlug(slug))
    .filter((product): product is NonNullable<typeof product> => Boolean(product));

  const ativos = Array.from(
    new Set(products.flatMap((product) => product.ativos)),
  );

  return (
    <>
      <section className="border-b border-slate/15 bg-[#0d1218] px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-label-section mb-3 text-slate-light">
            {protocol.sub}
          </p>
          <h1 className="text-headline-section text-white">{protocol.name}</h1>
          <p className="text-body-tria mx-auto mt-4 max-w-md text-slate-light">
            {protocol.description}
          </p>
          <p className="text-[11px] text-slate mt-3">{protocol.audience}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-10 px-6 py-16 md:grid-cols-2">
        <ScrollReveal>
          <PurchasePanel protocol={protocol} />
        </ScrollReveal>

        <ScrollReveal delay={150} className="space-y-8">
          <div>
            <p className="text-label-section mb-4 text-slate-light">
              Produtos inclusos
            </p>
            <ul className="space-y-3">
              {products.map((product) => (
                <li key={product.slug}>
                  <Link
                    href={`/produto/${product.slug}`}
                    className="flex items-center justify-between rounded-xl border border-slate/20 px-4 py-3 text-sm text-arctic transition-colors hover:border-slate-light"
                  >
                    <span>{product.name}</span>
                    <span className="text-[11px] text-slate">
                      {product.volume}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate/30 bg-mountain/30 p-5">
            <div className="mb-3 flex items-center gap-2">
              <FlaskConical size={16} className="text-slate-light" />
              <p className="text-label-section text-slate-light">
                Ativos científicos
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {ativos.map((ativo) => (
                <span
                  key={ativo}
                  className="rounded-full border border-slate/30 px-3 py-1 text-[11px] text-arctic"
                >
                  {ativo}
                </span>
              ))}
            </div>
          </div>

          <Link
            href="/produtos"
            className="text-label-section block text-slate-light underline underline-offset-4 hover:text-arctic"
          >
            Ou compre os produtos individualmente
          </Link>
        </ScrollReveal>
      </section>

      <div className="h-20 md:hidden" />
      <StickyCta protocol={protocol} />
    </>
  );
}
