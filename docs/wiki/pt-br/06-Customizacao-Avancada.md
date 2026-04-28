# Customização Avançada ⚙️

O Lore Sanctum foi projetado para ser modular. Se você for um usuário avançado ou desenvolvedor, pode criar seus próprios agentes e rituais.

## 📂 O Sandbox da Campanha
A estrutura da sua campanha se parece com isto:
*   `wiki/`: Os dados principais.
*   `raw/`: Materiais fonte e logs de sessão.
*   `sanctum/`: Memórias dos agentes.
*   `schema/`: (Em breve) Regras de formatação.

## 🎨 Criando um Novo Agente/Skills
Os agentes são definidos na pasta `skills/` da raiz do projeto.
Para criar um novo agente:
1.  Crie uma pasta chamada `rlb-agent-[nome]`.
2.  Adicione um arquivo `SKILL.md`. Use frontmatter YAML para o nome e descrição.
3.  **Tags Dinâmicas:** Use `{CAMPAIGN_ROOT}` e `{WIKI_PATH}` em suas instruções. O motor do Sanctum substituirá automaticamente esses campos pelos caminhos corretos da campanha ativa.
4.  **Ferramentas:** Declare que o agente deve usar ferramentas como `save_file` ou `read_file`.

## 🔄 Workflows Customizados
Os workflows são definidos de forma similar em `rlb-workflow-[nome]`. Eles geralmente contêm uma pasta `references/` com procedimentos passo a passo (`01-fase.md`, `02-fase.md`, etc.).

---

**Parabéns!** Você agora é um Mestre do Lore Sanctum.
[Voltar ao Início](Home)
