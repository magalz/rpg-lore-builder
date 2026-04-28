name: validate-inquisitor
description: Chama o Inquisitor para validar as conexões do backstory na Lore.
code: VI
type: prompt
---

# Validação do Inquisidor (Backstory)

## Objetivo
Garantir que a inserção deste novo personagem e seus vínculos não destruam regras, cronologias ou o cânone do mundo.

## Instrução
Após o Mestre escolher os ganchos de integração desejados:
1. Reúna a história do personagem e as conexões aprovadas.
2. Invoque o `rlb-agent-inquisitor` (`validate-entry`) para verificar as adições contra `{WIKI_PATH}/`.
3. O Inquisitor deve garantir que a linha do tempo bate (ex: o personagem não pode ter participado de uma guerra que acabou 50 anos antes de ele nascer, a menos que seja um elfo).
4. Resolva quaisquer conflitos apontados.
5. Quando aprovado, crie o arquivo do personagem em `{WIKI_PATH}/pcs/` (ou sugira o texto para o Mestre salvar) e atualize os arquivos dos NPCs/Facções relacionados para mencionar o personagem.
