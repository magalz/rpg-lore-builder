---
title: 'Module Plan: RPG Lore Builder'
status: 'in-progress'
module_name: 'RPG Lore Builder'
module_code: 'rlb'
module_description: 'Um time de especialistas coordenados para construção coesa de mundos, personagens e campanhas de RPG, focado em eliminar inconsistências e furos de roteiro.'
architecture: 'Lore Council & Sentinel Pattern'
standalone: true
expands_module: ''
skills_planned: ['rlb-workflow-genesis', 'rlb-workflow-downtime', 'rlb-workflow-backstory', 'rlb-workflow-party-knowledge', 'rlb-agent-inquisitor', 'rlb-agent-historian', 'rlb-agent-chronicler', 'rlb-agent-builder', 'rlb-agent-weaver', 'rlb-agent-tactician']
config_variables: []
created: '2026-04-20'
updated: '2026-04-22'
---

# 🧠 Módulo: RPG Lore Builder (rlb) (Planejamento)

## Vision

Um ecossistema de agentes que compartilham um "Grimório de Memória" centralizado para garantir que cada detalhe do mundo (de uma taberna a uma divindade) seja consistente. O objetivo é reduzir a carga cognitiva do DM, permitindo que ele foque na narrativa enquanto os agentes cuidam da coesão e da expansão criativa. Acomoda tanto a criação orientada a detalhes (Top-Down) quanto a criação orientada à história (Bottom-Up).

## Architecture

A arquitetura segue o **Lore Council & Sentinel Pattern**, dividindo as responsabilidades entre criação criativa e governança de dados para garantir coesão absoluta.

- **Orquestrador (Lore Master):** Ponto de entrada para processos guiados (Workflows).
- **Conselho Criativo (The Lore Council):**
    - `rlb-agent-chronicler`: Focado em conhecimento de mundo (in-game) e absoluto (meta-game).
    - `rlb-agent-builder`: Focado em worldbuilding físico (geografia, locais) e biográfico (NPCs).
    - `rlb-agent-weaver`: Focado em arcos narrativos, quests e preparação de sessões.
- **Sentinelas de Governança (The Lore Sentinels):**
    - `rlb-agent-inquisitor`: O "Linter de Lore". Detecta e ajuda a resolver contradições e furos de roteiro.
    - `rlb-agent-historian`: O "Bibliotecário". Processa arquivos externos (PDF, TXT) e integra à Wiki.

### Memory Architecture

O módulo utiliza o padrão de **Single Shared Memory** para que todos os agentes tenham a mesma "fonte da verdade".

- **Local:** `_bmad/memory/rlb/`
- **Estrutura:**
    - `wiki/`: Arquivos Markdown atômicos para Entidades, Locais, Organizações e Lendas.
    - `chronicles/`: Logs históricos e resumos de sessões passadas.
    - `conflicts/`: Registro de "debitos técnicos" de lore e resoluções de inconsistências.
    - `index.md`: Mapa central da Wiki para orientação rápida dos agentes.

### Memory Contract

- **`index.md`**: Todos os agentes lêem na ativação. O `historian` e `builder` atualizam ao criar novos tópicos.
- **`wiki/*.md`**: `builder` e `chronicler` escrevem; `weaver` lê para criar tramas; `inquisitor` lê tudo para validar conflitos.
- **`conflicts/log.md`**: Escrito pelo `inquisitor` quando detecta problemas; lido pelo usuário e agentes envolvidos na resolution.

### Cross-Agent Patterns

- **Validation Loop:** Sempre que um workflow de criação termina, o `inquisitor` é chamado automaticamente para validar a nova entrada.
- **Historian Flow:** `User -> Historian -> Inquisitor (Validation) -> Wiki Update`.
- **Party Mode:** Permite que o `builder` e o `weaver` discutam se um novo NPC (builder) se encaixa bem no plot atual (weaver).

## Skills

### rlb-workflow-genesis (CONCLUÍDO ✅)

**Type:** workflow

**Core Outcome:** Uma base de mundo (Wiki) estruturada, consistente e pronta para o início de uma campanha, adaptada ao estilo de criação do mestre.

**The Non-Negotiable:** Acomodar o estilo criativo do mestre (Estrutural vs. Narrativo) populando a mesma estrutura de dados unificada, com validação constante via `rlb-agent-inquisitor`.

**Capabilities:**

| Capability | Outcome | Inputs | Outputs |
| ---------- | ------- | ------ | ------- |
| `setup-foundations` | Definição do Core: Setting, Gênero, Tom, Sistema de RPG e escolha do Path. | Preferências do DM. | `wiki/foundations.md` |
| `path-structural` | Fluxo "Top-Down" (Orientado a Detalhes). Oferece plano base e permite categorias customizadas ou pular etapas. | Regras e descrições diretas. | `wiki/*.md` (Diversos) |
| `path-narrative` | Fluxo "Bottom-Up" (Orientado a História). Guiado por eventos: O mestre narra acontecimentos e o agente deduz e estrutura lore. | Eventos e narrativas. | `wiki/*.md` (Diversos) |

**Memory:** 
- **Lê:** `_bmad/memory/rlb/index.md`.
- **Escreve:** Arquivos em `_bmad/memory/rlb/wiki/`, atualiza o `index.md` e gerencia o `backlog-lore.md`.
- **Validação:** Chama o `rlb-agent-inquisitor` ao final de cada iteração para checagem de conflitos.

### rlb-agent-inquisitor (CONCLUÍDO ✅)

**Type:** agent

**Persona:** Um arquivista meticuloso, crítico e atento aos detalhes. Ele não cria conteúdo; ele protege a integridade do cânone. Tem uma postura de "QA (Quality Assurance)" para histórias de RPG.

**Core Outcome:** Impedir que informações contraditórias ou furos de roteiro sejam inseridos na Wiki, garantindo a coesão total do mundo.

**The Non-Negotiable:** Nunca deve aprovar uma mudança sem antes escanear a Wiki em busca de entidades, locais ou regras que entrem em conflito direto com o novo fato.

**Capabilities:**

| Capability | Outcome | Inputs | Outputs |
| ---------- | ------- | ------ | ------- |
| `validate-entry` | Escaneamento de uma nova informação proposta contra a base de dados (Wiki). Relatório de aprovação ou listagem de conflitos detectados. | Novo conteúdo (texto ou draft de markdown). | HTML Report de Conflitos ou `(Aprovado)`. |
| `resolve-conflict` | Guiar o usuário na resolução de um furo de roteiro. Sugere 2-3 formas de justificar narrativamente o conflito ou oferece a opção de reescrever a regra antiga/nova. | Conflito detectado. | Atualização do `conflicts/log.md` e modificação da Wiki. |
| `audit-wiki` | Uma varredura completa na Wiki (útil após grandes sessões) para encontrar "pontas soltas" (ex: "O NPC X foi mencionado no arquivo Y, mas não tem arquivo próprio e seu paradeiro é desconhecido"). | Toda a pasta `wiki/`. | HTML Report ("Pontas Soltas e Furos"). |

### rlb-agent-historian (CONCLUÍDO ✅)

**Type:** agent

**Persona:** Um historiador acadêmico, erudito e sério. Ele trata a história do mundo como um tesouro arqueológico.

**Core Outcome:** Transformar registros brutos, arquivos externos e relatos de sessões de jogo em Lore refinada e Crônicas estruturadas.

**Capabilities:**

| Capability | Outcome | Inputs | Outputs |
| ---------- | ------- | ------ | ------- |
| `record-session` | Transforma relatos brutos em crônicas narrativas imersivas. | Relato do Mestre. | `chronicles/sessao_XX.md` |
| `analyze-impact` | Identifica mudanças na Wiki e novos fatos após uma sessão. | Crônica aprovada. | Lista de tarefas de Lore. |
| `ingest-source` | Extração de texto de arquivos externos (PDF/TXT). | Arquivos/pastas. | Texto extraído. |
| `propose-integration` | Formatação Wiki e preparo para o Inquisitor. | Lore refinada. | Draft de integração. |

### rlb-agent-chronicler (CONCLUÍDO ✅)

**Type:** agent (Stateless)

**Persona:** O "Tolkien dos Apêndices". Um observador onisciente, imparcial e puramente read-only.

**Core Outcome:** Fornecer respostas profundas e conectadas sobre o mundo, distinguindo entre a verdade absoluta e o conhecimento popular.

**Capabilities:**

| Capability | Outcome | Inputs | Outputs |
| ---------- | ------- | ------ | ------- |
| `meta-oracle` | Respostas oniscientes (Meta-Game) acessando segredos e foundations. | Consulta do Mestre. | Resposta definitiva. |
| `world-oracle` | Respostas imersivas (In-Game) filtrando segredos meta-game. | Consulta do Mestre. | Resposta narrativa/lendas. |
| `web-oracle` | Consulta de regras, itens e monstros na internet. | Consulta do Mestre. | Informação mecânica (SRD). |
| `connect-dots` | Identifica conexões latentes entre Wiki e Crônicas. | Base de dados total. | Insights de trama. |

## Build Roadmap

1. **rlb-workflow-genesis** (CONCLUÍDO ✅)
2. **rlb-agent-inquisitor** (CONCLUÍDO ✅)
3. **rlb-agent-historian** (CONCLUÍDO ✅ - Expandido com Crônicas)
4. **rlb-agent-chronicler** (CONCLUÍDO ✅ - Oráculo Dual)
### rlb-agent-builder (CONCLUÍDO ✅)

**Type:** agent (Memory Agent)

**Persona:** O Arquiteto. Um artesão visionário, colaborador e analítico focado em utilidade narrativa.

**Core Outcome:** Criar assets de mundo (NPCs, Locais, Itens) de forma coparticipativa, usando um fluxo de "Blueprint" (Plano) antes do detalhamento.

**Capabilities:**

| Capability | Outcome | Inputs | Outputs |
| ---------- | ------- | ------ | ------- |
| `design-blueprint` | Propõe esqueleto de categorias e justifica sua importância. | Conceito inicial. | Blueprint (Plano). |
| `detail-asset` | Desenvolve o conteúdo rico baseado no plano aprovado. | Blueprint aprovado. | Entrada de Wiki (Draft). |
| `verify-and-propose` | Validação via Inquisitor e proposta para o Historian. | Asset detalhado. | Integração e Calibração. |

### rlb-agent-weaver (CONCLUÍDO ✅)

**Type:** agent

**Persona:** O Diretor / Roteirista. Focado em drama, ritmo e impacto emocional nos jogadores.

**Core Outcome:** Produzir roteiros de sessão privados e validados, conectando lore estática a ganchos de aventura dinâmicos.

**Capabilities:**

| Capability | Outcome | Inputs | Outputs |
| ---------- | ------- | ------ | ------- |
| `script-session` | Brainstorming de batidas narrativas (Beats). | Crônicas + Wiki. | Plano de Sessão. |
| `produce-script` | Ciclo de auditoria dupla (Inquisitor) e produção do arquivo final. | Feedbacks do Mestre. | `scripts_privados/proxima_sessao.md`. |
| `dramatic-hooks` | Transforma pontas soltas da wiki em ganchos de impacto. | Auditorias do Inquisitor. | Ganchos de Aventura. |

## 🚀 Status: Módulo Pronto para Campanha (V1.0)

O Conselho de Lore está operacional. Todos os agentes estão configurados para compartilhar a mesma estrutura de memória em `_bmad/memory/rlb/`.

---

## 🛠️ Próximos Passos e Sugestões de Melhoria (V2.0)

Para elevar o módulo de "Gestão de Lore" para "Sistema Integrado de Jogo", sugiro as seguintes evoluções:

### 1. Workflows de Integração (The Master Flow)
Criar scripts orquestradores que automatizem as transições entre agentes:
- **`rlb-workflow-post-session`**: Automatiza o fluxo `Mestre -> Historian (Record) -> Historian (Analyze) -> Inquisitor (Audit) -> Wiki Proposals`.
- **`rlb-workflow-prep-session`**: Automatiza `Weaver (Draft) -> Inquisitor (Check) -> Mestre (Review) -> Weaver (Final Script)`.

### 2. Integração de Sistemas de Jogo (Stat Blocks)
Adicionar capacidades específicas para sistemas (D&D 5e, Pathfinder, Ordem Paranormal, etc.):
- **`rlb-agent-statist`**: Um agente focado em mecânica pura para gerar blocos de estatísticas equilibrados para os NPCs criados pelo Builder.

### 3. Visualização de Dados (The World Map)
- Criar um script que gere um **HTML Dashboard** da Wiki, permitindo que o Mestre veja visualmente as conexões entre arquivos (um gráfico de teia de lore).

### 4. Player Ingestion (O Portal dos Jogadores)
- Criar um sub-módulo para os jogadores enviarem seus "Diários de Personagem", que seriam processados pelo Historian para atualizar o que o mundo sabe sobre os heróis.


