import { eq } from "drizzle-orm";
import Image from "next/image";
import { notFound } from "next/navigation";

import Footer from "@/components/common/footer";
import { Header } from "@/components/common/header";
import ProductList from "@/components/common/product-List";
import { db } from "@/db";
import { productTable } from "@/db/schema";
import { formatCentsToBRL } from "@/lib/helpers/money";

import ProductActions from "./components/product-actions";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

const ProductPage = async ({ params }: ProductPageProps) => {
  const { slug } = await params;

  // ✅ Busca produto direto (sem variantes)
  const [product] = await db
    .select()
    .from(productTable)
    .where(eq(productTable.slug, slug));

  if (!product) {
    return notFound();
  }

  // Produtos relacionados (mesma categoria)
  const relatedProducts = await db
    .select()
    .from(productTable)
    .where(eq(productTable.categoryId, product.categoryId));

  return (
    <>
      <Header />
      <div className="flex flex-col space-y-6">
        {/* Imagem do produto */}
        <Image
          src={product.imageUrl.trim()}
          alt={product.name}
          sizes="100vw"
          height={0}
          width={0}
          className="h-auto w-full object-cover"
        />

        {/* Informações do produto */}
        <div className="space-y-2 px-5">
          <h2 className="text-lg font-semibold">{product.name}</h2>
          <p className="text-muted-foreground text-sm">{product.volume}</p>{" "}
          {/* ✅ Mostra volume */}
          <h3 className="text-lg font-semibold">
            {formatCentsToBRL(product.priceInCents)}
          </h3>
        </div>

        {/* Ações (quantidade + botões) */}
        <ProductActions productId={product.id} />

        {/* Descrição e benefícios */}
        <div className="space-y-4 px-5">
          <div>
            <h4 className="mb-2 font-semibold">Descrição</h4>
            <p className="text-muted-foreground text-sm">
              {product.description}
            </p>
          </div>

          {product.ingredients && (
            <div>
              <h4 className="mb-2 font-semibold">Ativos</h4>
              <p className="text-muted-foreground text-sm">
                {product.ingredients}
              </p>
            </div>
          )}

          {product.benefits && (
            <div>
              <h4 className="mb-2 font-semibold">Benefícios</h4>
              <p className="text-muted-foreground text-sm">
                {product.benefits}
              </p>
            </div>
          )}
        </div>

        {/* Produtos relacionados */}
        <ProductList
          title="Você também pode gostar"
          products={relatedProducts}
        />

        <Footer />
      </div>
    </>
  );
};

export default ProductPage;
