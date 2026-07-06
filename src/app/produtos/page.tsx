import type { Metadata } from "next";

import { ProductsSection } from "@/app/components/products-section";

export const metadata: Metadata = {
  title: "Produtos",
  description:
    "Todos os produtos TRIA disponíveis para compra avulsa: shampoo, tônico, pomada, balm e óleo de barba.",
};

export default function ProdutosPage() {
  return <ProductsSection />;
}
