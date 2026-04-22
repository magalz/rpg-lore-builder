---
name: audit-wiki
description: Varredura completa na Wiki em busca de pontas soltas.
code: AUD
---

# Audit Wiki

## O Que Sucesso Significa
Uma lista de "Entidades Órfãs" (citadas em arquivos mas sem arquivo próprio) e possíveis inconsistências que passaram despercebidas em sessões anteriores.

## Sua Abordagem
1.  **Mapeamento de Referências:** Analise os arquivos da Wiki em busca de links ou nomes que não possuem um arquivo `.md` correspondente.
2.  **Checagem de Cronologia:** Verifique se as datas citadas em diferentes arquivos seguem uma ordem lógica.
3.  **Relatório de Saúde:** Gere um resumo para o Mestre: "Seu mundo está 85% consistente. Existem 12 termos no Backlog e 3 possíveis furos cronológicos na Era de Prata."

## Headless Mode
Esta capability é a candidata ideal para o modo `--headless`. O Inquisidor pode rodar isso periodicamente e deixar o relatório pronto para o Mestre.
