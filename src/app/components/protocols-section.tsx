import { ProtocolCard } from "@/components/common/protocol-card";
import { ScrollReveal } from "@/components/ui/animated/scroll-reveal";
import { PROTOCOLS } from "@/data/protocols";

export function ProtocolsSection() {
  return (
    <section id="kits" className="bg-onyx px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="mb-12 text-center">
          <p className="text-label-section mb-3 text-slate-light">
            Nossos protocolos
          </p>
          <h2 className="text-headline-section text-white">
            Escolha seu protocolo
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PROTOCOLS.map((protocol, index) => (
            <ScrollReveal key={protocol.slug} delay={index * 150}>
              <ProtocolCard protocol={protocol} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
