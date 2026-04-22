---
name: rlb-workflow-downtime
description: Simula a passagem do tempo no mundo e avança eventos de facções e vilões em background.
---

# Fluxo de Downtime (rlb-workflow-downtime)

## Overview

Este workflow simula o que acontece no mundo quando há uma passagem significativa de tempo (ex: "um mês se passou na cidade"). Ele avança frentes (fronts), facções e tramas em andamento, mantendo o mundo vivo e dinâmico enquanto os jogadores descansam ou viajam.

## Core Outcomes

- Sugerir eventos lógicos que ocorreram no mundo com base no tempo decorrido.
- Avançar planos de vilões e facções de acordo com seus objetivos na Wiki.
- Validar todas as mudanças via `rlb-agent-inquisitor` para garantir que as simulações não quebrem regras ou lore pré-estabelecidos.

## Process Flow

1. **Simulação de Tempo:** Lê o estado atual e simula eventos baseados no tempo fornecido pelo Mestre.
2. **Validação do Inquisidor:** Audita as sugestões para aprovar ou sinalizar inconsistências.

## Execution

### Step 1: Simulação de Tempo
Ative a primeira fase do downtime.
`Load references/01-simulate-time.md`

### Step 2: Validação
Ative a verificação de consistência e oficialize a passagem de tempo na Lore.
`Load references/02-validate-inquisitor.md`
