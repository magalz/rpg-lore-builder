name: validate-inquisitor
description: Chama o Inquisitor para validar as mudanças de downtime na Lore.
code: VI
type: prompt
---

# Validação do Inquisidor

## Objetivo
Assegurar que os eventos projetados durante o downtime não criam furos de roteiro ou contradizem o cânone da campanha.

## Instrução
Após o Mestre aprovar os eventos gerados na etapa anterior:
1. Reuna os eventos aprovados.
2. Invoque (ou simule, se tiver o prompt) o `rlb-agent-inquisitor` (`validate-entry`) para cruzar os novos eventos com a base de dados em `_bmad/memory/rlb/wiki/`.
3. Se houver conflitos, auxilie o Mestre na resolução (`resolve-conflict`).
4. Se estiver tudo aprovado, sugira as edições necessárias na Wiki para refletir o novo estado do mundo (ex: atualizar o status da facção na Wiki).
