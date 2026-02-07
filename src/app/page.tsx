import { desc } from "drizzle-orm";
import Image from "next/image";

import CategorySelector from "@/components/common/category-selector";
import Footer from "@/components/common/footer";
import { Header } from "@/components/common/header";
import ProductList from "@/components/common/product-List";
import { db } from "@/db";
import { categoryTable, productTable } from "@/db/schema";

const Home = async () => {
  // Busca produtos
  const products = await db.select().from(productTable);

  // Produtos mais recentes
  const newlyCreatedProducts = await db
    .select()
    .from(productTable)
    .orderBy(desc(productTable.createdAt));

  // Busca categorias
  const categories = await db.select().from(categoryTable);

  return (
    <>
      <Header />
      <div className="space-y-6">
        {/* Banner Principal */}
        <div className="px-5">
          <Image
            src="/banner-01.png"
            alt="Resultados visíveis com ativos potentes"
            height={0}
            width={0}
            sizes="100vw"
            className="h-auto w-full rounded-lg"
          />
        </div>

        {/* Mais Vendidos */}
        <ProductList products={products} title="Mais vendidos" />

        {/* Seletor de Categorias */}
        <div className="px-5">
          <CategorySelector categories={categories} />
        </div>

        {/* Banner Secundário */}
        <div className="px-5">
          <Image
            src="/banner-02.png"
            alt="Cuide da sua barba com estilo"
            height={0}
            width={0}
            sizes="100vw"
            className="h-auto w-full rounded-lg"
          />
        </div>

        {/* Novos Produtos */}
        <ProductList products={newlyCreatedProducts} title="Novos produtos" />

        <Footer />
      </div>
    </>
  );
};

export default Home;
