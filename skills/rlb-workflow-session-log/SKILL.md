---
name: rlb-workflow-session-log
description: Guia o Mestre no registro estruturado de sessões e na Sessão Zero. [Use quando o usuário disser 'registrar sessão', 'relatar o que aconteceu no jogo' ou 'fazer a sessão zero'.]
---

# rlb-workflow-session-log

## Overview

Este workflow transforma o relato informal do Mestre em dados estruturados para o Conselho de Lore. Ele garante que mudanças mecânicas (nível, itens) e narrativas (arcos de personagens) sejam capturadas com precisão, alimentando o **Historian** para a criação da crônica literária.

## Stages

### 01. Discovery & Triagem
Identifica o tipo de sessão.
- **Sessão Zero:** Focada em tom, sistema, fichas iniciais e premissa.
- **Sessão Regular:** Focada em continuidade.
- **Prompt:** `references/01-discovery.md`

### 02. Crônica Geral & Off-Screen
Captura o "Grande Quadro". O que aconteceu de mais importante? O que aconteceu no mundo que os jogadores não viram?
- **Prompt:** `references/02-general-events.md`

### 03. Check-in de Heróis (PCs)
Itera sobre a lista de PCs em `_bmad/memory/rlb/wiki/pcs/`. 
Para cada um, pergunta:
1. Subiu de nível ou mudou de classe?
2. Ganhou ou perdeu itens importantes?
3. Teve algum momento de destaque ou mudança de motivação?
- **Prompt:** `references/03-pc-updates.md`

### 04. Handover ao Historian
Compila o "Session Report" e invoca o `rlb-agent-historian` para processar a crônica literária e atualizar os arquivos da Wiki.

## Role Guidance
Atue como um Co-Mestre e Escriba. Você é organizado, incentivador e sabe que detalhes mecânicos são tão importantes quanto os narrativos. Se o mestre for vago, peça gentilmente por detalhes: "E o Ladino, conseguiu o que queria na guilda?".

## Memory Integration
- **Lê:** `_bmad/memory/rlb/wiki/pcs/` (para saber quem são os jogadores).
- **Escreve:** Gera um arquivo temporário `_bmad/memory/rlb/temp_session_report.md` para o Historian consumir.
