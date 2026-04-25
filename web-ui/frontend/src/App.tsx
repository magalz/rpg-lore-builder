import React, { useState, useEffect } from 'react';
import {
  Shield,
  Loader2,
  Lock,
  Sparkles
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import CodexView from './components/CodexView';
import RitualsView from './components/RitualsView';
import RunicLoader from './components/RunicLoader';

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
    auth_required: 'Chave de API Necessária',
    auth_desc: 'Para consultar os espíritos (Gemini AI), você precisa configurar sua chave de API do Google AI Studio.',
    auth_step1: 'Obtenha sua chave gratuita no portal do Google AI Studio.',
    auth_step2: 'Adicione a chave no arquivo backend/.env como GEMINI_API_KEY.',
    auth_retry: 'Já configurei a chave, tentar novamente',
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
    auth_required: 'API Key Required',
    auth_desc: 'To consult the spirits (Gemini AI), you need to configure your Google AI Studio API key.',
    auth_step1: 'Get your free key from the Google AI Studio portal.',
    auth_step2: 'Add the key to the backend/.env file as GEMINI_API_KEY.',
    auth_retry: 'I have configured the key, try again',
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

// Model Configuration Data — IDs and pricing from https://ai.google.dev/gemini-api/docs/pricing
const MODELS = [
  // ── Gemini 3 (Preview) ──────────────────────────────────────────
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro Preview',
    badge: 'NOVO',
    desc: {
      pt: 'O modelo mais poderoso do mundo. Melhor em código, agentes e compreensão multimodal.',
      en: "World's most powerful model. Best for code, agents and multimodal understanding."
    },
    free: { rpm: '—', rpd: '—' },
    pro: { rpm: 'Pago', tpm: 'Tier Pago' },
    pay: '$2.00/M in (≤200K) · $12.00/M out'
  },
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash Preview',
    badge: 'NOVO',
    desc: {
      pt: 'Inteligência de ponta com velocidade Flash. Pesquisa e embasamento superiores.',
      en: 'Cutting-edge intelligence at Flash speed. Superior search and grounding.'
    },
    free: { rpm: '—', rpd: '—' },
    pro: { rpm: 'Pago', tpm: 'Tier Pago' },
    pay: '$0.50/M in · $3.00/M out'
  },
  {
    id: 'gemini-3.1-flash-lite-preview',
    name: 'Gemini 3.1 Flash-Lite Preview',
    badge: 'NOVO',
    desc: {
      pt: 'O mais econômico do Gemini 3. Otimizado para tarefas agentivas de alto volume.',
      en: 'Most economical Gemini 3. Optimized for high-volume agentic tasks.'
    },
    free: { rpm: '—', rpd: '—' },
    pro: { rpm: 'Pago', tpm: 'Tier Pago' },
    pay: '$0.25/M in · $1.50/M out'
  },
  // ── Gemini 2.5 (Estável) ─────────────────────────────────────────
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    desc: {
      pt: 'O mais avançado estável. Raciocínio profundo, código e contexto longo (1M tokens).',
      en: 'Most advanced stable. Deep reasoning, code, and long context (1M tokens).'
    },
    free: { rpm: '5 RPM', rpd: '25 RPD' },
    pro: { rpm: '1000 RPM', tpm: '4M TPM' },
    pay: '$1.25/M in (≤200K) · $10.00/M out'
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    desc: {
      pt: 'Melhor custo-benefício. Raciocínio rápido e multimodal (texto, imagem, vídeo, áudio).',
      en: 'Best cost-performance. Fast reasoning, multimodal (text, image, video, audio).'
    },
    free: { rpm: '10 RPM', rpd: '500 RPD' },
    pro: { rpm: '2000 RPM', tpm: '4M TPM' },
    pay: '$0.30/M in · $2.50/M out'
  },
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash-Lite',
    desc: {
      pt: 'O mais rápido e econômico da família 2.5. Ideal para alto volume e baixa latência.',
      en: 'Fastest and most economical in 2.5 family. Ideal for high volume and low latency.'
    },
    free: { rpm: '30 RPM', rpd: '1500 RPD' },
    pro: { rpm: '4000 RPM', tpm: '8M TPM' },
    pay: '$0.10/M in · $0.40/M out'
  },
  // ── Gemini 2.0 (Legacy) ──────────────────────────────────────────
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    badge: 'LEGACY',
    desc: {
      pt: 'Geração anterior — versões específicas descontinuadas. Use 2.5 Flash quando possível.',
      en: 'Previous generation — some versions deprecated. Prefer 2.5 Flash when possible.'
    },
    free: { rpm: '15 RPM', rpd: '1500 RPD' },
    pro: { rpm: '2000 RPM', tpm: '4M TPM' },
    pay: '$0.10/M in · $0.40/M out'
  }
];


// Modal Component
const BillingModal = ({ isOpen, onClose, lang }: { isOpen: boolean, onClose: () => void, lang: Lang }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(6,4,15,0.92)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '2rem'
    }}>
      <div className="hud-panel shimmer-panel" style={{
        padding: '2rem', borderRadius: '12px', maxWidth: '600px', width: '100%',
        boxShadow: '0 0 50px rgba(78, 207, 198, 0.1)', border: '1px solid var(--teal)'
      }}>
        <div className="hi">
          <h3 style={{ color: 'var(--teal)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <Shield size={24} />
            {lang === 'pt' ? 'Como Limitar Cobranças a Zero' : 'How to Limit Billing to Zero'}
          </h3>
          <div style={{ textAlign: 'left', fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-sec)' }}>
            <p style={{ marginBottom: '1rem' }}>{lang === 'pt' ? 'Siga estes passos no Google Cloud Console para garantir que você nunca seja cobrado:' : 'Follow these steps in the Google Cloud Console to ensure you are never charged:'}</p>
            <ol style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
              <li><strong>{lang === 'pt' ? 'Acesse o Painel:' : 'Access the Dashboard:'}</strong> <a href="https://console.cloud.google.com/billing" target="_blank" rel="noreferrer" style={{ color: 'var(--teal)' }}>console.cloud.google.com/billing</a></li>
              <li><strong>{lang === 'pt' ? 'Orçamentos e Alertas:' : 'Budgets & Alerts:'}</strong> {lang === 'pt' ? 'No menu lateral, clique em "Orçamentos e alertas".' : 'Look for "Budgets & alerts" in the sidebar.'}</li>
              <li><strong>{lang === 'pt' ? 'Criar Orçamento:' : 'Create Budget:'}</strong> {lang === 'pt' ? 'Clique em "Criar orçamento", dê um nome a ele (ex: "Gasto Zero").' : 'Click "Create budget", name it (e.g., "Zero Spend").'}</li>
              <li><strong>{lang === 'pt' ? 'Valor do Orçamento:' : 'Budget Amount:'}</strong> {lang === 'pt' ? 'Em "Valor", selecione "Especificado" e digite ' : 'Under "Amount", select "Specified" and enter '} <strong>0.00</strong>.</li>
              <li><strong>{lang === 'pt' ? 'Ações de Alerta:' : 'Alert Actions:'}</strong> {lang === 'pt' ? 'Marque a opção "Desativar faturamento" (se disponível) ou apenas assegure-se de que o alerta de 100% esteja definido.' : 'Check "Disable billing" (if available) or ensure the 100% alert is set.'}</li>
            </ol>
            <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>{lang === 'pt' ? '* Isso forçará a API a parar de responder assim que os limites gratuitos forem atingidos, evitando qualquer débito no cartão.' : '* This forces the API to stop responding once free limits are reached, preventing any credit card charges.'}</p>
          </div>
          <button
            onClick={onClose}
            style={{
              marginTop: '2rem', width: '100%', background: 'rgba(78,207,198,0.1)',
              border: '1px solid var(--teal)', color: 'var(--teal)', padding: '0.8rem',
              borderRadius: '6px', cursor: 'pointer', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em'
            }}
          >
            {lang === 'pt' ? 'Entendi, fechar' : 'Got it, close'}
          </button>
        </div>
      </div>
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
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [selectedModelId, setSelectedModelId] = useState(MODELS[0].id);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [showBillingTutorial, setShowBillingTutorial] = useState(false);
  const [backendReady, setBackendReady] = useState(false);

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
      return data.authenticated;
    } catch (e) {
      console.error('Failed to check auth status', e);
      return false;
    }
  };

  const handleConfigureAuth = async () => {
    if (!apiKeyInput.trim()) return;

    setIsConfiguring(true);
    try {
      const res = await fetch(`${API_BASE}/auth/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: apiKeyInput,
          model_id: selectedModelId
        })
      });

      if (res.ok) {
        const authenticated = await checkAuth();
        if (authenticated) {
          setApiKeyInput('');
          fetchAgents();
          fetchWiki();
        }
      } else {
        alert(lang === 'pt' ? 'Erro ao configurar chave.' : 'Error configuring key.');
      }
    } catch (e) {
      console.error('Failed to configure auth', e);
    } finally {
      setIsConfiguring(false);
    }
  };

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
        <div style={{ position: 'fixed', inset: 0, background: 'var(--void)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          <img src="/assets/logo.png" alt="RPG Lore Builder" style={{ height: 140, objectFit: 'contain', mixBlendMode: 'screen', filter: 'drop-shadow(0 0 42px rgba(78,207,198,0.7))', animation: 'gemPulse 2s ease-in-out infinite' }} />
          <RunicLoader size={58} />
          <span style={{ fontWeight: 600, fontSize: 13, color: 'rgba(196,174,255,0.6)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            {lang === 'pt' ? 'Despertando o Conselho…' : 'Awakening the Council…'}
          </span>
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        <Sidebar
          view={view}
          setView={setView}
          agents={agents}
          selectedAgent={selectedAgent}
          setSelectedAgent={setSelectedAgent}
          lang={lang}
          onLangToggle={toggleLanguage}
          getAgentInfo={getAgentInfo}
        />

        <main className="main-content">
          <div className="scanline" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }} />
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0, position: 'relative', zIndex: 1 }}>
            {authError ? (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                padding: '2rem', gap: '1.5rem', background: 'radial-gradient(ellipse at 50% 30%, rgba(45,26,110,0.3) 0%, transparent 60%)'
              }}>
                <div style={{ padding: '1.5rem', borderRadius: '50%', background: 'rgba(200, 50, 50, 0.05)', border: '1px solid rgba(200,50,50,0.3)' }}>
                  <Lock size={48} color="rgba(255,100,100,0.7)" />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#c4aeff', letterSpacing: '0.05em' }}>{text.auth_required}</h2>

                <div className="hud-panel shimmer-panel" style={{
                  padding: '2rem', width: '100%', maxWidth: '500px',
                  textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                }}>
                  <div className="hi">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--teal)' }}>
                      <Sparkles size={20} />
                      <span style={{ fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {lang === 'pt' ? 'Desbloquear o Santuário' : 'Unlock the Sanctum'}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-sec)', lineHeight: '1.5' }}>
                      {text.auth_desc}
                      <br />
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--teal)', textDecoration: 'underline', fontSize: '0.8rem', display: 'block', marginTop: '8px' }}
                      >
                        {lang === 'pt' ? 'Obter chave no Google AI Studio' : 'Get key from Google AI Studio'}
                      </a>
                    </p>

                    {/* Billing protection — acima do formulário */}
                    <div style={{
                      marginBottom: '1rem', padding: '0.85rem 1rem',
                      background: 'rgba(78,207,198,0.05)',
                      border: '1px solid rgba(78,207,198,0.2)', borderRadius: '8px',
                      display: 'flex', flexDirection: 'column', gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--teal)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                          <Shield size={14} />
                          {lang === 'pt' ? 'PROTEÇÃO DE CRÉDITOS' : 'CREDIT PROTECTION'}
                        </p>
                        <button
                          onClick={() => setShowBillingTutorial(true)}
                          style={{
                            whiteSpace: 'nowrap', fontSize: '0.75rem', padding: '0.4rem 0.85rem',
                            background: 'var(--teal)', color: 'var(--bg-deep)',
                            fontWeight: 700, border: 'none', borderRadius: '4px', cursor: 'pointer', flexShrink: 0,
                            boxShadow: '0 0 10px rgba(78,207,198,0.4)'
                          }}
                        >
                          {lang === 'pt' ? 'Configurar Agora' : 'Configure Now'}
                        </button>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4', margin: 0 }}>
                        {lang === 'pt'
                          ? 'O Sanctum protege seus créditos. Clique em "Configurar Agora" para ver o tutorial de como colocar limite de pagamento $0 na sua conta e evitar cobranças na Google Cloud.'
                          : 'The Sanctum protects your credits. Click "Configure Now" to read how to set a $0 payment limit on your account to avoid Google Cloud charges.'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ textAlign: 'left' }}>
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                          {lang === 'pt' ? 'MODELO MÍSTICO' : 'MYSTIC MODEL'}
                        </label>
                        <select
                          value={selectedModelId}
                          onChange={(e) => setSelectedModelId(e.target.value)}
                          style={{
                            width: '100%', padding: '0.8rem', background: 'rgba(6,4,15,0.6)',
                            border: '1px solid var(--border)', borderRadius: '4px',
                            color: 'var(--teal)', fontSize: '0.9rem', cursor: 'pointer', outline: 'none'
                          }}
                        >
                          {MODELS.map(m => <option key={m.id} value={m.id} style={{ background: '#0a0b1c' }}>{m.name}</option>)}
                        </select>

                        {/* Reactive model info card */}
                        {(() => {
                          const m = MODELS.find(x => x.id === selectedModelId);
                          if (!m) return null;
                          const desc = lang === 'pt' ? m.desc.pt : m.desc.en;
                          const isPreview = m.badge === 'NOVO';
                          const isLegacy = m.badge === 'LEGACY';
                          const accentColor = isPreview ? 'rgba(196,174,255' : isLegacy ? 'rgba(255,180,80' : 'rgba(78,207,198';
                          return (
                            <div style={{ marginTop: 8, borderRadius: 4, border: `1px solid ${accentColor},0.25)`, overflow: 'hidden', fontSize: 11 }}>
                              <div style={{ padding: '6px 10px', background: `${accentColor},0.05)`, color: 'var(--text-muted)', fontStyle: 'italic', borderBottom: `1px solid ${accentColor},0.1)`, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                                {m.badge && (
                                  <span style={{ flexShrink: 0, fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', background: `${accentColor},0.15)`, color: isPreview ? '#c4aeff' : isLegacy ? 'rgba(255,180,80,0.9)' : 'var(--teal)', border: `1px solid ${accentColor},0.3)`, padding: '1px 5px', borderRadius: 9999 }}>
                                    {isPreview ? '✦ NOVO' : '⚑ LEGACY'}
                                  </span>
                                )}
                                {desc}
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
                                <div style={{ padding: '7px 8px', borderRight: `1px solid ${isPreview ? 'rgba(196,174,255,0.1)' : 'rgba(78,207,198,0.1)'}` }}>
                                  <div style={{ color: `${accentColor},0.55)`, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 4 }}>FREE</div>
                                  <div style={{ color: 'var(--text-sec)' }}>{m.free.rpm}</div>
                                  <div style={{ color: 'var(--text-muted)' }}>{m.free.rpd}</div>
                                </div>
                                <div style={{ padding: '7px 8px', borderRight: `1px solid ${accentColor},0.1)` }}>
                                  <div style={{ color: 'rgba(196,174,255,0.65)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 4 }}>PRO</div>
                                  <div style={{ color: 'var(--text-sec)' }}>{m.pro.rpm}</div>
                                  <div style={{ color: 'var(--text-muted)' }}>{m.pro.tpm}</div>
                                </div>
                                <div style={{ padding: '7px 8px' }}>
                                  <div style={{ color: 'rgba(255,200,80,0.6)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 4 }}>PAY</div>
                                  <div style={{ color: 'var(--text-muted)', fontSize: 10, lineHeight: 1.4 }}>{m.pay}</div>
                                </div>
                              </div>
                              {(isPreview || isLegacy) && (
                                <div style={{ padding: '5px 10px', background: `${accentColor},0.04)`, borderTop: `1px solid ${accentColor},0.08)`, color: `${accentColor},0.45)`, fontSize: 9, letterSpacing: '0.05em' }}>
                                  {isPreview
                                    ? `⚠ ${lang === 'pt' ? 'Preview: limites de taxa mais restritivos. Pode mudar antes de ser estável.' : 'Preview: stricter rate limits. May change before stable release.'}`
                                    : `⚑ ${lang === 'pt' ? 'Legacy: versões específicas descontinuadas. Prefira o 2.5 Flash.' : 'Legacy: specific versions shut down. Prefer 2.5 Flash.'}`
                                  }
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>

                      <input
                        type="password"
                        placeholder="GEMINI_API_KEY"
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        style={{
                          width: '100%', padding: '0.8rem', background: 'rgba(6,4,15,0.6)',
                          border: '1px solid var(--border)', borderRadius: '4px',
                          color: 'var(--teal)', textAlign: 'center', fontSize: '0.9rem', outline: 'none'
                        }}
                      />
                      <button
                        style={{
                          width: '100%', padding: '0.8rem', background: 'rgba(78,207,198,0.1)',
                          border: '1px solid var(--teal)', color: 'var(--teal)', borderRadius: '4px',
                          cursor: 'pointer', fontWeight: 600, textTransform: 'uppercase', transition: 'all 0.2s',
                          opacity: isConfiguring || !apiKeyInput.trim() ? 0.5 : 1
                        }}
                        onClick={handleConfigureAuth}
                        disabled={isConfiguring || !apiKeyInput.trim()}
                        onMouseEnter={e => { if (!isConfiguring) e.currentTarget.style.background = 'rgba(78,207,198,0.2)'; }}
                        onMouseLeave={e => { if (!isConfiguring) e.currentTarget.style.background = 'rgba(78,207,198,0.1)'; }}
                      >
                        {isConfiguring ? <Loader2 className="animate-spin" size={18} /> : lang === 'pt' ? 'Conectar Santuário' : 'Connect Sanctum'}
                      </button>
                    </div>
                  </div>
                </div>

                <BillingModal
                  isOpen={showBillingTutorial}
                  onClose={() => setShowBillingTutorial(false)}
                  lang={lang}
                />
              </div>
            ) : (
              <>
                {view === 'chat' && (
                  <ChatView
                    selectedAgent={selectedAgent}
                    messages={messages}
                    inputValue={inputValue}
                    setInputValue={setInputValue}
                    handleSendMessage={handleSendMessage}
                    isTyping={isTyping}
                    lang={lang}
                    getAgentInfo={getAgentInfo}
                  />
                )}
                {view === 'wiki' && (
                  <CodexView
                    wikiNodes={wikiNodes}
                    selectedWikiContent={selectedWikiContent}
                    loadWikiFile={loadWikiFile}
                    lang={lang}
                  />
                )}
                {view === 'rituals' && (
                  <RitualsView lang={lang} />
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
