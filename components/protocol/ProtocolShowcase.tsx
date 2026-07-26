import Link from 'next/link';
import type { Protocol } from '@/lib/data/catalog';

function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function ProtocolShowcase({ protocols }: { protocols: Protocol[] }) {
  return (
    <section
      aria-labelledby="protocol-showcase-heading"
      className="mx-auto max-w-5xl px-4 py-12 text-center sm:px-8"
    >
      <h2 id="protocol-showcase-heading" className="text-2xl font-bold sm:text-3xl">
        Protocolos
      </h2>
      <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {protocols.map((protocol) => (
          <li key={protocol.id} className="rounded border p-4">
            {protocol.isFeatured && (
              <span className="mb-2 inline-block rounded bg-foreground px-2 py-0.5 text-xs text-background">
                Mais Popular
              </span>
            )}
            <h3 className="text-lg font-semibold">{protocol.name}</h3>
            <p className="mt-1 text-sm">{formatPrice(protocol.monthlyPriceCents)}/mês</p>
          </li>
        ))}
      </ul>
      <Link href="/assinatura" className="mt-6 inline-block underline">
        Ver assinaturas
      </Link>
    </section>
  );
}
