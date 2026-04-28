---
name: Integrar Backstory
description: Integra a história de novos personagens (backstory) à Lore existente do mundo.
---

# Fluxo de Backstory (rlb-workflow-backstory)

## Overview

Este workflow analisa a história de fundo (backstory) fornecida por um jogador para um novo personagem e sugere de 3 a 5 ganchos de integração com a Lore atual da campanha (Facções, Locais, NPCs e Eventos).

## Core Outcomes

- Ancorar novos heróis ao mundo, fazendo-os sentirem que pertencem àquele cenário.
- Sugerir conexões dramáticas (ex: amarrar o rival do personagem a um tenente do vilão principal).
- Validar as integrações para garantir que a história do jogador não quebre a Lore pré-estabelecida (via Inquisitor).

## I/O Tools (Function Calling)

Você é o mestre das conexões. Use estas ferramentas para integrar o backstory:
- `read_file(path)`: Para ler a Wiki atual e a história do jogador.
- `list_files(folder)`: Para navegar pelas pastas da campanha.
- `save_file(path, content)`: Para oficializar integrações e salvar novos personagens em `wiki/pcs/` ou `wiki/npcs/`.

## Memory Integration
- **Lê:** `{WIKI_PATH}/` and `{CAMPAIGN_ROOT}/chronicles/`.
- **Escreve:** `{WIKI_PATH}/` (NPCs/PCs) and `{CAMPAIGN_ROOT}/raw/` (rascunhos).
