# SKILL: Copywriting — TRIA E-commerce Masculino

Este arquivo define as regras de escrita e tom de voz que o Claude deve seguir ao criar, revisar ou alterar qualquer texto do site da TRIA. Leia e siga tudo antes de escrever qualquer palavra.

Esta skill **não define layout, estrutura de página ou ordem de seções.** Essas decisões são tomadas diretamente com o usuário durante o desenvolvimento.

---

## Leitura obrigatória de outras skills

As skills trabalham em conjunto como um time. Nunca execute tarefas de copy de forma isolada.

- Se a tarefa envolver **animações em texto** (text reveals, stagger, transições) → leia `SKILL-animations.md` antes de definir qualquer copy. O ritmo e tamanho do texto impactam diretamente o tipo de animação adequada.
- Se a tarefa envolver **implementação técnica** (componentes, estrutura, banco de dados) → leia `CLAUDE.md` para garantir que a copy respeita os padrões do projeto.
- Se houver **conflito entre esta skill e outra**, sinalize imediatamente e aguarde instrução antes de agir.

**Como encontrar outras skills:** procure arquivos `SKILL-*.md` na raiz do projeto.

---

## Seção 0 — Contexto da marca

**TRIA não é uma loja de cosméticos.**

TRIA é uma marca que reconstrói a identidade do homem através da ciência.

O significado da marca:
- **Tricologia** — ciência
- **Reconstrução** — processo
- **Identidade** — território emocional
- **Autoestima** — resultado final

### Premissa central

O cliente não está apenas perdendo cabelo. Ele está perdendo controle da própria imagem.

**A TRIA devolve esse controle através de protocolos baseados em ciência.**

Esta premissa é a base de toda copy do site. Toda frase deve, direta ou indiretamente, reforçar essa ideia.

---

## Seção 1 — Posicionamento

- ❌ Não vender beleza
- ❌ Não vender vaidade
- ❌ Não usar linguagem feminina adaptada

A comunicação deve ser:
- **Direta**
- **Masculina** (sem estereótipo)
- **Funcional**
- **Baseada em resultado e controle**

---

## Seção 2 — Regra mais importante

**NUNCA vender produto isolado como protagonista.**

**SEMPRE vender:**
- Protocolo
- Sistema
- Método

Produtos isolados são suporte — reposição ou complemento. Nunca protagonistas.

---

## Seção 3 — Tom de voz

- Masculino
- Direto
- Seguro
- Sem exagero emocional
- Sem gírias
- Sem soar como vendedor agressivo

**Palavras que devem aparecer com frequência:**
- controle
- método
- processo
- consistência
- resultado

**Palavras e expressões proibidas:**
- "qualidade premium"
- "produto inovador"
- "melhor do mercado"
- "crescimento garantido"
- "resultado imediato"
- "milagre"
- "autocuidado delicado"
- "rotina de beleza"

**Objetivo emocional de cada texto:**
> "Isso aqui não é só produto. É um jeito de resolver o problema certo."

---

## Seção 4 — Regras de escrita

### Clareza acima de criatividade
Se não ficou claro em 3 segundos, reescreva. Textos confusos ou abstratos estão proibidos.

### Sem promessas irreais
Nunca prometer resultado garantido, imediato ou milagroso.

### Sem termos genéricos
Evite frases que qualquer marca poderia usar. Cada frase deve ser específica da TRIA.

### Sem hype emocional exagerado
Homem não compra emoção exagerada. Copy segura e funcional converte mais.

### Foco em decisão
Toda copy deve levar o usuário a:
1. Entender rapidamente
2. Escolher com segurança
3. Agir

### Hierarquia de informação
Organize sempre do mais importante ao menos importante. O usuário deve entender a essência em uma leitura rápida.

---

## Seção 5 — Regras de tamanho de texto por elemento

Estas regras garantem que copy e animações funcionem juntas sem conflito.

| Elemento | Tamanho máximo |
|----------|---------------|
| Headline principal | ~6 palavras / 2 linhas |
| Subheadline | ~12 palavras / 1 linha |
| Botão CTA | 4 palavras |
| Título de protocolo/kit | 3 palavras |
| Descrição de protocolo/kit | ~20 palavras / 2 linhas |
| Tópicos curtos (listas) | 1 linha cada |
| Parágrafos de autoridade | Máximo 3 parágrafos curtos |

---

## Seção 6 — Regras para protocolos

Cada protocolo deve ter:
1. Uma fase clara da jornada do cliente (público/`audience`)
2. Uma promessa funcional objetiva (`description`)
3. Uma emoção implícita (sem exagero)
4. Copy que o torne mais desejável que produtos isolados
5. O contraste claro entre preço de assinatura (`price`) e soma avulsa (`fullPrice`), reforçando a economia (`discount`) sem soar como cupom de desconto genérico

Os protocolos existentes são:
- **Cuidados Diários** → manutenção simples e eficiente, entrada na marca
- **Ritual de Autoridade** → protocolo principal, mais popular — presença e autoridade nos negócios
- **Implante & Alopecia** → protocolo científico, pré/pós-implante capilar ou alopecia/calvície

Não usar mais os nomes ORIGIN/RECONSTRUCT/DEFINE/TRIA COMPLETE — foram substituídos pelos três protocolos acima.

---

## Seção 7 — Regras para produtos isolados

- Não devem aparecer como destaque
- Servem como complemento ou reposição
- Podem ser usados como upsell
- A copy deles deve reforçar que o protocolo é a escolha principal

---

## Seção 8 — Comportamento ao gerar copy

Sempre que gerar ou alterar qualquer texto:

1. Verificar se há outras skills relevantes a ler
2. Priorizar protocolos sobre produtos isolados
3. Respeitar os limites de tamanho da Seção 5
4. Manter tom direto, masculino e funcional
5. Eliminar qualquer frase genérica ou promessa exagerada
6. Considerar o impacto visual e técnico do texto alterado

---

## Seção 9 — O que nunca fazer

- ❌ NUNCA criar copy genérica de e-commerce
- ❌ NUNCA usar linguagem feminina
- ❌ NUNCA priorizar produto isolado como destaque
- ❌ NUNCA exagerar promessas
- ❌ NUNCA escrever textos longos sem função clara
- ❌ NUNCA ignorar o impacto visual e técnico de um texto alterado
- ❌ NUNCA agir sem antes verificar outras skills relevantes

---

## Seção 10 — Escopo desta skill

Esta skill cobre **apenas copy e escrita**. Ela não define:
- Layout ou estrutura de páginas (→ definido diretamente com o usuário)
- Como implementar componentes (→ ver `CLAUDE.md`)
- Como animar textos (→ ver `SKILL-animations.md`)
- Paleta de cores ou tipografia (→ skill de Design Visual, quando criada)

Qualquer decisão fora do escopo de copy deve ser delegada ao responsável correto.
