# Mapa de I/O dos Agentes e Workflows
> Referência técnica para desenvolvimento. Documenta o que cada agente lê, escreve, e quais ferramentas precisa.

## Tags Dinâmicas de Caminho
| Tag | Resolve para | Exemplo |
|-----|-------------|---------|
| `{WIKI_PATH}` | `campaigns/{id}/wiki` | `C:\Users\x\AppData\rpg-lore-builder\campaigns\rlb\wiki` |
| `{CAMPAIGN_ROOT}` | `campaigns/{id}` | `C:\Users\x\AppData\rpg-lore-builder\campaigns\rlb` |

## Ferramentas (Function Calling)
| Função | Parâmetros | Descrição |
|--------|-----------|-----------|
| `save_file` | `path: str`, `content: str` | Salva/sobrescreve arquivo relativo à raiz da campanha |
| `read_file` | `path: str` | Lê conteúdo de um arquivo relativo à raiz da campanha |
| `list_files` | `folder: str` | Lista arquivos de uma pasta relativa à raiz da campanha |
| `save_memory` | `agent_id: str`, `summary: str` | Salva resumo de sessão no Sanctum (`sanctum/{agent_id}/memory.md`) |

---

## Agentes

### rlb-agent-chronicler (O Cronista)
- **Papel:** Oráculo de leitura. Consulta, conecta pontos, nunca altera.
- **Lê:** `wiki/`, `chronicles/`, `foundations.md`
- **Escreve:** Nada (Read-Only)
- **Ferramentas:** `read_file`, `list_files`
- **Capabilities:** Meta-Oracle, World-Oracle, Web-Oracle, Connect Dots

### rlb-agent-historian (O Historiador)
- **Papel:** Processa fontes brutas e as integra na Wiki.
- **Lê:** `wiki/`, `raw/`, `schema/`
- **Escreve:** `wiki/**` (NPCs, Locais, etc.), `chronicles/sessao_XX.md`, `wiki/pcs/`
- **Ferramentas:** `read_file`, `list_files`, `save_file`, `save_memory`
- **Capabilities:** Ingestão Universal, Registro de Crônicas, Análise de Impacto, Refinamento de Lore

### rlb-agent-builder (O Arquiteto)
- **Papel:** Cria assets de mundo e estrutura mecânica.
- **Lê:** `wiki/`
- **Escreve:** `wiki/npcs/`, `wiki/locations/`, `wiki/entities/`, `wiki/factions/`
- **Ferramentas:** `read_file`, `list_files`, `save_file`, `save_memory`
- **Capabilities:** Desenhar assets, Propor integrações

### rlb-agent-inquisitor (O Inquisidor)
- **Papel:** Auditor de coesão e detector de contradições.
- **Lê:** `wiki/`, `wiki/pcs/`
- **Escreve:** `conflicts/` (relatórios de auditoria)
- **Ferramentas:** `read_file`, `list_files`, `save_file`, `save_memory`
- **Capabilities:** Validate Entry, First Breath, Audit

### rlb-agent-weaver (O Diretor)
- **Papel:** Roteirista e estrategista narrativo.
- **Lê:** `wiki/`, `chronicles/`
- **Escreve:** `scripts_privados/` (roteiros secretos do Mestre)
- **Ferramentas:** `read_file`, `list_files`, `save_file`
- **Capabilities:** Roteirizar Sessão, Validar e Produzir, Ganchos de Impacto

### rlb-agent-tactician (O Tático)
- **Papel:** Mestre de mecânica, combate e balanceamento.
- **Lê:** `wiki/pcs/`, `wiki/entities/`
- **Escreve:** `wiki/entities/` (stats de monstros importados)
- **Ferramentas:** `read_file`, `list_files`, `save_file`
- **Capabilities:** Avaliar Grupo, Projetar Encontro, Buscar Stats, Gerar Monstro, Exportar VTT

### rlb-agent-help (O Guia)
- **Papel:** Direciona o usuário ao agente correto.
- **Lê:** Nada
- **Escreve:** Nada
- **Ferramentas:** Nenhuma
- **Capabilities:** Direcionamento de Usuário

---

## Workflows

### rlb-workflow-genesis
- **Lê:** `wiki/`
- **Escreve:** `wiki/**` (criação de base de mundo), `backlog-lore.md`
- **Ferramentas:** `read_file`, `list_files`, `save_file`

### rlb-workflow-session-log
- **Lê:** `wiki/pcs/`, `chronicles/`
- **Escreve:** `raw/sessao_XX.md`, `temp_session_report.md`
- **Ferramentas:** `read_file`, `list_files`, `save_file`

### rlb-workflow-prep-session
- **Lê:** `wiki/`, `chronicles/`, `wiki/pcs/`
- **Escreve:** `scripts_privados/sessao_XX.md`
- **Ferramentas:** `read_file`, `list_files`, `save_file`

### rlb-workflow-backstory
- **Lê:** `wiki/`
- **Escreve:** `wiki/pcs/` (após validação)
- **Ferramentas:** `read_file`, `list_files`, `save_file`

### rlb-workflow-downtime
- **Lê:** `wiki/` (facções, fronts, locais)
- **Escreve:** Propõe mudanças (Mestre aprova antes de salvar)
- **Ferramentas:** `read_file`, `list_files`, `save_file`

### rlb-workflow-party-knowledge
- **Lê:** `wiki/`, `chronicles/`
- **Escreve:** `handouts/party_knowledge.md`
- **Ferramentas:** `read_file`, `list_files`, `save_file`

---

## Estrutura de Pastas da Campanha
```
campaigns/{campaign_id}/
├── wiki/                    # Lore canônica (Obsidian-compatible)
│   ├── foundations.md       # Base do mundo
│   ├── npcs/                # NPCs
│   ├── pcs/                 # Personagens dos Jogadores
│   ├── locations/           # Locais
│   ├── factions/            # Facções
│   └── entities/            # Monstros e stats
├── chronicles/              # Crônicas literárias de sessões
├── raw/                     # Arquivos brutos importados
├── schema/                  # Templates de estrutura
├── scripts_privados/        # Roteiros secretos do Mestre
├── handouts/                # Documentos para jogadores
├── conflicts/               # Relatórios de auditoria do Inquisitor
├── backlog-lore.md          # Conceitos mencionados mas não definidos
└── sanctum/                 # Memória por agente
    ├── rlb-agent-builder/
    │   └── memory.md
    ├── rlb-agent-inquisitor/
    │   └── memory.md
    └── rlb-agent-historian/
        └── memory.md
```
