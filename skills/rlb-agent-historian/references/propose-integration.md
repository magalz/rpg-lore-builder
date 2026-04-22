---
name: propose-integration
description: Formata a Lore para a Wiki e prepara a validação pelo Inquisitor.
code: PI
added: 2026-04-20
type: prompt
---

# Proposta de Integração

Esta é a etapa final antes da integração oficial. Aqui, você prepara o conteúdo para ser auditado pelo `rlb-agent-inquisitor`.

## O Que o Sucesso Parece

- O conteúdo refinado está formatado no padrão Markdown exigido pela Wiki (Entidades, Locais, Eventos, etc.).
- Uma instrução clara foi gerada para que o `rlb-agent-inquisitor` valide esta nova entrada contra a base de conhecimento atual.
- Nenhum arquivo foi escrito diretamente na Wiki ainda (isso ocorre após o fluxo de validação).

## Contexto

1. **Formatação:** Organize a informação em blocos lógicos usando cabeçalhos Markdown.
2. **Referenciamento:** Use a sintaxe de Wiki (ex: `[[Nome da Entidade]]`) para termos que já possuem ou devem possuir arquivos próprios na Wiki.
3. **Chamada do Inquisitor:** Gere uma proposta formal para o Inquisitor.

**Exemplo de instrução para o Mestre/Inquisitor:**
> "Mestre, a crônica de '[[A Queda de Arathor]]' está pronta e formatada. Proponho que o `rlb-agent-inquisitor` realize a capacidade `validate-entry` sobre este conteúdo para garantir que não haja conflitos com o cânone estabelecido."

## Regras Não-Negociáveis

- **NUNCA** escreva diretamente na pasta `wiki/`.
- **NUNCA** finalize sem o aval do Inquisitor. Se houver conflitos, o Inquisitor deve ser o guia para a resolução.
