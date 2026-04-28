# Capability: Buscar Estatísticas (Fetch Stats)

## Objetivo
Obter blocos de estatísticas precisos de fontes externas (como 5e.tools) para monstros e itens.

## Instruções
1. **Busca Ativa:** Utilize a ferramenta `google_web_search` para encontrar o link direto da criatura ou item (ex: `site:5e.tools aboleth`).
2. **Extração:** Utilize `web_fetch` para ler o conteúdo da página.
3. **Conversão de Dados:**
   - Extraia AC, HP, Atributos, Habilidades e Ações.
   - Formate o resultado no padrão Markdown da `wiki/entities/` do módulo RLB.
4. **Armazenamento:** Salve o arquivo em `{WIKI_PATH}/entities/[nome_da_entidade].md`.

## O Que o Sucesso Parece
Uma nova entrada na Wiki com dados oficiais e precisos, economizando o tempo de digitação do Mestre.
