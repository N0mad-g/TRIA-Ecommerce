import Link from "next/link";

import { AnimatedHeadline } from "@/components/ui/animated/animated-headline";
import { DNACanvas } from "@/components/ui/animated/dna-canvas";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-onyx">
      <DNACanvas className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-gradient-to-r from-onyx via-onyx/85 to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
        <div className="max-w-[540px] space-y-6">
          <p className="text-label-section text-slate-light">
            Ciência para reconstruir
          </p>

          <AnimatedHeadline
            className="text-white"
            words={[
              { text: "Reconstrua" },
              { text: "sua" },
              { text: "identidade.", className: "text-arctic" },
            ]}
          />

          <p className="text-body-tria max-w-[420px] text-slate-light">
            Ativos clínicos que agem no folículo capilar, no couro cabeludo e na
            barba — através de protocolos científicos, não produtos avulsos.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Button asChild variant="primary">
              <Link href="/protocolos">Ver protocolos</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/produtos">Produtos avulsos</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2">
        <span className="text-[10px] tracking-[0.2em] text-slate-light uppercase">
          Rolar
        </span>
        <span className="h-10 w-px bg-slate/40" />
      </div>
    </section>
  );
}
