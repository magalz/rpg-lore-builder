# A Memória do Sanctum 🧠

A persistência dos agentes é o que faz o Lore Sanctum parecer um ecossistema "vivo".

## 💾 Consciência Persistente
Cada agente em uma campanha possui um arquivo de memória privada localizado em:
`campaigns/[sua-campanha]/sanctum/[agent-id]/memory.md`

Quando você fala com um agente, o backend recupera automaticamente suas memórias passadas e as injeta como um "Contexto de Sistema". Isso permite que o Cronista "lembre" que você prefere certos estilos ou que o Weaver saiba que seus jogadores odeiam aranhas.

## 🤖 A Filosofia do "Auto-Save"
O Lore Sanctum utiliza o **Native Function Calling**. Este é o cerne de sua autonomia.

*   **Escrita Autônoma:** Quando um agente diz "Estou atualizando a página da wiki do NPC Kael", ele não está apenas mentindo (uma alucinação comum de IA). Ele está chamando uma ferramenta (`save_file`) que realmente escreve no seu disco.
*   **Success Toasts:** Toda vez que um agente interage com sucesso com seus arquivos ou memória, uma notificação aparece na interface (Toast).
*   **Sandbox de Segurança:** Os agentes estão restritos à pasta da campanha. Eles não podem acessar arquivos do seu sistema ou de outras campanhas.

---

**Próximo Passo:** [Customização Avançada e Habilidades](06-Customizacao-Avancada)
