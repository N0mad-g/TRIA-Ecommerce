export type Protocol = {
  slug: string;
  name: string;
  sub: string;
  description: string;
  price: number;
  fullPrice: number;
  discount: number;
  highlight: boolean;
  items: string[];
  audience: string;
};

export const PROTOCOLS: Protocol[] = [
  {
    slug: "cuidados-diarios",
    name: "Cuidados Diários",
    sub: "Protocolo de manutenção diária",
    description: "O essencial do dia a dia para cabelo e estilo.",
    price: 135,
    fullPrice: 160,
    discount: 15,
    highlight: false,
    items: ["shampoo-antiqueda", "pomada-fix-carnauba"],
    audience: "Homens que querem manutenção simples e eficiente",
  },
  {
    slug: "ritual-de-autoridade",
    name: "Ritual de Autoridade",
    sub: "Protocolo completo de confiança",
    description:
      "O ritual de 5 minutos que garante presença e autoridade em qualquer ambiente.",
    price: 249,
    fullPrice: 290,
    discount: 14,
    highlight: true,
    items: [
      "shampoo-antiqueda",
      "pomada-fix-carnauba",
      "balm-barba",
      "oleo-barba",
    ],
    audience: "Homens que usam aparência como ativo de autoridade nos negócios",
  },
  {
    slug: "implante-alopecia",
    name: "Implante & Alopecia",
    sub: "Protocolo científico de recuperação",
    description:
      "Ativos clínicos específicos para pré/pós-implante capilar e tratamento de alopecia.",
    price: 209,
    fullPrice: 250,
    discount: 16,
    highlight: false,
    items: ["shampoo-antiqueda", "tonico-capilar"],
    audience: "Homens em processo pré/pós implante capilar ou com alopecia/calvície",
  },
];

export function getProtocolBySlug(slug: string) {
  return PROTOCOLS.find((protocol) => protocol.slug === slug);
}

export function getProtocolsForProduct(productSlug: string) {
  return PROTOCOLS.filter((protocol) => protocol.items.includes(productSlug));
}
