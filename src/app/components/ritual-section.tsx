import { Crown, FlaskConical, Timer } from "lucide-react";
import Link from "next/link";

import { BenefitCard } from "@/components/common/benefit-card";
import { RitualCanvas } from "@/components/ui/animated/ritual-canvas";
import { ScrollReveal } from "@/components/ui/animated/scroll-reveal";
import { Button } from "@/components/ui/button";

export function RitualSection() {
  return (
    <>
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <RitualCanvas className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-b from-onyx via-transparent to-onyx" />

        <ScrollReveal className="relative z-10 mx-auto max-w-xl px-6 text-center">
          <p className="text-label-section mb-4 text-slate-light">
            Por que TRIA
          </p>
          <h2 className="text-headline-section text-white">
            Sua aparência fala
            <br />
            <span className="text-slate-light">antes de você.</span>
          </h2>
          <p className="text-body-tria mt-5 text-slate-light">
            Homens que conquistam respeito cuidam de cada detalhe que fala por
            eles antes da primeira palavra.
          </p>

          <div className="mt-10 flex flex-col items-center gap-2">
            <span className="text-[10px] tracking-[0.2em] text-slate uppercase">
              Continue rolando
            </span>
            <span className="h-10 w-px bg-slate/40" />
          </div>
        </ScrollReveal>
      </section>

      <section className="bg-gradient-to-b from-onyx to-[#0d1218] px-6 py-24">
        <div className="mx-auto max-w-[600px]">
          <ScrollReveal className="mb-10 text-center">
            <p className="text-label-section mb-3 text-slate-light">
              Benefícios
            </p>
            <h3 className="text-headline-section text-white">
              O que TRIA faz por você
            </h3>
          </ScrollReveal>

          <div>
            <BenefitCard
              icon={Timer}
              title="Ritual de 5 minutos"
              description="Impecável antes de qualquer reunião, palestra ou compromisso."
              delay={0}
              floatDelay={0}
            />
            <BenefitCard
              icon={FlaskConical}
              title="Ativos clínicos que agem de verdade"
              description="D-Pantenol, Zinco PCA, Baicapil — ciência que trabalha no folículo capilar."
              delay={900}
              floatDelay={0.8}
            />
            <BenefitCard
              icon={Crown}
              title="Aparência que comunica antes de você falar"
              description="Cabelo, barba e couro cabeludo no controle. Presença que antecede a conversa."
              delay={1800}
              floatDelay={1.6}
            />
          </div>

          <ScrollReveal delay={3000} className="mt-10 text-center">
            <Button asChild variant="primary">
              <Link href="#kits">Escolher meu protocolo</Link>
            </Button>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
