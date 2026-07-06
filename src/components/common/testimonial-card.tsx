import type { Testimonial } from "@/data/testimonials";

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="flex w-[320px] shrink-0 flex-col gap-5 rounded-2xl border border-slate/[0.18] bg-[#0d1218] p-7">
      <span
        className="font-serif text-[40px] leading-none text-slate opacity-60"
        aria-hidden="true"
      >
        &ldquo;
      </span>

      <p className="text-body-tria flex-1 text-arctic italic">
        {testimonial.quote}
      </p>

      <div className="h-px w-full bg-slate/20" />

      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-mountain text-sm font-bold text-arctic">
          {testimonial.name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{testimonial.name}</p>
          <p className="text-[11px] text-slate-light">{testimonial.protocol}</p>
        </div>
      </div>
    </div>
  );
}
