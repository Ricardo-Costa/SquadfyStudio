# Quickstart & Manual Validation: Squad Builder

**Feature**: 003-squad-builder
**Date**: 2026-06-30

---

## Setup

```bash
# Terminal 1
npm run mock

# Terminal 2
npm run dev
```

Log in at `http://localhost:3000/login` → redirected to `/dashboard`.

---

## US1 Checklist — Add Developer to Squad (P1)

**Goal**: Click "Adicionar" on a catalogue card → developer aparece no squad panel.

- [ ] Catalogue visible com 22 developer cards
- [ ] Clicar "Adicionar" em qualquer card → developer aparece no squad panel imediatamente
- [ ] Card do developer adicionado mostra badge "No Squad" (sem botão de adicionar)
- [ ] Badge "No Squad" persiste se o developer aparecer em resultados filtrados
- [ ] Squad panel mostra o developer com nome, avatar, seniority, e cost

---

## US2 Checklist — View Squad Panel (P2)

**Goal**: Squad panel exibe membros com detalhes completos e indicador de capacidade.

- [ ] Com squad vazio: panel exibe mensagem de estado vazio ("Nenhum membro selecionado" ou similar)
- [ ] Adicionar 1 developer: panel mostra nome, avatar, seniority, e cost (ex: "$95/hr")
- [ ] Adicionar 3 developers: indicador mostra "3/5 membros" (ou equivalente)
- [ ] Cada entrada no panel tem botão de remover visível
- [ ] Layout desktop: squad panel aparece como sidebar à direita (~30% da largura)
- [ ] Layout mobile (< 1024px): squad panel empilha abaixo do catálogo

---

## US3 Checklist — Remove Developer from Squad (P3)

**Goal**: Remover pelo squad panel → developer some do panel e card volta ao estado adicionável.

- [ ] Clicar remover no squad panel → developer some do panel imediatamente
- [ ] Card do developer removido volta a mostrar botão "Adicionar"
- [ ] Remover todos os membros → panel exibe estado vazio
- [ ] Indicador de capacidade atualiza corretamente após cada remoção

---

## US4 Checklist — Enforce Squad Capacity Limit (P4)

**Goal**: Squad limitado a 5 membros; adição bloqueada quando cheio; remoção reabilita.

- [ ] Adicionar 5 developers → indicador mostra "5/5 membros" (ou "Squad completo")
- [ ] Com squad cheio: todos os cards restantes mostram botão "Adicionar" desabilitado
- [ ] Com squad cheio: tentar clicar o botão desabilitado → nenhuma ação ocorre, squad permanece com 5
- [ ] Remover 1 membro do squad cheio → botão "Adicionar" reabilitado nos cards restantes
- [ ] Remover 1 membro → indicador mostra "4/5 membros"

---

## Visual Quality Checks

- [ ] Badge "No Squad" tem visual distinto e consistente com o design system (cor, forma)
- [ ] Botão "Adicionar" desabilitado tem visual claramente diferenciado do botão ativo (opacidade, cursor)
- [ ] Squad panel tem visual polido: cards de membro com avatar, nome, seniority, cost
- [ ] Botão de remover tem ícone ou label claro (ex: ícone ×)
- [ ] Indicador de capacidade é visualmente proeminente no squad panel
- [ ] Transições add/remove são instantâneas sem flicker ou layout shift

---

## State Consistency Checks

- [ ] Adicionar developer → card mostra badge + aparece no panel (ambos sincronizados)
- [ ] Remover developer → badge some do card + some do panel (ambos sincronizados)
- [ ] Filtrar catálogo por nome enquanto há membros no squad → badges "No Squad" permanecem nos cards corretos
- [ ] Filtrar por seniority + squad ativo → estado do squad mantido corretamente
- [ ] Navegar para outra página e voltar → squad state resetado (in-memory, sem persistência)
