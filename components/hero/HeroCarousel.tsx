'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LeadForm } from './LeadForm';

const AUTOPLAY_INTERVAL_MS = 6000;
const SLIDE_COUNT = 3;

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDE_COUNT);
    }, AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused]);

  function goTo(next: number) {
    setIndex((next + SLIDE_COUNT) % SLIDE_COUNT);
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Destaques TRIA"
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative flex flex-col items-center gap-6 px-4 py-12 text-center sm:px-8 sm:py-16 md:py-24"
    >
      <div aria-live="polite" className="flex w-full max-w-2xl flex-col items-center gap-4">
        {index === 0 && (
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">
              TRIA — Ciência para reconstruir sua identidade
            </h1>
            <p className="text-base sm:text-lg">
              Protocolos e produtos formulados para cabelo e barba, com resultado comprovado.
            </p>
          </div>
        )}
        {index === 1 && (
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
              Conheça o Ritual de Autoridade
            </h2>
            <p className="text-base sm:text-lg">
              O protocolo mais popular da TRIA — assinatura mensal ou anual.
            </p>
            <Link href="/assinatura" className="underline">
              Ver assinatura
            </Link>
          </div>
        )}
        {index === 2 && (
          <div className="flex w-full flex-col items-center gap-4">
            <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">Quer saber mais?</h2>
            <LeadForm />
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Slide anterior"
          onClick={() => goTo(index - 1)}
          className="p-2 text-xl"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Próximo slide"
          onClick={() => goTo(index + 1)}
          className="p-2 text-xl"
        >
          ›
        </button>
      </div>

      <div aria-label="Navegação do carrossel" className="flex gap-2">
        {Array.from({ length: SLIDE_COUNT }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Ir para slide ${i + 1}`}
            aria-current={index === i}
            onClick={() => goTo(i)}
            className="h-2.5 w-2.5 rounded-full bg-current opacity-40 aria-[current=true]:opacity-100"
          />
        ))}
      </div>
    </section>
  );
}
