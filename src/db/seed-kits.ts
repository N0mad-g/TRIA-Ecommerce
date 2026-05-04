import { eq } from "drizzle-orm";

import { db } from ".";
import { kitProductTable, kitTable, productTable } from "./schema";

const kits = [
  {
    name: "Origin",
    slug: "origin",
    description:
      "O ponto de entrada da TRIA. Ciência aplicada desde o primeiro uso.",
    concept:
      "Para o homem que olhou no espelho e decidiu agir. A emoção central é o despertar.",
    priceInCents: 21900,
    originalPriceInCents: 25000,
    isActive: false,
    productSlugs: ["shampoo-antiqueda", "tonico-capilar"],
  },
  {
    name: "Reconstruct",
    slug: "reconstruct",
    description:
      "A rotina completa de quem leva o cabelo a sério. Limpar, tratar, finalizar.",
    concept:
      "A satisfação de ter um sistema que funciona. A pomada é a prova visível da reconstrução.",
    priceInCents: 28900,
    originalPriceInCents: 34000,
    isActive: false,
    productSlugs: ["shampoo-antiqueda", "tonico-capilar", "pomada-fix-carnauba"],
  },
  {
    name: "Define",
    slug: "define",
    description:
      "Dois ativos. Uma identidade. Para a barba que representa quem você é.",
    concept:
      "O homem que usa a barba como expressão de identidade. Olhar pro reflexo e se reconhecer.",
    priceInCents: 10900,
    originalPriceInCents: 13000,
    isActive: false,
    productSlugs: ["balm-para-barba", "oleo-para-barba"],
  },
  {
    name: "Complete",
    slug: "complete",
    description: "Todos os cinco produtos. A TRIA inteira. Sem concessões.",
    concept:
      "A emoção é chegada, não aspiração. Para o homem que não faz concessões com a própria presença.",
    priceInCents: 38900,
    originalPriceInCents: 47000,
    isActive: false,
    productSlugs: [
      "shampoo-antiqueda",
      "tonico-capilar",
      "pomada-fix-carnauba",
      "balm-para-barba",
      "oleo-para-barba",
    ],
  },
];

async function main() {
  console.log("🌱 Iniciando seed de kits...");

  for (const kitData of kits) {
    const { productSlugs, ...kitFields } = kitData;

    await db.transaction(async (tx) => {
      const existing = await tx
        .select({ id: kitTable.id })
        .from(kitTable)
        .where(eq(kitTable.slug, kitFields.slug));

      if (existing.length > 0) {
        console.log(`⏭️  Kit "${kitFields.name}" já existe — pulando.`);
        return;
      }

      const products: { id: string }[] = [];
      for (const slug of productSlugs) {
        const rows = await tx
          .select({ id: productTable.id })
          .from(productTable)
          .where(eq(productTable.slug, slug));

        if (rows.length === 0) {
          console.error(
            `❌ Produto com slug "${slug}" não encontrado — abortando kit "${kitFields.name}".`,
          );
          throw new Error(`Produto com slug '${slug}' não encontrado`);
        }

        products.push(rows[0]);
      }

      const [insertedKit] = await tx
        .insert(kitTable)
        .values(kitFields)
        .returning({ id: kitTable.id });

      await tx.insert(kitProductTable).values(
        products.map((p) => ({
          kitId: insertedKit.id,
          productId: p.id,
        })),
      );

      console.log(
        `✅ Kit "${kitFields.name}" inserido com ${products.length} produto(s).`,
      );
    });
  }

  console.log("🎉 Seed de kits concluído.");
}

main().catch((err) => {
  console.error("❌ Erro no seed de kits:", err);
  process.exit(1);
});
