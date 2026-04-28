# 🎲 RPG Lore Builder (rlb) - Versão 2.0 (The Second Brain Update)

O **RPG Lore Builder** é um ecossistema de agentes de IA coordenados, projetado para atuar como o **"Segundo Cérebro" do Mestre de RPG**. Ele não apenas responde a perguntas, mas compila ativamente a sua campanha em um banco de dados estruturado, interconectado e imutável (estilo Obsidian), eliminando inconsistências, furos de roteiro e reduzindo drasticamente a carga cognitiva do Mestre.

---

## 📋 A Filosofia do "Segundo Cérebro"

Em vez do modelo clássico de chat (onde você pergunta e a IA tenta encontrar a resposta num mar de textos desorganizados), o RPG Lore Builder usa a filosofia de **Compilação em vez de Recuperação**. 

O sistema possui uma arquitetura de três camadas na pasta `_bmad/memory/rlb/`:
- **`raw/` (Anotações Brutas):** A caixa de entrada. Onde os logs de sessão informais, PDFs de regras ou anotações rápidas do Mestre são despejados. São arquivos imutáveis.
- **`wiki/` (A Enciclopédia Obsidian):** Onde os agentes compilam os dados brutos. São páginas em Markdown perfeitamente formatadas para cada NPC, Facção ou Local, utilizando a sintaxe de links duplos `[[Nome]]` para criar um **Graph View** das suas conexões (totalmente compatível com Obsidian).
- **`schema/` (As Leis do Mundo):** Arquivos que ditam as regras de formatação para que os agentes mantenham a Wiki sempre padronizada.

Qualquer nova informação que entra na campanha passa pela **Ingestão Universal**, um processo automatizado onde a IA lê o arquivo bruto na pasta `raw/`, atualiza ou cria novas notas na `wiki/` e gera conexões bidirecionais automáticas.

---

## 🚀 Como Preparar o Ambiente

O Lore Sanctum agora é uma aplicação **Standalone nativa**.

### Pré-requisitos
- Ter o executável **Lore Sanctum** ou rodar o ambiente de desenvolvimento.
- Chave de API do Google Gemini.
- (Recomendado) Ter o aplicativo **Obsidian** instalado para visualizar a pasta `wiki/` como um cofre (Vault) visual.

### Instalação (Desenvolvedor)
1. Clone o repositório.
2. No backend (`web-ui/backend`): `pip install -r requirements.txt`.
3. No frontend (`web-ui/frontend`): `npm install`.
4. Build do Executável: `npm run dist` na pasta `web-ui`.

A estrutura de memória agora é automática e multi-campanha, gerenciada diretamente na pasta `campaigns/`.

---

## 🧠 Arquitetura de Agentes

O sistema divide as responsabilidades entre **Criação Criativa** e **Governança de Dados**.

### 🏛️ The Lore Council (Criação e Jogo)
Estes agentes ajudam você a criar o mundo e narrar o jogo:
*   **O Cronista (`rlb-agent-chronicler`)**: Oráculo do mundo. Responde sobre a lore (In-Game e Meta-Game) e pesquisa regras externas.
*   **O Diretor (`rlb-agent-weaver`)**: Roteirista focado em drama. Propõe "beats" narrativos para a próxima sessão e ganchos de aventura baseados nas pontas soltas da Wiki.
*   **O Arquiteto (`rlb-agent-builder`)**: Especialista em worldbuilding. Cria biografias complexas de NPCs, cidades e mitologias.
*   **O Tático (`rlb-agent-tactician`)**: Especialista em mecânica e matemática de combate. Pega o esboço do Weaver e gera blocos de estatísticas de monstros e balanceamento de encontros.

### 🛡️ The Lore Sentinels (Governança e Consistência)
Estes agentes trabalham nos bastidores para que a sua campanha nunca tenha furos:
*   **O Historiador (`rlb-agent-historian`)**: O Compilador. Ele executa a **Ingestão Universal**: lê os arquivos da pasta `raw/`, extrai entidades e destila isso em notas limpas na pasta `wiki/` com links Obsidian.
*   **O Inquisidor (`rlb-agent-inquisitor`)**: O "Auditor de Furos de Roteiro". Ele atua em duas frentes vitais:
    1.  **O Filtro de Cânone (Reativo):** Durante o registro de sessões ou adição de nova lore, ele cruza as informações novas com a Wiki em tempo real, impedindo que você adicione fatos que contradizem o passado da campanha.
    2.  **A Auditoria Matinal (Proativo):** Roda em background antes do planejamento de cada sessão para varrer a Wiki inteira, alertando o Mestre sobre pontas soltas (Ex: "Vocês esqueceram o NPC X vivo na masmorra faz 3 meses") e notas órfãs.

---

## 🛠️ Workflows Principais

Esses comandos guiam você nos momentos mais importantes da mesa:

1.  **Registro de Sessão (`rlb-workflow-session-log`)**: Ao terminar uma partida, não escreva um resumo perfeito. Apenas "despeje" as ideias no chat. O agente vai te entrevistar para tapar os buracos, gerar um relatório perfeito na pasta `raw/` e iniciar a Ingestão Universal na Wiki.
2.  **Preparação de Sessão (`rlb-workflow-prep-session`)**: O momento em que o Mestre senta para planejar o próximo jogo. 
    *   *Passo 0:* O Inquisitor entrega a "Auditoria Matinal", lembrando de furos e pendências da última sessão.
    *   *Passos Seguintes:* O Weaver cria o drama da sessão e o Tactician insere os monstros e armadilhas no roteiro.
3.  **Gênese (`rlb-workflow-genesis`)**: Usado no dia 0. Criação inicial do mundo, tom e fundações da campanha.
4.  **Conhecimento da Party (`rlb-workflow-party-knowledge`)**: Compila um documento limpo do que os heróis já descobriram, removendo os segredos que só o Mestre sabe. Excelente handout para enviar aos jogadores.

---

## 📜 Licença

Este projeto está sob a licença [MIT](LICENSE). Desenvolvido para tirar o peso dos ombros do Mestre e colocar o foco de volta na diversão da mesa.