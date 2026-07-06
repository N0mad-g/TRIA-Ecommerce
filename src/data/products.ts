export type ProductCategory = "Cabelo" | "Barba";

export type Product = {
  slug: string;
  name: string;
  volume: string;
  price: number;
  category: ProductCategory;
  ativos: string[];
  description: string;
  image: string;
};

export const PRODUCTS: Product[] = [
  {
    slug: "shampoo-antiqueda",
    name: "Shampoo Antiqueda",
    volume: "140ml",
    price: 70,
    category: "Cabelo",
    ativos: ["D-Pantenol", "Producine Diamina", "Zinco PCA", "Jaloronic"],
    description:
      "Shampoo de uso diário com ativos que combatem a queda e equilibram o couro cabeludo.",
    image: "/images/products/shampoo.png",
  },
  {
    slug: "tonico-capilar",
    name: "Tônico Capilar",
    volume: "60ml",
    price: 180,
    category: "Cabelo",
    ativos: ["Fricsoxidil", "VEGF + BFGF", "Jaborandi", "Alecrim"],
    description:
      "Tônico de alta performance que estimula o crescimento capilar e fortalece os folículos.",
    image: "/images/products/tonico.png",
  },
  {
    slug: "pomada-fix-carnauba",
    name: "Pomada Fix Carnaúba",
    volume: "50g",
    price: 90,
    category: "Cabelo",
    ativos: ["Cera de Carnaúba"],
    description:
      "Pomada com fixação forte e acabamento impecável. Ideal para qualquer estilo.",
    image: "/images/products/pomada.png",
  },
  {
    slug: "balm-barba",
    name: "Balm para Barba",
    volume: "30g",
    price: 70,
    category: "Barba",
    ativos: ["Alecrim", "Jaborandi", "Baicapil", "Ceramidas"],
    description:
      "Hidrata, define e amacia a barba com ativos que estimulam o crescimento.",
    image: "/images/products/balm.png",
  },
  {
    slug: "oleo-barba",
    name: "Óleo para Barba",
    volume: "20ml",
    price: 60,
    category: "Barba",
    ativos: ["Óleo de Argan", "Extrato de Japotiabá"],
    description:
      "Óleo nutritivo para barba macia, hidratada e com brilho natural.",
    image: "/images/products/oleo.png",
  },
];

export function getProductBySlug(slug: string) {
  return PRODUCTS.find((product) => product.slug === slug);
}
