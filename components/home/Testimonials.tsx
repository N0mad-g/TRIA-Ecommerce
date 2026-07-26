// Depoimentos (PRD FR2/AC2) — copy final é responsabilidade do time de conteúdo.
const TESTIMONIALS = [
  {
    quote: 'Em 3 meses de Ritual de Autoridade percebi diferença real no volume do cabelo.',
    author: 'Rafael M.',
  },
  {
    quote: 'Nunca tinha usado nada que realmente cuidasse da barba de verdade, não só perfumasse.',
    author: 'Diego S.',
  },
  {
    quote: 'A assinatura resolveu — chega em casa e eu nem preciso lembrar de comprar.',
    author: 'Bruno A.',
  },
];

export function Testimonials() {
  return (
    <section aria-labelledby="testimonials-heading" className="mx-auto max-w-5xl px-4 py-12 sm:px-8">
      <h2 id="testimonials-heading" className="text-center text-2xl font-bold sm:text-3xl">
        Depoimentos
      </h2>
      <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {TESTIMONIALS.map((testimonial) => (
          <li key={testimonial.author}>
            <blockquote className="text-sm">
              <p>&ldquo;{testimonial.quote}&rdquo;</p>
              <footer className="mt-2 font-medium">{testimonial.author}</footer>
            </blockquote>
          </li>
        ))}
      </ul>
    </section>
  );
}
