import Image from "next/image";
import Link from "next/link";

import type { Product } from "@/data/products";
import { formatBRL } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/produto/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
    >
      <div className="relative flex h-[220px] items-center justify-center bg-[#F4F3F1] p-4">
        <Image
          src={product.image}
          alt={product.name}
          width={140}
          height={190}
          className="h-full w-auto object-contain transition-transform duration-300 group-hover:scale-[1.06]"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="text-label-section text-slate">
          {product.category}
        </span>
        <h3 className="text-[13px] font-bold text-onyx">{product.name}</h3>
        <span className="text-[10px] text-slate">{product.volume}</span>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-bold text-onyx">
            {formatBRL(product.price)}
          </span>
          <span className="rounded-full bg-onyx px-4 py-1.5 text-[10px] font-semibold tracking-wide text-white uppercase">
            Add
          </span>
        </div>
      </div>
    </Link>
  );
}
