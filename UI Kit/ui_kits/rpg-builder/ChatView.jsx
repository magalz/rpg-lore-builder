// ChatView.jsx — Chat interface with agent selector
// Requires window.AGENTS

const { useState, useRef, useEffect } = React;

const SAMPLE_MESSAGES = [
  { role: 'user', content: 'Quem é o NPC Aldric e qual é sua última localização conhecida?' },
  { role: 'ai',   content: 'Segundo o **Codex**, **Aldric von Halstein** é um mercenário renegado, antigo capitão da Guarda de Ferro.\n\nSua última localização registrada foi as `Ruínas de Velmoor` (Sessão 7 — há 3 semanas na timeline da campanha).\n\n⚠️ O **Inquisidor** sinalizou que ele permanece vivo e sem resolução narrativa.' },
];

function SimpleMarkdown({ text }) {
  // Very basic inline markdown renderer
  const html = text
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#bda5ff">$1</strong>')
    .replace(/`(.+?)`/g, '<code style="font-family:monospace;font-size:12px;color:#48ffda;background:rgba(72,255,218,0.07);padding:2px 5px;border-radius:3px">$1</code>')
    .replace(/\n/g, '<br>');
  return React.createElement('span', { dangerouslySetInnerHTML: { __html: html } });
}

function ChatView({ agentId, lang }) {
  const [messages, setMessages] = useState(SAMPLE_MESSAGES);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  const agentName = (window.AGENTS || []).find(a => a.id === agentId)?.name || 'Guia';

  useEffect(() => {
    if (endRef.current) {
      endRef.current.parentNode.scrollTop = endRef.current.offsetTop;
    }
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const msg = input;
    setMessages(m => [...m, { role: 'user', content: msg }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setMessages(m => [...m, { role: 'ai', content: `*(Resposta simulada do ${agentName})*\n\nEsta é uma demonstração do kit de UI do LORE SANCTUM. Conecte ao backend para respostas reais.` }]);
      setTyping(false);
    }, 1600);
  };

  const s = {
    container: { flex: 1, display: 'flex', flexDirection: 'column', padding: '28px 32px', maxWidth: 860, margin: '0 auto', width: '100%', height: '100%' },
    header: { marginBottom: 24 },
    h2: { fontFamily: 'inherit', fontWeight: 700, fontSize: 22, color: '#bda5ff', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 },
    sub: { color: 'rgba(205,202,233,0.5)', fontSize: 13 },
    messages: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 20 },
    msgUser: { alignSelf: 'flex-end', background: 'rgba(107,79,240,0.07)', borderRight: '2px solid #7b68e8', borderRadius: 8, padding: '13px 16px', maxWidth: '80%', color: '#eae9ff', fontSize: 14, lineHeight: 1.6 },
    msgAi: { alignSelf: 'flex-start', background: 'rgba(255,255,255,0.025)', borderLeft: '2px solid rgba(205,202,233,0.25)', borderRadius: 8, padding: '13px 16px', maxWidth: '80%', color: '#cdcae9', fontSize: 14, lineHeight: 1.6 },
    typing: { alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', borderLeft: '2px solid rgba(205,202,233,0.2)', color: 'rgba(205,202,233,0.5)', fontSize: 13 },
    dot: { width: 6, height: 6, borderRadius: '50%', background: '#7b68e8' },
    inputArea: { marginTop: 'auto', background: '#111228', border: '1px solid rgba(130,114,221,0.35)', borderRadius: 8, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center' },
    input: { flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#eae9ff', fontFamily: 'inherit', fontSize: 14 },
    sendBtn: { background: 'transparent', border: '1px solid #7b68e8', color: '#bda5ff', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, transition: 'all 0.2s', whiteSpace: 'nowrap' },
    empty: { textAlign: 'center', marginTop: '4rem', color: 'rgba(205,202,233,0.3)', fontSize: 14 },
  };

  return React.createElement('div', { style: s.container },
    React.createElement('header', { style: s.header },
      React.createElement('h2', { style: s.h2 }, lang === 'pt' ? `Consultando ${agentName}` : `Consulting ${agentName}`),
      React.createElement('p', { style: s.sub }, lang === 'pt' ? 'Fale, Mestre. O conselho aguarda sua voz.' : 'Speak, Master. The council awaits.')
    ),
    React.createElement('div', { style: s.messages },
      messages.length === 0 && React.createElement('div', { style: s.empty }, 'O conselho aguarda...'),
      messages.map((m, i) =>
        React.createElement('div', { key: i, style: m.role === 'user' ? s.msgUser : s.msgAi },
          React.createElement(SimpleMarkdown, { text: m.content })
        )
      ),
      typing && React.createElement('div', { style: s.typing },
        React.createElement('span', { style: { ...s.dot, animation: 'rlbPulse 1.2s 0s infinite' } }),
        React.createElement('span', { style: { ...s.dot, animation: 'rlbPulse 1.2s 0.2s infinite' } }),
        React.createElement('span', { style: { ...s.dot, animation: 'rlbPulse 1.2s 0.4s infinite' } }),
        lang === 'pt' ? 'Consultando o modelo...' : 'Consulting the model...'
      ),
      React.createElement('div', { ref: endRef })
    ),
    React.createElement('div', { style: s.inputArea },
      React.createElement('input', {
        style: s.input,
        placeholder: lang === 'pt' ? `Pergunte ao ${agentName}...` : `Ask the ${agentName}...`,
        value: input,
        onChange: e => setInput(e.target.value),
        onKeyDown: e => e.key === 'Enter' && send(),
      }),
      React.createElement('button', { style: s.sendBtn, onClick: send },
        lang === 'pt' ? 'Enviar ›' : 'Send ›'
      )
    )
  );
}

Object.assign(window, { ChatView });
