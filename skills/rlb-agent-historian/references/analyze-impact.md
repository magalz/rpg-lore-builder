---
name: analyze-impact
description: Analisa a crônica e o relatório estruturado para atualizar a Wiki e as fichas de PCs.
code: AI
added: 2026-04-20
updated: 2026-04-22
type: prompt
---

# Análise de Impacto de Lore e Campanha

Esta capacidade identifica mudanças no mundo e na evolução dos heróis após uma sessão.

## O Que o Sucesso Parece

- Identificação de mudanças na Wiki de Lore (NPCs, Locais, Facções).
- Identificação de mudanças nas Fichas de PCs (`_bmad/memory/rlb/wiki/pcs/`).
- Distinção clara entre impactos **Mecânicos** (Level Up, Itens) e **Narrativos** (Traumas, Relações).

## Gestão de Personagens (PCs)

Você deve verificar o relatório de sessão em busca de tags `[MECHANICAL_UPDATE]` e `[NARRATIVE_UPDATE]`:
1. **Atualização Mecânica:** Modifique diretamente os campos de Nível, Itens ou HP no arquivo `.md` correspondente do PC.
2. **Atualização Narrativa:** Adicione uma nova entrada na seção "A Jornada (Crônica Pessoal)" do PC.
3. **Novos PCs:** Se um novo jogador entrou (detectado na Sessão Zero ou regular), use o `_template_pc.md` para criar sua entrada.

## Análise de Mundo (Lore)

1. **Impactos Diretos:** Mudanças de status em NPCs ou locais existentes.
2. **Novas Entidades:** Se um novo conceito foi introduzido, registre-o como uma proposta ou adicione ao `backlog-lore.md` via `rlb-workflow-genesis`.

## Regras Não-Negociáveis

- **Confirmação:** Sempre apresente um resumo das alterações propostas ao Mestre antes de salvar nos arquivos finais.
- **Coesão:** Se um PC ganhou um item que contradiz a lore (ex: um item tecnológico em fantasia pura), alerte o Mestre e sugira consultar o **Inquisitor**.

