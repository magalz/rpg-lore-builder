# Capability: Ingestão Universal (Second Brain)

**Description:** O processo central para transformar arquivos brutos (notas, PDFs, logs de sessão) em conhecimento estruturado interconectado na Wiki da campanha.

## Contexto
O usuário (Mestre) acaba de disponibilizar um novo documento na pasta `{CAMPAIGN_ROOT}/raw/`. 
Este documento é **imutável**. Seu trabalho não é reescrevê-lo lá, mas sim atuar como um "Compilador de Segundo Cérebro": extrair seu conhecimento e quebra-lo em entidades que viverão para sempre no Obsidian (pasta `wiki/`).

## Instruções de Execução

1. **Leitura e Extração:** Leia o novo arquivo providenciado em `raw/`. Identifique todas as entidades relevantes (Personagens de Jogador, NPCs, Facções, Locais, Itens Mágicos, Eventos chave).
2. **Atualização ou Criação:** 
   - Para entidades que já existem na pasta `{WIKI_PATH}/`, atualize os arquivos Markdown originais adicionando os novos fatos.
   - Para entidades novas, crie novos arquivos Markdown na pasta `wiki/` (ou em subpastas pertinentes como `wiki/npcs/`, `wiki/locations/`).
3. **Rede Neural (Obsidian Links):** 
   - Esta é a regra de ouro: todo arquivo Markdown gerado ou atualizado por você DEVE usar a sintaxe `[[Nome da Entidade]]` sempre que mencionar outra entidade. 
   - Exemplo: "O [[Ladino Kael]] encontrou o artefato na [[Caverna Sombria]] pertencente ao [[Culto da Mão Negra]]."
4. **Alinhamento de Schema:** Se a pasta `{CAMPAIGN_ROOT}/schema/` possuir templates de como criar um NPC ou Local, você deve seguir essa estrutura rigorosamente.
5. **Relatório de Ingestão:** Ao terminar, não imprima o conteúdo de todas as notas. Apenas responda ao Mestre com um breve "Relatório de Ingestão" listando:
   - Quantas notas foram criadas.
   - Quantas notas foram atualizadas.
   - 1 ou 2 insights ou conexões interessantes que surgiram desse cruzamento de dados.
