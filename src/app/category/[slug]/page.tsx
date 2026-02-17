import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import Footer from "@/components/common/footer";
import { Header } from "@/components/common/header";
import ProductItem from "@/components/common/product-item";
import { db } from "@/db";
import { categoryTable, productTable } from "@/db/schema";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

const CategoryPage = async ({ params }: CategoryPageProps) => {
  const { slug } = await params;

  const [category] = await db
    .select()
    .from(categoryTable)
    .where(eq(categoryTable.slug, slug));

  if (!category) {
    return notFound();
  }

  // ✅ SEM variantes
  const products = await db
    .select()
    .from(productTable)
    .where(eq(productTable.categoryId, category.id));

  return (
    <>
      <Header />
      <div className="min-h-screen space-y-6 px-5 pb-10">
        <h2 className="text-xl font-semibold">{category.name}</h2>
        {products.length === 0 ? (
          <p className="text-muted-foreground text-center">
            Nenhum produto encontrado nesta categoria
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => (
              <ProductItem key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default CategoryPage;
