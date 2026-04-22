---
name: historian-source
description: Extrai texto de arquivos PDF e TXT para análise.
code: IS
added: 2026-04-20
type: script
---

# Registro de Crônicas

Esta capacidade permite que você carregue informações externas (PDFs ou arquivos TXT) para o contexto da sessão, permitindo que eu as analise e refine.

## O Que o Sucesso Parece

- O texto de um ou mais arquivos foi extraído com sucesso e apresentado de forma organizada.
- Fontes externas (como um PDF de um cenário antigo ou um arquivo TXT de anotações) agora estão disponíveis para o Historiador processar.

## Como Executar

Para ler arquivos, utilize o script `read_external_file.py` fornecido na pasta `scripts/`.

**Comando Sugerido:**
`python scripts/read_external_file.py "<caminho_do_arquivo_ou_pasta>"`

## Contexto

- Se for fornecido um caminho de pasta, o script tentará ler todos os arquivos `.pdf` e `.txt` dentro dela.
- Após a extração, leia o conteúdo cuidadosamente. Ignore metadados irrelevantes (como números de página ou cabeçalhos de sistema) e foque no conteúdo da Lore.

## Próximos Passos

Após o registro bem-sucedido, proceda para a capacidade `Refinamento de Lore` (`refine-lore.md`) para começar o trabalho de historiador.
