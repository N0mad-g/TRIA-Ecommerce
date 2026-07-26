import Link from 'next/link';
import type { Product } from '@/lib/data/catalog';

function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const SAMPLE_SIZE = 4;

export function ProductShowcase({ products }: { products: Product[] }) {
  const sample = products.slice(0, SAMPLE_SIZE);
  return (
    <section
      aria-labelledby="product-showcase-heading"
      className="mx-auto max-w-5xl px-4 py-12 text-center sm:px-8"
    >
      <h2 id="product-showcase-heading" className="text-2xl font-bold sm:text-3xl">
        Produtos
      </h2>
      <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {sample.map((product) => (
          <li key={product.id} className="rounded border p-4">
            <h3 className="text-sm font-semibold">{product.name}</h3>
            <p className="mt-1 text-sm">{formatPrice(product.priceCents)}</p>
          </li>
        ))}
      </ul>
      <Link href="/produtos" className="mt-6 inline-block underline">
        Ver todos os produtos
      </Link>
    </section>
  );
}
