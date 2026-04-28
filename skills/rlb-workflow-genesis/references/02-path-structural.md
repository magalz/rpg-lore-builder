# Path: Structural (Top-Down)

## Goal
Construir o mundo em camadas lógicas, garantindo que as bases sustentem o topo.

## Instructions
Antes de iniciar, apresente o plano base e peça personalização:

1.  **Plano de Construção:** Informe que o fluxo padrão cobre: **Cosmologia, Geografia, Cronologia e Política**.
2.  **Customização:** Pergunte ao usuário: "Além desses pontos, você quer adicionar categorias específicas agora? (Ex: Relíquias Antigas, Tecnologias Perdidas, Ordens de Cavalaria). Ou gostaria de pular alguma das etapas padrão?"

Após a confirmação do plano, siga a ordem definida pelo usuário:

*   **Cosmologia & Criação:** Quem são os deuses? Como o mundo começou?
*   **Geografia Primordial:** Grandes continentes e fenômenos naturais.
*   **Eras e Linha do Tempo:** Grandes eventos históricos.
*   **Sociedade & Política:** Nações, facções e leis.
*   **[Categorias Customizadas]:** Itens definidos no passo inicial.

## Guidelines
- Para cada elemento criado, gere um arquivo `.md` em `{WIKI_PATH}/`.
- Verifique sempre o `index.md` para manter a lista de tópicos atualizada.
- Se o usuário mencionar algo que pertence a uma camada ainda não criada (ex: cita um Rei sem ter criado o Reino), registre no Backlog via `scripts/manage_backlog.py`.
