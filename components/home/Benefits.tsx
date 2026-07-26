// 3 pilares de benefício (PRD FR2/AC2) — copy final é responsabilidade do time de conteúdo.
const PILLARS = [
  {
    title: 'Ativos com Ciência',
    description: 'Fórmulas com concentração eficaz dos ativos, não só listados no rótulo.',
  },
  {
    title: 'Protocolo, não produto avulso',
    description: 'Rotina completa pensada para o resultado, não uma compra isolada.',
  },
  {
    title: 'Resultado Acompanhado',
    description: 'Resultado mensurável, validado por quem já usa — não promessa genérica.',
  },
];

export function Benefits() {
  return (
    <section aria-labelledby="benefits-heading" className="mx-auto max-w-5xl px-4 py-12 sm:px-8">
      <h2 id="benefits-heading" className="text-center text-2xl font-bold sm:text-3xl">
        Benefícios
      </h2>
      <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {PILLARS.map((pillar) => (
          <li key={pillar.title} className="text-center">
            <h3 className="text-lg font-semibold">{pillar.title}</h3>
            <p className="mt-2 text-sm">{pillar.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
