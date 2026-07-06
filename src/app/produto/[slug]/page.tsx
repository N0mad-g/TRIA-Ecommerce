import { Check } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCartButton } from "@/app/produto/[slug]/components/add-to-cart-button";
import { StickyAddToCart } from "@/app/produto/[slug]/components/sticky-add-to-cart";
import { ScrollReveal } from "@/components/ui/animated/scroll-reveal";
import { getProductBySlug, PRODUCTS } from "@/data/products";
import { getProtocolsForProduct } from "@/data/protocols";
import { formatBRL } from "@/lib/format";

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: product.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const product = getProductBySlug(params.slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.description,
  };
}

export default function ProdutoPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const relatedProtocol = getProtocolsForProduct(product.slug)[0];

  return (
    <>
      <section className="mx-auto grid max-w-5xl gap-12 px-6 py-16 md:grid-cols-2">
        <ScrollReveal className="flex items-center justify-center rounded-2xl bg-[#F4F3F1] p-10">
          <Image
            src={product.image}
            alt={product.name}
            width={260}
            height={340}
            className="h-auto w-full max-w-[260px] object-contain"
          />
        </ScrollReveal>

        <ScrollReveal delay={150} className="space-y-6">
          <div>
            <span className="text-label-section text-slate">
              {product.category}
            </span>
            <h1 className="mt-2 text-3xl font-extrabold text-white">
              {product.name}
            </h1>
            <p className="mt-1 text-sm text-slate-light">{product.volume}</p>
          </div>

          <p className="text-price-highlight text-white">
            {formatBRL(product.price)}
          </p>

          {relatedProtocol && (
            <Link
              href={`/protocolo/${relatedProtocol.slug}`}
              className="text-label-section block text-slate-light underline underline-offset-4 hover:text-arctic"
            >
              Ou assine o {relatedProtocol.name} e pague{" "}
              {formatBRL(relatedProtocol.price)}/mês →
            </Link>
          )}

          <p className="text-body-tria text-slate-light">
            {product.description}
          </p>

          <div className="rounded-xl border border-slate/30 bg-mountain/30 p-5">
            <p className="text-label-section mb-3 text-slate-light">
              Ativos
            </p>
            <div className="flex flex-wrap gap-2">
              {product.ativos.map((ativo) => (
                <span
                  key={ativo}
                  className="rounded-full border border-slate/30 px-3 py-1 text-[11px] text-arctic"
                >
                  {ativo}
                </span>
              ))}
            </div>
          </div>

          <ul className="space-y-2">
            {product.ativos.map((ativo) => (
              <li
                key={ativo}
                className="flex items-center gap-2 text-sm text-arctic"
              >
                <Check size={14} className="shrink-0 text-slate-light" />
                Age diretamente no folículo com {ativo}
              </li>
            ))}
          </ul>

          <div className="hidden md:block">
            <AddToCartButton slug={product.slug} />
          </div>
        </ScrollReveal>
      </section>

      <div className="h-20 md:hidden" />
      <StickyAddToCart product={product} />
    </>
  );
}
