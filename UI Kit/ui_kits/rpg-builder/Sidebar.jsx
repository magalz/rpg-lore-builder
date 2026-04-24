// Sidebar.jsx — LORE SANCTUM Sidebar component
// Exports to window.Sidebar

const { useState } = React;

const AGENTS = [
  { id: 'rlb-agent-help',       name: 'Guia',        icon: 'HelpCircle' },
  { id: 'rlb-agent-chronicler', name: 'Cronista',     icon: 'ScrollText' },
  { id: 'rlb-agent-weaver',     name: 'Tecelão',      icon: 'GitBranch'  },
  { id: 'rlb-agent-builder',    name: 'Arquiteto',    icon: 'Hammer'     },
  { id: 'rlb-agent-tactician',  name: 'Estrategista', icon: 'Sword'      },
  { id: 'rlb-agent-historian',  name: 'Historiador',  icon: 'BookOpen'   },
  { id: 'rlb-agent-inquisitor', name: 'Inquisidor',   icon: 'Shield'     },
];

function Icon({ name, size = 18, color }) {
  const el = React.useRef(null);
  React.useEffect(() => {
    if (el.current && window.lucide) {
      el.current.innerHTML = '';
      const svg = window.lucide.createElement(window.lucide[name] || window.lucide.Circle);
      svg.setAttribute('width', size);
      svg.setAttribute('height', size);
      svg.setAttribute('stroke-width', 1.8);
      if (color) svg.style.color = color;
      el.current.appendChild(svg);
    }
  }, [name, size, color]);
  return React.createElement('span', { ref: el, style: { display: 'inline-flex', alignItems: 'center', color } });
}

function Sidebar({ view, onViewChange, selectedAgent, onAgentChange, lang, onLangToggle }) {
  const sidebarStyles = {
    sidebar: {
      width: 260,
      background: '#111228',
      borderRight: '1px solid rgba(130,114,221,0.2)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 16px',
      height: '100vh',
      flexShrink: 0,
    },
    logo: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: 24, paddingBottom: 16,
      borderBottom: '1px solid rgba(130,114,221,0.15)',
    },
    logoInner: {
      display: 'flex', alignItems: 'center', gap: 8,
      fontSize: 13, fontWeight: 700, letterSpacing: '0.1em',
      color: '#bda5ff', textTransform: 'uppercase',
    },
    langBtn: {
      background: 'transparent', border: '1px solid rgba(130,114,221,0.3)',
      color: 'rgba(205,202,233,0.5)', padding: '3px 8px',
      borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit',
      fontSize: 10, fontWeight: 600, letterSpacing: '0.06em',
    },
    navList: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 },
    navItem: (active) => ({
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 12px', borderRadius: 4, cursor: 'pointer',
      color: active ? '#bda5ff' : 'rgba(205,202,233,0.45)',
      fontSize: 14, transition: 'all 0.15s',
      background: active ? 'rgba(107,79,240,0.12)' : 'transparent',
      borderLeft: active ? '2px solid #7b68e8' : '2px solid transparent',
    }),
    divider: {
      borderTop: '1px solid rgba(130,114,221,0.15)',
      paddingTop: 14, marginTop: 'auto',
    },
    sectionLabel: {
      fontSize: 9, fontWeight: 600, letterSpacing: '0.12em',
      textTransform: 'uppercase', color: 'rgba(205,202,233,0.35)',
      marginBottom: 10,
    },
    agentItem: (active) => ({
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '7px 10px', borderRadius: 4, cursor: 'pointer',
      color: active ? '#bda5ff' : 'rgba(205,202,233,0.45)',
      fontSize: 13, transition: 'all 0.15s',
      background: active ? 'rgba(107,79,240,0.1)' : 'transparent',
    }),
  };

  const navItems = [
    { id: 'chat',    icon: 'MessageSquare', label: lang === 'pt' ? 'Gabinete do Mestre' : "Master's Sanctum" },
    { id: 'wiki',    icon: 'Book',          label: lang === 'pt' ? 'Codex de Lore'      : 'Lore Codex'      },
    { id: 'rituals', icon: 'Sword',         label: lang === 'pt' ? 'Rituais'            : 'Rituals'         },
  ];

  return React.createElement('aside', { style: sidebarStyles.sidebar },
    // Logo row
    React.createElement('div', { style: sidebarStyles.logo },
      React.createElement('div', { style: sidebarStyles.logoInner },
        React.createElement(Icon, { name: 'Sparkles', size: 16, color: '#bda5ff' }),
        'LORE SANCTUM'
      ),
      React.createElement('button', { style: sidebarStyles.langBtn, onClick: onLangToggle },
        lang.toUpperCase()
      )
    ),
    // Nav
    React.createElement('ul', { style: sidebarStyles.navList },
      navItems.map(item =>
        React.createElement('li', {
          key: item.id,
          style: sidebarStyles.navItem(view === item.id),
          onClick: () => onViewChange(item.id),
        },
          React.createElement(Icon, { name: item.icon, size: 18, color: view === item.id ? '#bda5ff' : 'rgba(205,202,233,0.45)' }),
          item.label
        )
      )
    ),
    // Council members
    React.createElement('div', { style: sidebarStyles.divider },
      React.createElement('div', { style: sidebarStyles.sectionLabel },
        lang === 'pt' ? 'Membros do Conselho' : 'Council Members'
      ),
      AGENTS.map(agent =>
        React.createElement('div', {
          key: agent.id,
          style: sidebarStyles.agentItem(selectedAgent === agent.id),
          onClick: () => onAgentChange(agent.id),
        },
          React.createElement(Icon, { name: 'Shield', size: 14, color: selectedAgent === agent.id ? '#bda5ff' : 'rgba(205,202,233,0.4)' }),
          React.createElement('span', null, agent.name)
        )
      )
    )
  );
}

Object.assign(window, { Sidebar, AGENTS });
