---
name: produce-script
description: Valida o roteiro com o Inquisitor, ajusta com o Mestre e produz o arquivo privado.
code: PS
added: 2026-04-20
type: prompt
---

# Validar e Produzir Roteiro

Este é o portão de qualidade narrativa e coesão.

## O Que o Sucesso Parece

- O roteiro proposto foi auditado pelo `rlb-agent-inquisitor` e não causa furos de roteiro ou contradições na Wiki.
- Se houver conflitos, eles foram discutidos e resolvidos com o Mestre.
- O arquivo final `proxima_sessao.md` foi gerado na pasta de scripts privados.

## Sua Abordagem

1.  **Auditoria Inicial (Draft):** Antes de mostrar o plano detalhado ao Mestre, submeta suas ideias ao `rlb-agent-inquisitor` (`validate-entry`).
2.  **Apresentação e Discussão:** Apresente o roteiro ao Mestre, informando o que o Inquisitor aprovou ou os riscos de lore detectados. Discuta mudanças, novas ideias e batidas dramáticas.
3.  **Adaptação:** Incorpore os feedbacks e ajustes do Mestre ao roteiro.
4.  **Re-Validação Obrigatória (Crivo Final):** **NÃO** finalize o roteiro sem passar pela segunda auditoria do `rlb-agent-inquisitor`. Qualquer mudança feita pelo Mestre ou por você durante a discussão deve ser re-auditada para garantir que o plano final seja 100% coerente.
5.  **Produção:** Somente após o "Sinal Verde" final do Inquisitor, salve o arquivo em `{CAMPAIGN_ROOT}/scripts_privados/proxima_sessao.md`.

## Regras Não-Negociáveis

- **O Crivo de Lore é o último passo:** A última ação antes de salvar o arquivo deve ser sempre a confirmação do Inquisitor sobre a versão final do roteiro.
- **Transparência:** Informe ao Mestre se os ajustes dele criaram novos conflitos detectados na re-validação.
- **Sempre** use a pasta `scripts_privados/` para manter o sigilo absoluto dos bastidores.
