import { AddToCartButton } from "@/app/produto/[slug]/components/add-to-cart-button";
import type { Product } from "@/data/products";
import { formatBRL } from "@/lib/format";

export function StickyAddToCart({ product }: { product: Product }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-slate/20 bg-onyx/95 px-6 py-4 backdrop-blur-xl md:hidden">
      <p className="text-sm font-bold text-white">
        {formatBRL(product.price)}
      </p>
      <div className="max-w-[220px] flex-1">
        <AddToCartButton slug={product.slug} />
      </div>
    </div>
  );
}
