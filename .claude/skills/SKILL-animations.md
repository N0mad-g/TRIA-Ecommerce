# SKILL: Animações e Interações — UX/UI

Este arquivo define as regras, padrões e comportamentos que o Claude deve seguir ao implementar animações e interações neste projeto. Leia e siga tudo antes de qualquer implementação visual.

---

## Leitura obrigatória de outras skills

Antes de executar qualquer tarefa, verifique se existem outras skills relevantes no projeto e leia-as **antes** de prosseguir. As skills trabalham em conjunto e nunca de forma isolada — divergências entre elas devem ser evitadas.

- Se a tarefa envolver **textos, títulos, chamadas ou copywriting** → leia a skill de Copywriting antes de definir qualquer animação de texto (text reveals, stagger de palavras, etc.), pois o tom e a estrutura do copy influenciam diretamente o tipo de animação adequada.
- Se a tarefa envolver **identidade visual, cores ou tipografia** → leia a skill de Design Visual (quando criada) antes de definir qualquer efeito, pois paleta e fonte impactam timing e intensidade das animações.
- Se houver conflito entre esta skill e outra, **sinalize antes de agir** e aguarde instrução.

**Como encontrar outras skills:** procure arquivos `Claude.md` na raiz ou em `.claude/skills/skill-copywriting/SKILL.md`

---

## Seção 0 — Filosofia de animação

Este site tem identidade **minimalista com pegada de ciência e tecnologia**, com um toque de elegância. As animações devem reforçar essa identidade — nunca chamar mais atenção do que o conteúdo.

**Princípios inegociáveis:**

- Menos é mais. Prefira uma animação sutil e bem executada a várias animações chamativas.
- Animações devem ter **propósito** — guiar o olhar, dar feedback, revelar conteúdo.
- Nada deve parecer "pesado" ou "carregado". O site deve se sentir fluido e preciso.
- Respeite `prefers-reduced-motion`. Toda animação deve ter fallback para usuários que desativam movimento.

---

## Seção 1 — Paleta e tom visual

- **Cores:** paleta "Obsidian Chrome" — onyx (`#0A0A0A`), mountain (`#1e2a33`), slate (`#536878`), slate-light (`#7a96a8`), arctic (`#D3D1CE`), alabaster (`#E5E4E2`), white (`#FFFFFF`). Ver `CLAUDE.md` / briefing da marca para regra de uso de cada cor por seção.
- **Sensação:** dark luxury, científico, masculino, sofisticado. Como um produto de tecnologia premium.
- **Tipografia em animação:** reveals devem ser suaves, nunca abruptos.
- **Sombras e blur:** use com moderação para criar profundidade sem poluição.

---

## Seção 2 — Bibliotecas utilizadas

### Framer Motion

- Biblioteca principal de animação do projeto: scroll reveals, transições de página, entrada/saída de componentes e hover effects.
- **Instalar:** `npm install framer-motion`
- Prefira `motion` components nativos (`motion.div`, `motion.section`) a wrappers desnecessários.
- Use `whileInView` + `viewport={{ once: true }}` para scroll reveals (substitui GSAP ScrollTrigger).
- Use `AnimatePresence` para animações de saída de componentes.
- Use `variants` para organizar estados de animação — nunca inline quando houver mais de 2 estados.

### Canvas API nativo

- Usar para os efeitos de fundo autorais do site (ex: `DNACanvas` no hero, `RitualCanvas` na seção de ritual) — partículas, traços e efeitos que não se encaixam em variants declarativos do Framer Motion.
- Sempre rodar dentro de `useEffect`/hook customizado, com `requestAnimationFrame`, e cancelar o frame + remover listeners no cleanup.
- Pausar o loop de animação quando `prefers-reduced-motion: reduce` estiver ativo (renderizar um frame estático).

### Não usar

- ❌ NUNCA instale GSAP, Lenis, ou outra biblioteca de animação sem aprovação — o projeto usa Framer Motion + Canvas API nativo.

---

## Seção 3 — Scroll Animations (Framer Motion `whileInView`)

### Padrões permitidos

- **Fade in + translate Y:** elementos entrando de baixo para cima suavemente ao entrar no viewport.
- **Stagger reveals:** listas e grids revelando itens em sequência com delay entre eles (`staggerChildren` em `variants` do container).
- **Text reveal palavra a palavra:** headlines revelando palavra por palavra via `motion.span` individuais (ver `AnimatedHeadline`).
- **Parallax sutil:** elementos de fundo se movendo em velocidade diferente do scroll — use com moderação, máximo 20-30px de deslocamento.
- **Delay escalonado por card:** usado nas seções de Benefícios/Protocolos (ex: 0ms / 900ms / 1800ms) via `transition.delay`.

### Valores padrão de timing

```ts
// Duração padrão de scroll reveal
duration: 1.2; // segundos

// Ease padrão de entrada
ease: [0.16, 1, 0.3, 1]; // expo-out customizado

// Stagger entre itens de lista/grid
staggerChildren: 0.15;

// viewport padrão do whileInView
viewport: { once: true, margin: "-15% 0px" };
```

### Exemplo base — scroll reveal com `whileInView`

```tsx
export const scrollRevealVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
  },
};

<motion.div
  variants={scrollRevealVariants}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-15% 0px" }}
>
  {/* conteúdo */}
</motion.div>;
```

### O que evitar

- ❌ Animações de scroll em todos os elementos da página — escolha os mais importantes.
- ❌ `duration` acima de 1.2s para animações de entrada.
- ❌ Parallax com deslocamento maior que 30px.
- ❌ Repetir a animação toda vez que o elemento reentra no viewport — use `viewport={{ once: true }}`.

---

## Seção 4 — Transições de Página (Framer Motion)

- Use `AnimatePresence` no layout raiz para envolver o conteúdo da página.
- A transição padrão deve ser **fade simples** — sem slides ou flips.
- Duração máxima de transição de página: **0.4s**.

### Variantes padrão de página

```ts
export const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.3, ease: "easeIn" } },
};
```

### Uso no componente de página

```tsx
import { motion } from "framer-motion";
import { pageVariants } from "@/lib/animations";

export default function Page() {
  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* conteúdo */}
    </motion.main>
  );
}
```

### O que evitar

- ❌ Transições com `scale` — parecem pesadas demais para o estilo do site.
- ❌ Duração acima de 0.5s para transições de página.
- ❌ Slides laterais — use apenas fade + translate Y sutil.

---

## Seção 5 — Hover Effects (Framer Motion + CSS)

### Padrões permitidos

- **Scale sutil:** `scale: 1.02` a `scale: 1.04` — nunca acima de 1.05.
- **Opacity shift:** reduzir para `0.7` no hover de elementos secundários.
- **Underline animado:** linha crescendo da esquerda para direita em links.
- **Border/outline reveal:** borda aparecendo suavemente no hover de cards.
- **Magnetic effect:** elemento seguindo levemente o cursor (usar com moderação, apenas em elementos de destaque como CTAs).
- **Background fill:** fundo preenchendo de baixo para cima em botões (usando `::before` com `scaleY`).

### Valores padrão de hover

```ts
// Transição padrão de hover (Framer Motion)
transition: { duration: 0.2, ease: "easeOut" }

// Scale padrão
whileHover: { scale: 1.02 }

// Para botões primários
whileHover: { scale: 1.02 }
whileTap: { scale: 0.98 }
```

### Exemplo base — card com hover

```tsx
<motion.div
  whileHover={{ scale: 1.02, transition: { duration: 0.2, ease: "easeOut" } }}
  whileTap={{ scale: 0.98 }}
  className="cursor-pointer rounded-lg border border-neutral-200 p-6"
>
  {/* conteúdo */}
</motion.div>
```

### O que evitar

- ❌ `scale` acima de 1.05 — fica desproporcional.
- ❌ Hover effects em todos os elementos — reserve para elementos interativos.
- ❌ Rotações no hover — não combinam com o estilo do site.
- ❌ Shadows exageradas no hover.

---

## Seção 6 — Acessibilidade

- **SEMPRE** verifique `prefers-reduced-motion` antes de aplicar animações:
  ```ts
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  ```
- Use o hook `useReducedMotion` do `framer-motion` para condicionar variants no React:
  ```ts
  import { useReducedMotion } from "framer-motion";
  const prefersReducedMotion = useReducedMotion();
  ```
- No Framer Motion, passe `transition: { duration: 0 }` quando `prefersReducedMotion` for `true`.
- No Canvas API nativo (`DNACanvas`, `RitualCanvas`), verifique `prefersReducedMotion` antes de iniciar o loop de `requestAnimationFrame` e renderize um frame estático em vez disso.
- Animações nunca devem bloquear interação ou leitura de conteúdo.

---

## Seção 7 — Organização de arquivos

- Centralize variantes e configurações de animação reutilizáveis em `src/lib/animations.ts`.
- Hooks de animação customizados vão em `src/hooks/animations/`.
- Componentes com animação complexa (ex: text reveal, magnetic button) devem ser isolados em `src/components/ui/animated/`.
- NUNCA inline animações complexas diretamente no JSX da página — extraia para variantes ou componentes.

---

## Seção 8 — O que nunca fazer

- ❌ NUNCA instale outras bibliotecas de animação sem aprovação (ex: GSAP, Lenis, anime.js, velocity.js, mo.js)
- ❌ NUNCA use `setTimeout` para sincronizar animações — use `transition.delay` do Framer Motion
- ❌ NUNCA anime propriedades que causam reflow (width, height, top, left) — use `transform` e `opacity`
- ❌ NUNCA deixe loops de `requestAnimationFrame` sem cleanup — sempre cancele ao desmontar
- ❌ NUNCA aplique animações sem considerar mobile — teste comportamento em telas pequenas
- ❌ NUNCA exagere — se a animação chama mais atenção que o conteúdo, remova
