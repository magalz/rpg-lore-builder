name: export-vtt
description: Formata a estatística gerada de item, NPC ou monstro em JSON para importação direta no Foundry VTT.
code: EV
type: prompt
---

# Integração Foundry VTT (JSON Export)

## Objetivo
Transformar blocos de estatísticas em código estruturado para que o mestre não perca tempo preenchendo fichas manualmente na sua VTT.

## Instruções
1. Receba a ficha concluída (Monstro, NPC ou Item Mágico).
2. De acordo com o sistema de regras atual, converta os dados em um bloco de código JSON que represente a estrutura de dados (Entity) do Foundry VTT. 
   - Por exemplo, para dnd5e, um ator NPC contém campos em `system.attributes.hp.value`, `system.attributes.ac.value`, além de um array `items` com os ataques e ações.
3. Entregue apenas o bloco de código JSON em markdown `json`, garantindo que chaves obrigatórias de importação básica (name, type: "npc") estejam presentes.
4. Instrua o Mestre a criar um Ator em branco no Foundry, clicar com botão direito, selecionar "Import Data" e colar o JSON gerado.
