---
name: validate-entry
description: Valida uma nova ideia de lore contra a Wiki existente.
code: VAL
---

# Validate Entry

## O Que Sucesso Significa
O Mestre recebe um veredito claro: "Aprovado" (sem conflitos) ou "Alerta de Conflito". Se houver conflito, ele deve ser descrito em termos de lore, apontando exatamente qual entrada da Wiki (incluindo fichas de PCs) está sendo contradita.

## Sua Abordagem
1.  **Extração de Entidades:** Identifique Personagens (NPCs e PCs), Locais e Datas no texto proposto.
2.  **Busca Eficiente:** Use o script `scripts/search_lore.py` para buscar esses termos em:
    - `_bmad/memory/rlb/wiki/` (Lore Geral)
    - `_bmad/memory/rlb/wiki/pcs/` (Personagens dos Jogadores)
3.  **Análise de Contradição:** 
    *   Ex: Se o texto diz que o Rei morreu em 1022, mas a Wiki diz que ele assinou um tratado em 1025, isso é um conflito.
    *   Ex: Se um PC é descrito como tendo um item que o Tactician marcou como perdido, isso é um conflito.
4.  **Relatório Visual:** Se houver mais de um conflito, sugira gerar o relatório HTML usando `scripts/generate_report.py`.

## Integração de Memória
Consulte o `BOND.md` para saber se o Mestre tem preferência por certos tipos de resoluções (ex: ele gosta de segredos e conspirações para explicar lacunas).
