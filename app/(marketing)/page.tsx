import { getProducts, getProtocols } from '@/lib/data/catalog';
import { HeroCarousel } from '@/components/hero/HeroCarousel';
import { WhyTria } from '@/components/home/WhyTria';
import { Benefits } from '@/components/home/Benefits';
import { Testimonials } from '@/components/home/Testimonials';
import { ProtocolShowcase } from '@/components/protocol/ProtocolShowcase';
import { ProductShowcase } from '@/components/product/ProductShowcase';

export const revalidate = 3600;

export default async function Home() {
  const [products, protocols] = await Promise.all([getProducts(), getProtocols()]);

  return (
    <main className="flex flex-col">
      <HeroCarousel />
      <WhyTria />
      <Benefits />
      <ProtocolShowcase protocols={protocols} />
      <ProductShowcase products={products} />
      <Testimonials />
    </main>
  );
}
