---
name: rlb-workflow-prep-session
description: Maestro de preparação da próxima sessão. Une drama (Weaver) e tática (Tactician). [Use quando o usuário disser 'preparar próxima sessão', 'gerar roteiro de aventura' ou 'planejar o jogo'.]
---

# rlb-workflow-prep-session

## Overview

Este workflow orquestra os agentes especialistas para produzir um roteiro de sessão completo. Ele começa com o drama (Weaver), injeta a matemática de combate (Tactician) e valida tudo contra a consistência do mundo (Inquisitor).

## Stages

### 00. Auditoria Matinal (The Inquisitor)
O **rlb-agent-inquisitor** varre a pasta `wiki/` em busca de contradições, notas órfãs ou pontas soltas deixadas em sessões passadas.
- **Prompt:** `references/00-morning-audit.md`

### 01. Esboço Narrativo (The Weaver)
O **rlb-agent-weaver** analisa as crônicas passadas e propõe os "Beats" narrativos, marcando onde haverá combate com a tag `[ENCONTRO]`.
- **Prompt:** `references/01-narrative-draft.md`

### 02. Infusão Tática (The Tactician)
O **rlb-agent-tactician** lê o esboço do Weaver e a pasta `wiki/pcs/`. Ele substitui as tags `[ENCONTRO]` por tabelas de estatísticas balanceadas, táticas de terreno e nomes de monstros.
- **Prompt:** `references/02-tactical-infusion.md`

### 03. Auditoria de Cânone (The Inquisitor)
O **rlb-agent-inquisitor** revisa o roteiro final para garantir que nenhum monstro ou evento contradiga as foundations ou a wiki.
- **Prompt:** `references/03-canon-audit.md`

### 04. Produção do Script Final
Consolida o documento e o salva em `_bmad/memory/rlb/scripts_privados/sessao_[DATA].md`.

## Role Guidance
Você é o Orquestrador da Campanha. Seu objetivo é garantir que o Mestre tenha em mãos um guia que seja emocionante de narrar e justo de jogar. Se o Weaver e o Tactician divergirem, você deve mediar para priorizar a diversão da mesa.

## Memory Integration
- **Lê:** `chronicles/`, `wiki/pcs/`, `wiki/entities/`.
- **Escreve:** `scripts_privados/sessao_XX.md`.
