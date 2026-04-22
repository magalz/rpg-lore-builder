# 🎲 RPG Lore Builder (rlb) - Versão 2.0

Um ecossistema de agentes de IA coordenados para a construção coesa de mundos, personagens e campanhas de RPG. O foco principal é eliminar inconsistências, furos de roteiro e reduzir a carga cognitiva do Mestre (DM).

## 📋 Visão Geral

O **RPG Lore Builder** utiliza o padrão **Lore Council & Sentinel**, dividindo as responsabilidades entre criação criativa e governança de dados. Todos os agentes compartilham uma "Fonte da Verdade" única através de uma memória centralizada, garantindo que cada detalhe do mundo seja consistente.

---

## ✨ Novidades da Versão 2.0

*   **Busca na Web (Meta-Game):** O Cronista agora pode realizar pesquisas em tempo real sobre regras, itens e monstros.
*   **Integração VTT (Foundry):** Exportação direta de NPCs e Monstros em formato JSON para o Foundry VTT.
*   **Simulação de Downtime:** Evolução dinâmica do mundo durante períodos de descanso.
*   **Gestão de Backstories:** Integração orgânica de novos jogadores ao cenário existente.
*   **Relatórios de Conhecimento:** Geração automática de handouts "O que vocês sabem" para os jogadores.

---

## 🚀 Instalação e Requisitos

### Pré-requisitos
- **Gemini CLI** instalado e configurado.
- Chave de API do Google Gemini.
- Python 3.10+.

### Como Instalar
1. Clone este repositório: `git clone https://github.com/seu-usuario/rpg-lore-builder.git`
2. Inicialize o índice: `graph-init`
3. O módulo `rlb` estará disponível como um conjunto de skills.

---

## 🧠 Arquitetura: The Lore Council

### 🏛️ O Conselho Criativo (The Lore Council)
*   **O Cronista (`rlb-agent-chronicler`)**: Oráculo do mundo. Fornece respostas sobre a Lore (In/Meta-Game) e pesquisa regras/itens na internet via **Web Oracle**.
*   **O Arquiteto (`rlb-agent-builder`)**: Especialista em worldbuilding físico e biográfico (NPCs e Locais).
*   **O Diretor (`rlb-agent-weaver`)**: Roteirista focado em drama, beats de sessão e ganchos de aventura.
*   **O Tático (`rlb-agent-tactician`)**: Especialista mecânico. Gera monstros (Homebrew ou Reskin), balanceia encontros por CR e exporta dados para **Foundry VTT**.

### 🛡️ As Sentinelas de Governança (The Lore Sentinels)
*   **O Inquisidor (`rlb-agent-inquisitor`)**: O guardião da consistência. Detecta furos de roteiro e valida toda nova entrada na Wiki.
*   **O Historiador (`rlb-agent-historian`)**: Processa registros de sessão e integra arquivos externos (PDF/TXT) à Lore.

---

## 🛠️ Workflows Principais

1.  **Gênese (`rlb-workflow-genesis`)**: Criação inicial do mundo e definição das fundações do cenário.
2.  **Preparação de Sessão (`rlb-workflow-prep-session`)**: Planejamento narrativo e tático para o próximo encontro.
3.  **Registro de Sessão (`rlb-workflow-session-log`)**: Transforma os eventos da mesa em crônicas permanentes.
4.  **Downtime (`rlb-workflow-downtime`)**: Simula a passagem do tempo, avançando planos de facções e vilões em background.
5.  **Backstory (`rlb-workflow-backstory`)**: Analisa a história de novos personagens e sugere ganchos de conexão com o mundo.
6.  **Conhecimento da Party (`rlb-workflow-party-knowledge`)**: Compila o conhecimento atual dos jogadores em um documento limpo, filtrando segredos de mestre.

---

## 📖 Estrutura de Memória

*   `wiki/`: Entidades, Locais, Organizações e Regras (Fundações).
*   `chronicles/`: Histórico de todas as sessões jogadas.
*   `handouts/`: Documentos gerados para entrega aos jogadores.
*   `conflicts/`: Registro de inconsistências pendentes de resolução.

---

## 🔧 Tecnologias Utilizadas

*   **Linguagem:** Markdown e Python.
*   **Engine:** Gemini CLI Framework.
*   **Integrações:** Google Web Search e Foundry VTT (JSON Export).

---

## 📜 Licença

Este projeto está sob a licença [MIT](LICENSE).
