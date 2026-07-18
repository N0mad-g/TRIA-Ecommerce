# Itens obrigatórios antes do primeiro cliente real

> Consolida decisões marcadas como "não bloqueia trabalho atual, mas obrigatório antes do go-live" espalhadas pelos documentos de PRD/Architecture/Schema. Qualquer novo item desse tipo entra aqui — não fica solto no corpo de um documento longo.

| Item | Dono | Status | Onde está documentado |
|---|---|---|---|
| Preview/Production isolation | @architect (Aria) | ✅ Resolvido — segundo projeto Supabase gratuito dedicado (não Preview Branches nativos, por decisão de custo do fundador) | `schema-design.md` Seção 8 + `architecture.md` 12.3/12.4 |
| Desativar Vercel Deployment Protection (SSO) | @dev / fundador | 🔲 Pendente — mantido protegido de propósito na fase pré-lançamento (Story 1.1). Desativar em Vercel → Project Settings → Deployment Protection antes de qualquer tráfego real (orgânico, Goal 1 do PRD) | `docs/stories/1.1.story.md` |

## Roadmap (não-bloqueante, não é item de go-live)

| Item | Gatilho | Onde está documentado |
|---|---|---|
| Upgrade pra Supabase Preview Branches (Pro+) | Receita recorrente estável pós-validação de demanda | `architecture.md` 12.4 |
