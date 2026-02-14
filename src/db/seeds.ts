import crypto from "crypto";

import { db } from ".";
import { categoryTable, productTable } from "./schema";

// ✅ Imagens temporárias (depois você substitui pelas suas na Vercel)
const productImages = {
  "Tônico Capilar":
    "https://qocdohzlqpfhzyum.public.blob.vercel-storage.com/tonico-capilar.jpeg",
  "Shampoo Antiqueda":
    "https://qocdohzlqpfhzyum.public.blob.vercel-storage.com/shampoo-antiqueda.jpeg",
  "Óleo para Barba":
    "https://qocdohzlqpfhzyum.public.blob.vercel-storage.com/oleo-barba.jpeg",
  "Balm para Barba":
    "https://qocdohzlqpfhzyum.public.blob.vercel-storage.com/balm-barba.jpeg",
  "Pomada Fix Carnaúba":
    "https://qocdohzlqpfhzyum.public.blob.vercel-storage.com/pomada-carnauba.jpeg",
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

const categories = [
  {
    name: "Cabelo",
    description: "Produtos para tratamento e crescimento capilar",
  },
  {
    name: "Barba",
    description: "Cuidados e tratamentos para barba",
  },
  {
    name: "Styling",
    description: "Modelagem e finalização de cabelo e barba",
  },
];

const products = [
  // CABELO
  {
    name: "Tônico Capilar",
    description:
      "Estimula o crescimento capilar, fortalece os folículos e combate a queda. A combinação de ativos promove ação direta no bulbo capilar, revitalizando o couro cabeludo. Indicado para aplicação diária, com foco em áreas com rarefação.",
    categoryName: "Cabelo",
    volume: "60ml",
    priceInCents: 18000, // R$180,00
    ingredients: "Fricsoxidil, VEGF + BFGF, Jabo Randi, Alecrim",
    benefits:
      "Estimula o crescimento capilar, fortalece os folículos e combate a queda.",
    stock: 50,
  },
  {
    name: "Shampoo Antiqueda",
    description:
      "Limpeza equilibrada com ação fortalecedora. Remove o excesso de oleosidade do couro cabeludo sem agredir, enquanto entrega ativos que fortalecem os fios desde a raiz. Estimula o crescimento saudável e é indicado para uso contínuo.",
    categoryName: "Cabelo",
    volume: "140ml",
    priceInCents: 7000, // R$70,00
    ingredients: "D-Pantenol, Producine Diamina, Zinco PCA, Jaloronic",
    benefits:
      "Limpeza equilibrada com ação fortalecedora. Estimula o crescimento saudável.",
    stock: 100,
  },

  // BARBA
  {
    name: "Óleo para Barba",
    description:
      "Nutrição, brilho e controle para a barba. Sua fórmula leve combate o frizz e trata os fios ressecados, podendo ser usado como finalizador também no cabelo. Ideal para quem busca maciez e toque sedoso sem pesar.",
    categoryName: "Barba",
    volume: "20ml",
    priceInCents: 6000, // R$60,00
    ingredients: "Óleo de Argan, Extrato de Japotiabá",
    benefits:
      "Nutrição, brilho e controle para a barba. Combate o frizz e trata os fios ressecados.",
    stock: 75,
  },
  {
    name: "Balm para Barba",
    description:
      "Hidratação e força para a barba. Combina ativos botânicos que fortalecem, hidratam e revitalizam os fios faciais. Pode ser usado diariamente para alinhar, perfumar e manter a barba saudável e com toque macio.",
    categoryName: "Barba",
    volume: "30g",
    priceInCents: 7000, // R$70,00
    ingredients: "Alecrim, Jaborandi, Baicapil, Ceramidas",
    benefits:
      "Hidratação e força para a barba. Fortalece, hidrata e revitaliza os fios faciais.",
    stock: 60,
  },

  // STYLING
  {
    name: "Pomada Fix Carnaúba",
    description:
      "Fixação forte com efeito matte e acabamento seco. Modela os fios com precisão, mantendo o penteado por mais tempo sem deixar resíduos. Textura firme e aplicação prática para o dia a dia.",
    categoryName: "Styling",
    volume: "50g",
    priceInCents: 9000, // R$90,00
    ingredients: "Cera de Carnaúba",
    benefits:
      "Fixação forte com efeito matte. Modela os fios com precisão e mantém o penteado.",
    stock: 40,
  },
];

async function main() {
  console.log("🌱 Iniciando o seeding do Studio Montenegro...");

  try {
    // Limpar dados existentes
    console.log("🧹 Limpando dados existentes...");
    await db.delete(productTable);
    await db.delete(categoryTable);
    console.log("✅ Dados limpos com sucesso!");

    // Inserir categorias
    const categoryMap = new Map<string, string>();

    console.log("📂 Criando categorias...");
    for (const categoryData of categories) {
      const categoryId = crypto.randomUUID();
      const categorySlug = generateSlug(categoryData.name);

      console.log(`  📁 Criando categoria: ${categoryData.name}`);

      await db.insert(categoryTable).values({
        id: categoryId,
        name: categoryData.name,
        slug: categorySlug,
        description: categoryData.description,
      });

      categoryMap.set(categoryData.name, categoryId);
    }

    // Inserir produtos (SEM variantes)
    console.log("📦 Criando produtos...");
    for (const productData of products) {
      const productId = crypto.randomUUID();
      const productSlug = generateSlug(productData.name);
      const categoryId = categoryMap.get(productData.categoryName);

      if (!categoryId) {
        throw new Error(
          `Categoria "${productData.categoryName}" não encontrada`,
        );
      }

      const imageUrl =
        productImages[productData.name as keyof typeof productImages] ||
        "/products/placeholder.jpg";

      const trimmedImageUrl = imageUrl.trim();

      console.log(
        `  💼 Criando produto: ${productData.name} (${productData.volume})`,
      );

      await db.insert(productTable).values({
        id: productId,
        name: productData.name,
        slug: productSlug,
        description: productData.description,
        categoryId: categoryId,
        volume: productData.volume,
        priceInCents: productData.priceInCents,
        imageUrl: trimmedImageUrl,
        ingredients: productData.ingredients,
        benefits: productData.benefits,
        stock: productData.stock,
        isActive: true,
        createdAt: new Date(),
      });
    }

    console.log("✅ Seeding concluído com sucesso!");
    console.log(
      `📊 Foram criadas ${categories.length} categorias e ${products.length} produtos.`,
    );
    console.log("\n🎯 Produtos do Studio Montenegro:");
    products.forEach((p) => {
      console.log(
        `   - ${p.name} (${p.volume}) - R$${(p.priceInCents / 100).toFixed(2)}`,
      );
    });
  } catch (error) {
    console.error("❌ Erro durante o seeding:", error);
    throw error;
  }
}

main().catch(console.error);
