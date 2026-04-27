---
name: Criar Gênese
description: Cria bases de mundo consistentes e estruturadas. [Use quando o usuário pedir para 'criar um mundo do zero', 'gerar worldbuilding' ou 'iniciar uma campanha'.]
---

# rlb-workflow-genesis

## Overview

Este workflow guia a criação de uma base de mundo (Wiki) consistente para RPG, adaptando-se ao estilo criativo do Mestre. Ele suporta dois caminhos principais: **Top-Down (Estrutural)**, focado em regras e geografia, e **Bottom-Up (Narrativo)**, onde a IA deduz regras a partir de histórias contadas. 

O diferencial deste workflow é o **Backlog de Lore**: qualquer termo ou conceito mencionado mas não definido é automaticamente registrado com seu contexto original para resolução futura, garantindo que o mundo cresça sem pontas soltas.

## On Activation

Load available config from `{project-root}/_bmad/config.yaml` and `{project-root}/_bmad/config.user.yaml` (root level and `rlb` section). If config is missing, let the user know `rlb-setup` can configure the module at any time. Use sensible defaults for anything not configured.

## Stages

O workflow progride através de estágios claros, mantendo o estado no arquivo de plano do módulo se disponível.

### 01. Foundations (Obrigatório)
Define o Setting (Fantasia, Sci-Fi, etc), o Tom da campanha e o Path de criação preferido.
- **Prompt:** `references/01-foundations.md`
- **Progression:** O usuário define o Core e escolhe o Path.

### 02. Creation Path (Escolha um)
- **Path Structural (Top-Down):** Guia lógico por camadas (Cosmologia -> Geografia -> Política).
  - **Prompt:** `references/02-path-structural.md`
- **Path Narrative (Bottom-Up):** O usuário narra eventos e a IA estrutura o mundo a partir deles.
  - **Prompt:** `references/03-path-narrative.md`

### 03. Validation & Sync
Após cada iteração criativa, o workflow sincroniza o Backlog e valida conflitos.
- **Backlog:** Execute `python3 scripts/manage_backlog.py --add "Termo" --context "Arquivo/Citação"`
- **Validation:** Invoca `rlb-agent-inquisitor` (se disponível) para checagem de furos de roteiro.

## Backlog de Lore

Sempre que um novo conceito for introduzido:
1. Identifique se ele já existe na Wiki (`_bmad/memory/rlb/wiki/`).
2. Se não existir, use o script `scripts/manage_backlog.py` para registrá-lo no `_bmad/memory/rlb/backlog-lore.md`.
3. Informe ao usuário o que foi adicionado ao backlog.

## Role Guidance
Atue como um Consultor Editorial de Worldbuilding. Sua voz é a de um Mestre experiente conversando com outro: técnica, clara e focada em utilidade criativa. Evite floreios narrativos desnecessários; seu objetivo é estruturar a visão do usuário.
