# Relatório de Brainstorming: Projeto TRIA
*Ciência para reconstruir sua identidade*

**Data da Sessão:** 29 de Maio de 2026  
**Duração:** 30 minutos  
**Facilitador:** [Atlas (Analista / Decoder)](file:///c:/Users/Gustavo/Documents/TRIA/.antigravity/agents/analyst.md)  
**Metodologia:** Fluxo de Técnica Progressivo (Divergente → Convergente)  
**Local de Saída:** [docs/brainstorming-session-results.md](file:///c:/Users/Gustavo/Documents/TRIA/docs/brainstorming-session-results.md)

---

## 📋 Resumo Executivo

Este documento consolida os resultados da sessão de brainstorming do projeto **TRIA**, uma marca premium brasileira de cosméticos masculinos de alta performance focada em tratamentos capilares (pré/pós-operatório de implante capilar, calvície e manutenção de imagem). O objetivo principal desta sessão foi estruturar a visão de marca, o portfólio de produtos, a lógica dos **Protocolos** e a jornada de e-commerce, servindo de insumo direto para a elaboração do **PRD (Product Requirements Document)** e da **Arquitetura Técnica** do sistema.

### Temas Principais Identificados:
1. **Posicionamento Científico Genuíno (Autoridade):** A ciência como argumento ativo nas embalagens, nas fórmulas de linguagem INCI e no design do site (evitando jargões e clichês mercadológicos).
2. **Funil Baseado em Quiz (Diagnóstico Capilar):** O diagnóstico digital como coração da conversão de e-commerce, filtrando necessidades e mapeando-as de forma personalizada.
3. **Estados Emocionais Distintos:** Mapeamento de 3 perfis de clientes (Implante, Queda Ativa e Manutenção) e seu direcionamento para Protocolos específicos.
4. **Experiência Premium & Recorrência:** Unboxing de alto valor para ancoragem de marca (especialmente no *Protocolo Complete*) e modelo de reposição simplificado (Área Logada + Assinatura Mensal).

---

## 🛠️ Técnicas Utilizadas e Ideias Geradas

### 1. Primeiros Princípios (First Principles Thinking)
*Desmontando a marca e a experiência até as suas fundações físicas, biológicas e emocionais.*

* **Ideias do Usuário:**
  * **Ciência de Verdade:** Linguagem técnica com explicação dos ativos e seus propósitos claros (ex: *"Extrato de alecrim com ação vasodilatadora comprovada nos folículos"*). Embalagens limpas com tipografia técnica e nomenclatura INCI visível.
  * **Quiz como Roteador:** O quiz de diagnóstico direciona os 3 perfis de clientes aos Protocolos adequados de maneira fluida e invisível.
  * **Experiência de Uso dos Protocolos:** Cartela numerada dentro da caixa indicando o ritual passo a passo (01 Limpar → 02 Tratar → 03 Finalizar) com QR code para guia digital personalizado de acordo com o momento clínico.

### 2. Cenários "E Se..." (What If Scenarios)
*Provocações para desafiar o modelo de negócios e de conversão tradicional.*

* **Pergunta:** *"E se a primeira compra de um Protocolo exigisse obrigatoriamente a passagem pelo diagnóstico capilar?"*
* **Ideias & Soluções do Usuário:**
  * **Sem barreira forçada:** O Quiz deve ser o CTA primário e destacado ("Iniciar meu Protocolo"), mas com um fluxo secundário discreto para quem já sabe o que comprar, evitando abandono de carrinho.
  * **Perfil de Reposição (Liberdade Total do Cliente):** Área logada inteligente que armazena a recomendação, oferecendo três caminhos livres e sem fricção:
    1. **Repor protocolo anterior:** CTA direto na home da conta: *"Seu Protocolo: Reconstruct — Repor agora"*. Um clique.
    2. **Escolher outro protocolo:** Acesso direto à página de protocolos para trocar ou fazer upgrade sem precisar refazer o quiz.
    3. **Comprar produto individual:** Acesso livre ao catálogo completo para repor exatamente o que acabou (ex: comprar apenas o P2 se o tônico acabou antes do shampoo), sem precisar comprar o kit inteiro.
  * **Modelo de Assinatura:** Possibilidade de ativação de reposição recorrente mensal com descontos.

### 3. Análise Morfológica dos Protocolos (Morphological Analysis)
*Mapeamento estruturado das combinações de produtos, preços, narrativas e públicos.*

#### Matriz de Portfólio (Produtos Individuais)
* **P1: Shampoo Antiqueda** (Cabelo) — R$ 70,00
* **P2: Tônico Capilar** (Cabelo) — R$ 180,00
* **P3: Pomada Fix Carnaúba** (Styling) — R$ 90,00
* **P4: Balm para Barba** (Barba) — R$ 70,00
* **P5: Óleo para Barba** (Barba) — R$ 60,00

#### Matriz de Protocolos (Kits Estruturados)
1. **Protocolo I — Origin** (P1 + P2)
   * *Público:* Queda inicial, pré-implante ou pós-operatório > 3 meses (manutenção básica).
   * *Preço:* De R$ 250,00 por **R$ 219,00**
   * *Narrativa:* *"O primeiro passo é o mais importante"* (porta de entrada para a jornada de reconstrução).
2. **Protocolo II — Reconstrução** (P1 + P2 + P3)
   * *Público:* Pós-operatório recente (< 3 meses) ou queda ativa avançada.
   * *Preço:* De R$ 340,00 por **R$ 289,00** (15% de desconto)
   * *Narrativa:* *"Da raiz à presença"* (a pomada styling sela o tratamento mostrando o resultado da reconstrução).
3. **Protocolo III — Definição** (P4 + P5)
   * *Público:* Homens com foco em imagem e ritual de barba (manutenção de imagem).
   * *Preço:* De R$ 130,00 por **R$ 109,00**
   * *Narrativa:* *"A barba que define quem você é"* (vende o ritual de reconhecimento de imagem frente ao espelho).
4. **Protocolo Complete — TRIA Full** (P1 + P2 + P3 + P4 + P5)
   * *Público:* Preparação pré-implante completa, clientes fiéis ou presente premium.
   * *Preço:* De R$ 470,00 por **R$ 389,00**
   * *Narrativa:* *"A rotina completa, sem concessões"* (kit de alta ancoragem de valor, com unboxing de luxo em caixa rígida matte em relevo).

---

## 🏷️ Categorização de Ideias

### 🟢 Oportunidades Imediatas (Prontas para PRD)
* **Quiz de Diagnóstico Capilar:** Quiz de no máximo 5 perguntas cruzando *Momento do Cliente* e *Foco* para recomendação automática de Protocolo.
* **Área Logada de Autonomia Total:** Três caminhos livres na conta do cliente: repor o protocolo recomendado atual com 1 clique, escolher outro protocolo da vitrine direto para troca/upgrade (sem forçar quiz), ou navegar no catálogo para comprar produtos individuais avulsos (ex: repor só o tônico).
* **Lógica dos 4 Protocolos:** Lógica de kits e descontos indexados no banco de dados com preços promocionais.

### 🟡 Inovações Futuras (Fase 2 de Desenvolvimento)
* **Sistema de Assinatura Recorrente:** Integração com gateways de pagamento recorrente para envio mensal automatizado com frete facilitado.
* **QR Code Dinâmico na Caixa:** Acesso a guias de uso customizados que mudam conforme o estágio informado pelo cliente.

### 🔵 Moonshots (Visão de Longo Prazo)
* **Diário Capilar com Fotos (Acompanhamento):** Área logada que permite o envio de fotos a cada 30 dias para análise de evolução. Funciona como fidelização forte e geração de prova social controlada.

---

## 🎯 Planejamento de Ação (Próximos Passos)

1. **Elaboração do PRD (Morgan - @pm):** 
   * Traduzir as regras do Quiz de Diagnóstico, as regras de desconto dos Protocolos e a experiência da Área Logada em especificações técnicas.
2. **Definição da Arquitetura de Dados (Aria - @architect):**
   * Estruturar o banco de dados (tabelas de produtos, kits de protocolos, histórico de respostas de quiz do usuário e assinaturas).
3. **Estrutura de Unboxing & Logística:**
   * Alinhar fornecedores para a produção da caixa rígida premium do *Protocolo Complete* e da cartela física numerada de instrução de uso.

---

## ✍️ Reflexão do Processo

A sessão foi extremamente eficiente. Ao invés de criarmos uma loja genérica de cosméticos, conseguimos desenhar um modelo de e-commerce orientado a soluções clínicas e emocionais específicas para o homem que passa pelo implante capilar ou sofre com a calvície. O quiz como canalizador principal garante um tráfego qualificado e uma alta conversão downstream.

*Relatório de Brainstorming TRIA — Desenvolvido de acordo com as diretrizes do framework Synkra AIOX.*
