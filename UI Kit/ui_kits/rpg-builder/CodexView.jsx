// CodexView.jsx — Wiki tree + markdown reader
const { useState } = React;

const SAMPLE_TREE = [
  { name: 'NPCs', type: 'directory', path: 'npcs/', children: [
    { name: 'Aldric von Halstein.md', type: 'file', path: 'npcs/aldric.md' },
    { name: 'Lady Seraphine.md',      type: 'file', path: 'npcs/seraphine.md' },
    { name: 'O Oráculo Mudo.md',      type: 'file', path: 'npcs/oraculo.md' },
  ]},
  { name: 'Locais', type: 'directory', path: 'locais/', children: [
    { name: 'Ruínas de Velmoor.md', type: 'file', path: 'locais/velmoor.md' },
    { name: 'Cidade de Arkenhold.md', type: 'file', path: 'locais/arkenhold.md' },
  ]},
  { name: 'Facções', type: 'directory', path: 'faccoes/', children: [
    { name: 'Guarda de Ferro.md', type: 'file', path: 'faccoes/guarda.md' },
    { name: 'Conselho dos Seis.md', type: 'file', path: 'faccoes/conselho.md' },
  ]},
  { name: 'Sessões', type: 'directory', path: 'sessoes/', children: [
    { name: 'Sessão 07 — A Traição.md', type: 'file', path: 'sessoes/s07.md' },
    { name: 'Sessão 08 — O Despertar.md', type: 'file', path: 'sessoes/s08.md' },
  ]},
];

const SAMPLE_CONTENT = {
  'npcs/aldric.md': `# Aldric von Halstein\n\n**Tipo:** NPC — Antagonista Ativo\n**Status:** Vivo · Localização desconhecida\n**Última aparição:** [[Sessão 07 — A Traição]]\n\n## Biografia\n\nAldric é um mercenário renegado, antigo Capitão da [[Guarda de Ferro]]. Traiu a Guarda após descobrir que o Comandante vendia informações para [[Conselho dos Seis]].\n\n## Localização Atual\n\n⚠️ **Alerta do Inquisidor:** Aldric foi visto pela última vez nas [[Ruínas de Velmoor]] (Sessão 7). Permanece vivo e sem arco resolvido — *ponta solta crítica*.\n\n## Conexões\n\n- [[Lady Seraphine]] — aliada oculta\n- [[Guarda de Ferro]] — antiga afiliação\n- [[Ruínas de Velmoor]] — última localização`,
  'locais/velmoor.md': `# Ruínas de Velmoor\n\n**Tipo:** Local — Masmorra Abandonada\n**Região:** Planalto de Keth\n**Estado:** Exploradas parcialmente (Sessão 7)\n\n## Descrição\n\nAntigas ruínas de um templo pré-imperial, agora lar de cultistas e criaturas aberrantes. A party explorou o nível superior apenas.\n\n## Pontas Soltas\n\n⚠️ [[Aldric von Halstein]] foi visto fugindo para o nível inferior.\n⚠️ A party não explorou a Câmara Central.`,
};

function TreeNode({ node, level, onSelect }) {
  const [open, setOpen] = useState(level === 0);
  const isDir = node.type === 'directory';
  const s = {
    item: { display: 'flex', alignItems: 'center', gap: 6, padding: `6px 6px 6px ${level * 14 + 10}px`, cursor: 'pointer', color: 'rgba(205,202,233,0.55)', fontSize: 13, borderRadius: 4, transition: 'all 0.15s', userSelect: 'none' },
  };
  return React.createElement('div', null,
    React.createElement('div', {
      style: s.item,
      onClick: () => { if (isDir) setOpen(!open); else onSelect(node); },
      onMouseEnter: e => { e.currentTarget.style.color = '#bda5ff'; e.currentTarget.style.background = 'rgba(107,79,240,0.08)'; },
      onMouseLeave: e => { e.currentTarget.style.color = 'rgba(205,202,233,0.55)'; e.currentTarget.style.background = 'transparent'; },
    },
      React.createElement('span', { style: { fontSize: 9, width: 12, color: '#7b68e8', flexShrink: 0 } }, isDir ? (open ? '▼' : '▶') : '•'),
      React.createElement('span', null, node.name)
    ),
    isDir && open && node.children && node.children.map(child =>
      React.createElement(TreeNode, { key: child.path, node: child, level: level + 1, onSelect })
    )
  );
}

function renderMd(text) {
  return text
    .replace(/^# (.+)$/gm, '<h2 style="font-size:20px;font-weight:700;color:#bda5ff;margin:0 0 14px;letter-spacing:0.04em">$1</h2>')
    .replace(/^## (.+)$/gm, '<h3 style="font-size:15px;font-weight:600;color:#948fff;margin:16px 0 8px;letter-spacing:0.03em">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#eae9ff;font-weight:600">$1</strong>')
    .replace(/⚠️/g, '<span style="color:#d4af37">⚠️</span>')
    .replace(/\[\[(.+?)\]\]/g, '<a style="color:#48ffda;text-decoration:none;border-bottom:1px solid rgba(72,255,218,0.3)">$1</a>')
    .replace(/`(.+?)`/g, '<code style="font-family:monospace;font-size:11px;color:#48ffda;background:rgba(72,255,218,0.07);padding:1px 5px;border-radius:3px">$1</code>')
    .replace(/\n/g, '<br>');
}

function CodexView({ lang }) {
  const [selected, setSelected] = useState(null);
  const content = selected ? (SAMPLE_CONTENT[selected.path] || `*Conteúdo não disponível para demonstração.*`) : null;

  const s = {
    container: { flex: 1, display: 'grid', gridTemplateColumns: '260px 1fr', height: '100%', overflow: 'hidden' },
    tree: { borderRight: '1px solid rgba(130,114,221,0.18)', padding: '20px 10px', overflowY: 'auto', background: 'rgba(17,18,40,0.4)' },
    treeTitle: { fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(205,202,233,0.4)', marginBottom: 14, paddingLeft: 10 },
    content: { padding: '28px 36px', overflowY: 'auto', lineHeight: 1.8, color: '#cdcae9', fontSize: 14 },
    empty: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(205,202,233,0.3)', fontSize: 13 },
  };

  return React.createElement('div', { style: s.container },
    React.createElement('div', { style: s.tree },
      React.createElement('div', { style: s.treeTitle }, lang === 'pt' ? 'Índice do Codex' : 'Codex Index'),
      SAMPLE_TREE.map(node => React.createElement(TreeNode, { key: node.path, node, level: 0, onSelect: setSelected }))
    ),
    React.createElement('div', { style: s.content },
      content
        ? React.createElement('div', { dangerouslySetInnerHTML: { __html: renderMd(content) } })
        : React.createElement('div', { style: s.empty }, lang === 'pt' ? 'Selecione um pergaminho do índice.' : 'Select a scroll from the index.')
    )
  );
}

Object.assign(window, { CodexView });
