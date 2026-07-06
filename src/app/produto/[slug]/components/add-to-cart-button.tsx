import Link from "next/link";

import { Button } from "@/components/ui/button";

export function AddToCartButton({ slug }: { slug: string }) {
  return (
    <Button asChild variant="dark" size="lg" className="w-full">
      <Link href={`/checkout?kind=produto&slug=${slug}&mode=avulso`}>
        Adicionar ao carrinho
      </Link>
    </Button>
  );
}
