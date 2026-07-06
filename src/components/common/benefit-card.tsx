import type { LucideIcon } from "lucide-react";

import { ScrollReveal } from "@/components/ui/animated/scroll-reveal";

type BenefitCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
  floatDelay?: number;
};

export function BenefitCard({
  icon: Icon,
  title,
  description,
  delay = 0,
  floatDelay = 0,
}: BenefitCardProps) {
  return (
    <ScrollReveal delay={delay} className="border-t border-slate/15 py-8 first:border-t-0">
      <div className="flex items-start gap-5">
        <div
          className="animate-float flex size-11 shrink-0 items-center justify-center rounded-full border border-slate/30 text-slate-light"
          style={{ animationDelay: `${floatDelay}s` }}
        >
          <Icon size={20} />
        </div>
        <div className="space-y-2">
          <h3 className="text-base font-bold text-white">{title}</h3>
          <p className="text-body-tria text-slate-light">{description}</p>
        </div>
      </div>
    </ScrollReveal>
  );
}
