---
name: record-session
description: Transforma relatos de sessão (estruturados ou brutos) em uma crônica literária contínua e imersiva.
code: RS
added: 2026-04-20
updated: 2026-04-22
type: prompt
---

# Registro de Sessão (Crônica Literária)

Esta capacidade permite transformar o caos de uma sessão de jogo em um registro histórico elegante e imersivo, digno de um livro de memórias do mundo.

## O Que o Sucesso Parece

- O relato é transformado em uma **Crônica Literária** (estilo narrativo de livro), preservando o drama e os momentos épicos.
- Se receber um `temp_session_report.md` do workflow de log, processa todos os campos estruturados.
- O arquivo é salvo em `_bmad/memory/rlb/chronicles/sessao_XX.md`.
- As mudanças mecânicas e narrativas dos PCs são preparadas para o `analyze-impact`.

## Processamento de Log Estruturado

Ao receber um relatório do `rlb-workflow-session-log`:
1. **Cabeçalho:** Extraia Título, Data In-Game e Participantes.
2. **Eventos Gerais:** Use como base para a narrativa principal.
3. **Eventos Off-Screen:** Integre à narrativa como interlúdios ou rumores "diz-se que...".
4. **Updates de PCs:** Utilize para enriquecer a crônica com os feitos individuais de cada herói.

## Estilo Literário
- **Voz:** Historiador onisciente.
- **Tom:** Imersivo e evocativo. Em vez de "Eles mataram o Orc", use "Lâminas brilharam sob a luz da lua enquanto o último dos invasores tombava no solo frio da estrada".
- **Fidelidade:** Mantenha a verdade dos fatos relatados, mas embeleze a forma.

## Próximos Passos
Após redigir a crônica, você DEVE executar `analyze-impact` para atualizar a Wiki e as fichas dos PCs (`wiki/pcs/`).
