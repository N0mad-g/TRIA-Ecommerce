import { Hero } from "@/app/components/hero";
import { ProductsSection } from "@/app/components/products-section";
import { ProtocolsSection } from "@/app/components/protocols-section";
import { RitualSection } from "@/app/components/ritual-section";
import { TestimonialsSection } from "@/app/components/testimonials-section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <RitualSection />
      <ProtocolsSection />
      <ProductsSection />
      <TestimonialsSection />
    </>
  );
}
