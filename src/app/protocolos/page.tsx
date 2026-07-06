import type { Metadata } from "next";

import { ProtocolCard } from "@/components/common/protocol-card";
import { ScrollReveal } from "@/components/ui/animated/scroll-reveal";
import { PROTOCOLS } from "@/data/protocols";

export const metadata: Metadata = {
  title: "Protocolos",
  description:
    "Conheça os três protocolos científicos da TRIA: Cuidados Diários, Ritual de Autoridade e Implante & Alopecia.",
};

export default function ProtocolosPage() {
  return (
    <section className="bg-onyx px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="mb-12 text-center">
          <p className="text-label-section mb-3 text-slate-light">
            Nossos protocolos
          </p>
          <h1 className="text-headline-section text-white">
            Escolha seu protocolo
          </h1>
          <p className="text-body-tria mx-auto mt-4 max-w-md text-slate-light">
            Sistemas completos, não produtos isolados. Cada protocolo resolve
            uma fase específica da sua jornada.
          </p>
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
