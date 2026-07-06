export type Testimonial = {
  name: string;
  protocol: string;
  quote: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Rafael M.",
    protocol: "Ritual de Autoridade",
    quote:
      "Parei de pensar em cabelo toda manhã. Cinco minutos e sigo pra reunião com a cabeça no lugar certa.",
  },
  {
    name: "Bruno C.",
    protocol: "Implante & Alopecia",
    quote:
      "Segui o protocolo no pós-implante à risca. Foi o único cuidado que respeitou o processo sem prometer milagre.",
  },
  {
    name: "Diego A.",
    protocol: "Cuidados Diários",
    quote:
      "Troquei três produtos avulsos por um protocolo só. Menos decisão, mais consistência.",
  },
  {
    name: "Felipe S.",
    protocol: "Ritual de Autoridade",
    quote:
      "Não é sobre vaidade. É sobre chegar em qualquer lugar com controle sobre a própria imagem.",
  },
];
