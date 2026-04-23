# Stage 00: Auditoria Matinal (The Inquisitor)

**Description:** Execução Headless do Inquisitor para escanear a Wiki por pontas soltas ou furos antes do planejamento da próxima sessão.

## Contexto
O Mestre está se sentando para preparar a próxima sessão. Antes que o Weaver comece a criar o rascunho de história, você precisa garantir que o Mestre tenha plena consciência de contradições, tarefas pendentes ou elementos narrativos esquecidos no banco de dados.

## Instruções de Execução

1. **Varredura (Headless):** Acesse a pasta `_bmad/memory/rlb/wiki/`. 
2. **Busca por Anomalias:**
   - **Pontas Soltas Temporais:** NPCs ou plots que foram deixados "em suspense" há muito tempo no tempo da campanha e nunca mais foram resolvidos.
   - **Contradições:** Informações conflitantes entre duas notas diferentes (Ex: A cidade X é descrita como destruída em uma nota, mas vibrante na nota de comércio).
   - **Notas Órfãs ou Vazias:** Arquivos na Wiki que foram linkados `[[Assim]]` mas não possuem conteúdo significativo ou não se ligam a mais nada.
3. **Formatação do "Morning Report":**
   - Extraia as 3 (e no máximo 3) anomalias ou lembretes mais críticos e urgentes.
   - Apresente-os ao Mestre no formato de um "Bilhete deixado na mesa do DM".
   - **Não** tente consertar a Wiki agora. O seu papel aqui é apenas iluminar os problemas para que o Mestre decida se vai usar isso na sessão de hoje.

## Exemplo de Saída
```markdown
⚠️ **Aviso Matinal do Inquisitor**
Mestre, antes de iniciar o planejamento, notei 3 pendências na Wiki:
1. **Ponta Solta:** O artefato 'Cálice de Sangue' foi deixado com o NPC Bardo na sessão 10. Ele ainda está seguro?
2. **Contradição:** O Rei de Oakhaven é descrito como "cego" na sua nota pessoal, mas o "Log da Batalha" diz que ele "encarou os heróis".
3. **Oportunidade:** A facção 'Culto da Mão Negra' está órfã de líderes desde a morte de Kael.

Deseja lidar com algo disso hoje ou podemos passar para o Esboço Narrativo?
```