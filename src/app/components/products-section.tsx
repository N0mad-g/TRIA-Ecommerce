"use client";

import { useState } from "react";

import { ProductCard } from "@/components/common/product-card";
import { ScrollReveal } from "@/components/ui/animated/scroll-reveal";
import { type ProductCategory,PRODUCTS } from "@/data/products";
import { cn } from "@/lib/utils";

const FILTERS: Array<{ label: string; value: ProductCategory | "Todos" }> = [
  { label: "Todos", value: "Todos" },
  { label: "Cabelo", value: "Cabelo" },
  { label: "Barba", value: "Barba" },
];

export function ProductsSection() {
  const [filter, setFilter] = useState<ProductCategory | "Todos">("Todos");

  const products =
    filter === "Todos"
      ? PRODUCTS
      : PRODUCTS.filter((product) => product.category === filter);

  return (
    <section className="bg-alabaster px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="mb-10 text-center">
          <p className="text-label-section mb-3 text-slate">Produtos</p>
          <h2 className="text-headline-section text-onyx">Produtos</h2>
        </ScrollReveal>

        <div className="mb-10 flex justify-center gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={cn(
                "rounded-full px-5 py-2 text-xs font-semibold tracking-wide uppercase transition-colors",
                filter === item.value
                  ? "bg-onyx text-white"
                  : "border border-slate/40 text-slate",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
