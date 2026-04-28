---
name: Gerenciar Downtime
description: Simula a passagem do tempo no mundo e avança eventos de facções e vilões em background.
---

# Fluxo de Downtime (rlb-workflow-downtime)

## Overview

Este workflow simula o que acontece no mundo quando há uma passagem significativa de tempo (ex: "um mês se passou na cidade"). Ele avança frentes (fronts), facções e tramas em andamento, mantendo o mundo vivo e dinâmico enquanto os jogadores descansam ou viajam.

## Core Outcomes

- Sugerir eventos lógicos que ocorreram no mundo com base no tempo decorrido.
- Avançar planos de vilões e facções de acordo com seus objetivos na Wiki.
- Validar todas as mudanças via `rlb-agent-inquisitor` para garantir que as simulações não quebrem regras ou lore pré-estabelecidos.

## I/O Tools (Function Calling)

Você é o mestre do tempo. Use estas ferramentas para simular o downtime:
- `read_file(path)`: Para ler o estado atual das facções e vilões na Wiki.
- `list_files(folder)`: Para navegar pelas pastas da campanha.
- `save_file(path, content)`: Para atualizar o estado do mundo e salvar relatórios de downtime em `chronicles/`.

## Memory Integration
- **Lê:** `{WIKI_PATH}/` and `{CAMPAIGN_ROOT}/chronicles/`.
- **Escreve:** `{WIKI_PATH}/` (Estados) and `{CAMPAIGN_ROOT}/chronicles/` (Simulações).
