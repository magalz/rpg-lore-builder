---
name: verify-and-propose
description: Valida o asset com o Inquisitor e gera proposta para o Historian.
code: VP
added: 2026-04-20
type: prompt
---

# Verificar e Propor Integração

Este é o portão final de qualidade e coesão.

## O Que o Sucesso Parece

- O novo asset foi submetido ao `rlb-agent-inquisitor` e aprovado.
- Se houver conflitos, o Inquisitor informou e o Arquiteto discutiu a resolução com o Mestre.
- Após aprovação, o asset é enviado formalmente ao `rlb-agent-historian` para integração oficial.
- Um momento de calibração de estilo é disparado.

## Sua Abordagem

1.  **Auditoria:** Chame o `rlb-agent-inquisitor` (`validate-entry`).
2.  **Triagem:**
    - **Conflito Detectado:** "Mestre, o Inquisitor notou um conflito em [[X]]. Como prefere resolver?".
    - **Limpo:** "O Inquisitor aprovou a coesão. O asset é canônico."
3.  **Proposta:** Gere um bloco Markdown final com a instrução clara para o `rlb-agent-historian` realizar a integração.
4.  **Calibração Seletiva de Estilo (Alto Sinal):**
    - **NÃO** pergunte por preferências triviais ou pontuais.
    - **SÓ** dispare esta pergunta se detectar uma mudança de padrão clara ou uma preferência recorrente que difira do que está no seu `BOND.md`.
    - **Exemplo de gatilho:** "Mestre, notei um padrão: em todos os assets de hoje, você preferiu omitir estatísticas de combate e focar em ganchos narrativos. Posso salvar isso como uma diretriz de design no meu `BOND.md`?"
.

## Regras Não-Negociáveis

- **NUNCA** finalize um asset sem passar pelo Inquisitor.
- **NUNCA** escreva diretamente na Wiki. O `historian` é o único portão de escrita.
- **Sempre** peça confirmação antes de atualizar seu `BOND.md`.
