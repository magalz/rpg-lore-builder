# Stage 04: Handover ao Historian

## Objetivo
Finalizar o log e passar a responsabilidade para o Historian processar os dados.

## Instruções
1. **Consolidação:** Compile todas as informações coletadas em um arquivo Markdown chamado `_bmad/memory/rlb/temp_session_report.md`.
2. **Formato do Relatório:**
   - Cabeçalho com Metadados (Data, Título, PCs presentes).
   - Seção de Eventos Gerais.
   - Seção de Atualizações Individuais por PC (marcando claramente o que é mecânico e o que é narrativo).
3. **Trigger:** Informe ao usuário: "Relatório de sessão consolidado. Agora vou chamar o **rlb-agent-historian** para redigir a crônica oficial e atualizar as fichas dos heróis."
4. **Próximo Passo:** Invocar o `rlb-agent-historian` com o arquivo de relatório como input.

## Saída Esperada
O arquivo `temp_session_report.md` salvo na memória temporária e a transição para o agente Historian.
