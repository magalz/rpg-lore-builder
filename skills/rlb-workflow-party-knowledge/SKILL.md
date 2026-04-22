---
name: rlb-workflow-party-knowledge
description: Compila o conhecimento atual dos personagens ("O que vocês sabem sobre o mundo").
---

# Fluxo de Conhecimento da Party (rlb-workflow-party-knowledge)

## Overview

Este workflow analisa a memória central do módulo (Crônicas e partes públicas da Wiki) para gerar um documento limpo e formatado contendo "O que vocês sabem sobre o mundo". É perfeito para entregar aos jogadores como um guia de recapitulação antes de uma sessão ou arco de campanha.

## Core Outcomes

- Extrair informações da Wiki filtrando segredos de Mestre (Meta-Game).
- Consolidar aprendizados das Crônicas passadas em um formato de fácil leitura.
- Gerar um documento de entrega (handout) estruturado por Locais, NPCs e Rumores conhecidos.

## Process Flow

1. **Compilação de Conhecimento:** Vasculhar a Wiki e as Crônicas, filtrando informações marcadas como segredo.
2. **Formatação e Exportação:** Estruturar a informação compilada em um documento amigável para os jogadores.

## Execution

### Step 1: Compilação de Conhecimento
Inicie a varredura da base de dados sob a perspectiva dos personagens.
`Load references/01-compile-knowledge.md`

### Step 2: Formatação de Relatório
Gere o documento final para distribuição aos jogadores.
`Load references/02-format-report.md`
