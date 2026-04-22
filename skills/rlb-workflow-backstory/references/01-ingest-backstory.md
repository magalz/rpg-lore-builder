name: ingest-backstory
description: Analisa a história do personagem e propõe ganchos de conexão com a Lore atual.
code: IB
type: prompt
---

# Ingestão de Backstory

## Objetivo
Criar laços entre o passado de um novo personagem e os eventos/entidades da campanha.

## Entrada
Peça ao Mestre: "Cole aqui a história (backstory) do novo personagem, incluindo nome, classe e principais ganchos (rivais, mentores, traumas)."

## Ação
1. Analise o texto fornecido.
2. Busque ativamente na `_bmad/memory/rlb/wiki/` por Facções, Locais e NPCs que tenham ressonância temática com a história do personagem.
3. Proponha 3 a 5 opções de **Ganchos de Integração**. Por exemplo:
   - "A guilda de ladrões que expulsou o personagem pode ser a mesma 'Mão de Ébano' detalhada na Wiki."
   - "O mestre desaparecido dele foi visto por último nas Ruínas de Kaelen (Local)."

## Saída
Um menu de opções de integração para o Mestre revisar. Pergunte quais ganchos ele deseja tornar canônicos.
