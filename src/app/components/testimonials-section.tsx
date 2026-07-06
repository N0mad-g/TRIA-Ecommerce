import { TestimonialCard } from "@/components/common/testimonial-card";
import { ScrollReveal } from "@/components/ui/animated/scroll-reveal";
import { TESTIMONIALS } from "@/data/testimonials";

export function TestimonialsSection() {
  return (
    <section className="bg-gradient-to-b from-[#0d161e] to-onyx px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="mb-10 text-center">
          <p className="text-label-section mb-3 text-slate-light">
            Depoimentos
          </p>
          <h2 className="text-headline-section text-white">
            Resultados reais
          </h2>
        </ScrollReveal>

        <div className="no-scrollbar flex gap-5 overflow-x-auto px-1 pb-2">
          {TESTIMONIALS.map((testimonial) => (
            <TestimonialCard
              key={testimonial.name}
              testimonial={testimonial}
            />
          ))}
        </div>

        <p className="text-label-section mt-6 text-center text-slate">
          Deslize para ver mais →
        </p>
      </div>
    </section>
  );
}
