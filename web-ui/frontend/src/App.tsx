import React, { useState, useEffect, useRef } from 'react';
import { 
  ScrollText, 
  MessageSquare, 
  Shield, 
  Book, 
  Sword, 
  Compass, 
  Sparkles,
  Send,
  Loader2,
  Globe,
  Lock,
  Terminal,
  RefreshCw
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Types
interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface WikiNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: WikiNode[];
}

const API_BASE = 'http://127.0.0.1:8000/api';

// Translations
const t = {
  pt: {
    app_title: 'LORE SANCTUM',
    nav_chat: 'Gabinete do Mestre',
    nav_codex: 'Codex de Lore',
    nav_rituals: 'Rituais',
    council_members: 'Membros do Conselho',
    consulting: 'Consultando',
    speak_mestre: 'Fale, Mestre. O conselho aguarda sua voz.',
    spirits_whispering: 'Conectando ao modelo...',
    ask_placeholder: 'Pergunte ao ',
    codex_index: 'Índice do Codex',
    select_scroll: 'Selecione um pergaminho do índice para ler seu conteúdo.',
    ritual_chamber: 'Câmara de Rituais',
    ritual_desc: 'Esta câmara está sendo preparada para a execução estruturada de workflows.',
    workflow_desc: 'Workflows aparecerão aqui na próxima atualização.',
    auth_required: 'Autenticação Necessária',
    auth_desc: 'Para consultar os espíritos (Vertex AI), você precisa estar autenticado no Google Cloud.',
    auth_step1: 'Abra seu terminal ou PowerShell.',
    auth_step2: 'Execute o comando abaixo e siga as instruções no navegador:',
    auth_retry: 'Já me autentiquei, tentar novamente',
    agents: {
      'rlb-agent-help': { name: 'Guia', desc: 'Seu ponto de partida. Sempre que não souber o que fazer, pergunte a mim.' },
      'rlb-agent-builder': { name: 'Construtor', desc: 'Especialista em construir e expandir regras e mecânicas.' },
      'rlb-agent-chronicler': { name: 'Cronista', desc: 'Registra os eventos, histórias e diários de campanhas.' },
      'rlb-agent-historian': { name: 'Historiador', desc: 'Processa, revisa e refina novas descobertas e origens.' },
      'rlb-agent-inquisitor': { name: 'Inquisidor', desc: 'Auditor implacável. Valida se a lore está coesa com o cânone.' },
      'rlb-agent-tactician': { name: 'Estrategista', desc: 'Mestre em táticas de combate, encontros e desafios.' },
      'rlb-agent-weaver': { name: 'Tecelão', desc: 'Conecta os fios do destino, ganchos e rumores do mundo.' },
      'default': { name: 'Conselheiro', desc: 'Membro especializado do conselho de lore.' }
    }
  },
  en: {
    app_title: 'LORE SANCTUM',
    nav_chat: 'Master\'s Sanctum',
    nav_codex: 'Lore Codex',
    nav_rituals: 'Rituals',
    council_members: 'Council Members',
    consulting: 'Consulting',
    speak_mestre: 'Speak, Master. The council awaits your command.',
    spirits_whispering: 'Connecting to the model...',
    ask_placeholder: 'Ask the ',
    codex_index: 'Codex Index',
    select_scroll: 'Select a scroll from the index to read its contents.',
    ritual_chamber: 'Ritual Chamber',
    ritual_desc: 'This chamber is currently being prepared for structured workflow execution.',
    workflow_desc: 'Workflows will appear here in the next update.',
    auth_required: 'Authentication Required',
    auth_desc: 'To consult the spirits (Vertex AI), you must be authenticated with Google Cloud.',
    auth_step1: 'Open your terminal or PowerShell.',
    auth_step2: 'Run the command below and follow the instructions in your browser:',
    auth_retry: 'I have authenticated, try again',
    agents: {
      'rlb-agent-help': { name: 'Guide', desc: 'Your starting point. Whenever you are unsure what to do, ask me.' },
      'rlb-agent-builder': { name: 'Builder', desc: 'Expert in building and expanding rules and mechanics.' },
      'rlb-agent-chronicler': { name: 'Chronicler', desc: 'Records events, stories, and campaign logs.' },
      'rlb-agent-historian': { name: 'Historian', desc: 'Processes, reviews, and refines new discoveries and origins.' },
      'rlb-agent-inquisitor': { name: 'Inquisitor', desc: 'Relentless auditor. Validates lore cohesion with the canon.' },
      'rlb-agent-tactician': { name: 'Tactician', desc: 'Master of combat tactics, encounters, and challenges.' },
      'rlb-agent-weaver': { name: 'Weaver', desc: 'Connects the threads of destiny, hooks, and world rumors.' },
      'default': { name: 'Councilor', desc: 'Specialized member of the lore council.' }
    }
  }
};

type Lang = 'pt' | 'en';

const getAgentInfo = (id: string, lang: Lang) => {
  const dict = t[lang].agents as Record<string, { name: string, desc: string }>;
  return dict[id] || dict['default'];
};

// Tree Node Component for Wiki
const TreeNode = ({ node, level, onLoadFile }: { node: WikiNode, level: number, onLoadFile: (path: string) => void }) => {
  const [expanded, setExpanded] = useState(false);
  const isDir = node.type === 'directory';
  
  return (
    <div>
      <div 
        className="nav-item"
        style={{ 
          padding: `0.4rem 0.4rem 0.4rem ${level * 1.2 + 0.5}rem`, 
          fontSize: '0.9rem',
          opacity: 0.9
        }}
        onClick={() => {
          if (isDir) setExpanded(!expanded);
          else onLoadFile(node.path);
        }}
      >
        <span style={{ display: 'inline-block', width: '16px', fontSize: '0.7rem', color: 'var(--gold-primary)' }}>
          {isDir ? (expanded ? '▼' : '▶') : '•'}
        </span>
        {isDir ? <Compass size={16} /> : <ScrollText size={16} />}
        <span style={{ marginLeft: '6px' }}>{node.name}</span>
      </div>
      {isDir && expanded && node.children && (
        <div className="tree-children">
          {node.children.map(child => (
            <TreeNode key={child.path} node={child} level={level + 1} onLoadFile={onLoadFile} />
          ))}
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Lang>('pt');
  const [view, setView] = useState<'chat' | 'wiki' | 'rituals'>('chat');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [wikiNodes, setWikiNodes] = useState<WikiNode[]>([]);
  const [selectedWikiContent, setSelectedWikiContent] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);
  const [backendReady, setBackendReady] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const text = t[lang];

  useEffect(() => {
    const init = async () => {
      let ready = false;
      let attempts = 0;
      while (!ready && attempts < 10) {
        try {
          const res = await fetch(`${API_BASE}/auth/status`);
          if (res.ok) {
            ready = true;
            setBackendReady(true);
            checkAuth();
            fetchAgents();
            fetchWiki();
          }
        } catch (e) {
          attempts++;
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    };
    init();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/status`);
      const data = await res.json();
      setAuthError(!data.authenticated);
    } catch (e) {
      console.error('Failed to check auth status', e);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchAgents = async () => {
    try {
      const res = await fetch(`${API_BASE}/agents`);
      const data: Agent[] = await res.json();
      setAgents(data);
      if (data.length > 0) {
        const helpAgent = data.find(a => a.id === 'rlb-agent-help');
        setSelectedAgent(helpAgent || data[0]);
      }
    } catch (e) {
      console.error('Failed to fetch agents', e);
    }
  };

  const fetchWiki = async () => {
    try {
      const res = await fetch(`${API_BASE}/wiki`);
      const data = await res.json();
      setWikiNodes(data);
    } catch (e) {
      console.error('Failed to fetch wiki', e);
    }
  };

  const loadWikiFile = async (path: string) => {
    try {
      const res = await fetch(`${API_BASE}/wiki/content?path=${path}`);
      const data = await res.json();
      setSelectedWikiContent(data.content);
    } catch (e) {
      console.error('Failed to load wiki file', e);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedAgent) return;

    const userMessage = inputValue;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInputValue('');
    setIsTyping(true);
    setAuthError(false);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: selectedAgent.id,
          message: userMessage,
          history: messages.map(m => ({ role: m.role === 'ai' ? 'model' : 'user', content: m.content }))
        })
      });

      if (res.status === 401) {
        setAuthError(true);
        setMessages(prev => prev.slice(0, -1)); // Remove the user message from UI if auth failed
        setInputValue(userMessage); // Restore input
        return;
      }

      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, { role: 'ai', content: data.response }]);
      } else {
        throw new Error(data.detail || 'Unknown error');
      }
    } catch (e) {
      console.error('Chat failed', e);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleLanguage = () => {
    setLang(lang === 'pt' ? 'en' : 'pt');
  };

  return (
    <div className="app-container">
      {!backendReady && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-deep)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 className="animate-spin" size={48} color="var(--gold-primary)" />
          <h2 style={{ marginTop: '2rem' }}>{lang === 'pt' ? 'Despertando o Conselho...' : 'Awakening the Council...'}</h2>
        </div>
      )}
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles className="text-gold" />
            <span>{text.app_title}</span>
          </div>
          <button 
            onClick={toggleLanguage} 
            style={{ 
              background: 'transparent', border: '1px solid var(--border-magic)', 
              color: 'var(--text-muted)', padding: '0.2rem 0.5rem', 
              borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem',
              display: 'flex', alignItems: 'center', gap: '4px'
            }}
            title="Toggle Language"
          >
            <Globe size={14} />
            {lang.toUpperCase()}
          </button>
        </div>
        <nav className="nav-links">
          <li 
            className={`nav-item ${view === 'chat' ? 'active' : ''}`}
            onClick={() => setView('chat')}
          >
            <MessageSquare size={20} />
            {text.nav_chat}
          </li>
          <li 
            className={`nav-item ${view === 'wiki' ? 'active' : ''}`}
            onClick={() => setView('wiki')}
          >
            <Book size={20} />
            {text.nav_codex}
          </li>
          <li 
            className={`nav-item ${view === 'rituals' ? 'active' : ''}`}
            onClick={() => setView('rituals')}
          >
            <Sword size={20} />
            {text.nav_rituals}
          </li>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-magic)' }}>
          <h4 style={{ fontSize: '0.7rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>{text.council_members}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {agents.map(agent => {
              const info = getAgentInfo(agent.id, lang);
              return (
                <div 
                  key={agent.id}
                  className={`nav-item ${selectedAgent?.id === agent.id ? 'active' : ''}`}
                  onClick={() => setSelectedAgent(agent)}
                  style={{ padding: '0.5rem' }}
                >
                  <Shield size={16} />
                  <span style={{ fontSize: '0.85rem' }}>{info.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {view === 'chat' && (
          <div className="chat-container">
            {authError ? (
              <div style={{ 
                flex: 1, display: 'flex', flexDirection: 'column', 
                alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                padding: '2rem', gap: '1.5rem'
              }}>
                <div style={{ padding: '1.5rem', borderRadius: '50%', background: 'rgba(139, 0, 0, 0.1)', border: '1px solid var(--accent-red)' }}>
                  <Lock size={48} color="var(--accent-red)" />
                </div>
                <h2>{text.auth_required}</h2>
                <p style={{ maxWidth: '500px', color: 'var(--text-muted)' }}>{text.auth_desc}</p>
                <div style={{ 
                  background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', 
                  border: '1px solid var(--border-magic)', width: '100%', maxWidth: '600px',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--gold-primary)' }}>
                    <Terminal size={18} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{lang === 'pt' ? 'Instruções de Acesso' : 'Access Instructions'}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                    {lang === 'pt' 
                      ? '1. Instale o Google Cloud CLI se ainda não o tiver:' 
                      : '1. Install Google Cloud CLI if you don\'t have it:'}
                    <a href="https://cloud.google.com/sdk/docs/install" target="_blank" rel="noreferrer" style={{ color: 'var(--gold-primary)', marginLeft: '5px' }}>
                      cloud.google.com/sdk
                    </a>
                  </p>
                  <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                    {lang === 'pt' 
                      ? '2. No seu terminal (PowerShell/CMD), execute:' 
                      : '2. In your terminal (PowerShell/CMD), run:'}
                  </p>
                  <code style={{ 
                    display: 'block', background: '#000', padding: '1rem', 
                    borderRadius: '4px', border: '1px solid #333', color: '#0f0',
                    fontFamily: 'monospace', marginBottom: '1rem'
                  }}>
                    gcloud auth application-default login
                  </code>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {lang === 'pt' 
                      ? '* Isso abrirá o navegador para você escolher sua conta Google.' 
                      : '* This will open your browser to choose your Google account.'}
                  </p>
                </div>
                <button 
                  className="send-btn" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  onClick={checkAuth}
                >
                  <RefreshCw size={18} />
                  {text.auth_retry}
                </button>
              </div>
            ) : (
              <>
                <header style={{ marginBottom: '2rem' }}>
                  <h2>{text.consulting} {selectedAgent ? getAgentInfo(selectedAgent.id, lang).name : ''}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {selectedAgent ? getAgentInfo(selectedAgent.id, lang).desc : ''}
                  </p>
                </header>
                
                <div className="messages">
                  {messages.length === 0 && (
                    <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-muted)' }}>
                      <ScrollText size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                      <p>{text.speak_mestre}</p>
                    </div>
                  )}
                  {messages.map((m, i) => (
                    <div key={i} className={`message ${m.role}`}>
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="message ai" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Loader2 className="animate-spin" size={16} />
                      <span>{text.spirits_whispering}</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="input-area">
                  <input 
                    type="text" 
                    placeholder={`${text.ask_placeholder}${selectedAgent ? getAgentInfo(selectedAgent.id, lang).name : ''}...`}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button className="send-btn" onClick={handleSendMessage}>
                    <Send size={18} />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {view === 'wiki' && (
          <div className="wiki-container">
            <div className="wiki-tree">
              <h3>{text.codex_index}</h3>
              <div style={{ marginTop: '1rem' }}>
                {wikiNodes.map(node => (
                  <TreeNode key={node.path} node={node} level={0} onLoadFile={loadWikiFile} />
                ))}
              </div>
            </div>
            <div className="wiki-content">
              {selectedWikiContent ? (
                <div className="markdown-body">
                  <ReactMarkdown>{selectedWikiContent}</ReactMarkdown>
                </div>
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  <p>{text.select_scroll}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'rituals' && (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <h2>{text.ritual_chamber}</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>{text.ritual_desc}</p>
            <div style={{ marginTop: '2rem', padding: '2rem', border: '1px dashed var(--border-magic)', borderRadius: '8px' }}>
              <Sparkles size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>{text.workflow_desc}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
