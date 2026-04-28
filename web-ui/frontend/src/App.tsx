import React, { useState, useEffect } from 'react';
import {
  Shield,
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import CodexView from './components/CodexView';
import RitualsView from './components/RitualsView';
import RunicLoader from './components/RunicLoader';
import Titlebar from './components/Titlebar';

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
  hidden?: boolean;
  files?: Array<{ name: string; mime_type: string; data: string }>;
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
    auth_btn: 'Autenticar',
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
    auth_btn: 'Authenticate',
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

const getAgentInfo = (id: string, lang: Lang, agents: Agent[] = [], workflows: Agent[] = []) => {
  const dict = t[lang].agents as Record<string, { name: string, desc: string }>;
  if (dict[id]) return dict[id];

  // Dynamic lookup for workflows or agents not in translate dictionary
  const dynamic = [...agents, ...workflows].find(f => f.id === id);
  if (dynamic) return { name: dynamic.name, desc: dynamic.description };

  return dict['default'];
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
    pros: { pt: 'Raciocínio de elite para tramas de RPG complexas.', en: 'Elite reasoning for complex RPG plots.' },
    cons: { pt: 'Versão preview; pode sofrer com latência alta.', en: 'Preview version; may suffer from high latency.' },
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
    pros: { pt: 'Excelente para rituais que exigem rapidez.', en: 'Excellent for rituals requiring speed.' },
    cons: { pt: 'Instável em sessões de roleplay muito longas.', en: 'Unstable in very long roleplay sessions.' },
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
    pros: { pt: 'Ideal para automação de fichas e NPCs secundários.', en: 'Ideal for sheet automation and secondary NPCs.' },
    cons: { pt: 'Menos criatividade narrativa que os modelos Pro.', en: 'Less narrative creativity than Pro models.' },
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
    pros: { pt: 'Focado em Storytelling profundo e roteiros de campanha.', en: 'Focused on deep Storytelling and campaign scripts.' },
    cons: { pt: 'Latência perceptível em conversas triviais.', en: 'Noticeable latency in trivial conversations.' },
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
    pros: { pt: 'Equilibrado e rápido; lida bem com imagens e anexos.', en: 'Balanced and fast; handles images and attachments well.' },
    cons: { pt: 'Pode "esquecer" detalhes de lore em sessões imensas.', en: 'May "forget" lore details in immense sessions.' },
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
    pros: { pt: 'Chat instantâneo para consultas rápidas de regras.', en: 'Instant chat for quick rule queries.' },
    cons: { pt: 'Narrativa mais simplificada e direta.', en: 'More simplified and direct narrative.' },
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
    pros: { pt: 'Estabilidade comprovada em versões antigas.', en: 'Proven stability in older versions.' },
    cons: { pt: 'Modelo descontinuado; menos inteligente que a linha 2.5/3.', en: 'Deprecated model; less intelligent than 2.5/3 lines.' },
    free: { rpm: '15 RPM', rpd: '1500 RPD' },
    pro: { rpm: '2000 RPM', tpm: '4M TPM' },
    pay: '$0.10/M in · $0.40/M out'
  }
];


// Custom Lore Modal Component
interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  lang: 'pt' | 'en';
}

const LoreModal: React.FC<ModalProps> = ({ isOpen, title, message, onConfirm, onCancel, lang }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(5, 4, 20, 0.9)', zIndex: 10000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(8px)', animation: 'fadeIn 0.2s ease'
    }}>
      <div className="hud-panel" style={{
        maxWidth: 400, width: '90%', padding: '24px', borderRadius: 8,
        border: '1px solid rgba(78,207,198,0.3)',
        boxShadow: '0 0 40px rgba(0,0,0,0.8), 0 0 20px rgba(78,207,198,0.1)',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Shield size={22} color="#4ecfc6" />
          <h2 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#4ecfc6', margin: 0 }}>
            {title}
          </h2>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(205,202,233,0.8)', lineHeight: 1.6, marginBottom: 24 }}>
          {message}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          {onCancel && (
            <button
              onClick={onCancel}
              style={{
                background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)',
                padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600,
                letterSpacing: '0.05em', transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              {lang === 'pt' ? 'CANCELAR' : 'CANCEL'}
            </button>
          )}
          <button
            onClick={onConfirm}
            style={{
              background: 'rgba(78,207,198,0.1)', border: '1px solid #4ecfc6', color: '#4ecfc6',
              padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.05em', transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(78,207,198,0.2)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(78,207,198,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(78,207,198,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            {onCancel ? (lang === 'pt' ? 'CONFIRMAR' : 'CONFIRM') : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
};

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
  const [view, setView] = useState<'chat' | 'wiki' | 'rituals' | 'settings'>('chat');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [conversations, setConversations] = useState<Record<string, Message[]>>({});
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [wikiNodes, setWikiNodes] = useState<WikiNode[]>([]);
  const [workflows, setWorkflows] = useState<Agent[]>([]);
  const [selectedWikiContent, setSelectedWikiContent] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [selectedModelId, setSelectedModelId] = useState(MODELS[0].id);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [showBillingTutorial, setShowBillingTutorial] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [backendReady, setBackendReady] = useState(false);
  const [activeCampaign, setActiveCampaign] = useState('rlb');
  const [campaigns, setCampaigns] = useState(['rlb']);
  const [autoSave, setAutoSave] = useState(true);

  // Custom Modal State
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setModal({ isOpen: true, title, message, onConfirm: () => { onConfirm(); setModal(prev => ({ ...prev, isOpen: false })); }, onCancel: () => setModal(prev => ({ ...prev, isOpen: false })) });
  };

  const showAlert = (title: string, message: string) => {
    setModal({ isOpen: true, title, message, onConfirm: () => setModal(prev => ({ ...prev, isOpen: false })) });
  };

  const messages = selectedAgent ? (conversations[selectedAgent.id] || []) : [];

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
            fetchCampaigns();
            fetchWorkflows();
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
      if (data.model_id) {
        setSelectedModelId(data.model_id);
      }
      if (data.auto_save !== undefined) {
        setAutoSave(data.auto_save);
      }
      return data.authenticated;
    } catch (e) {
      console.error('Failed to check auth status', e);
      return false;
    }
  };

  const handleConfigureAuth = async () => {
    // We now allow saving if there's a key OR if the user just wants to change the model
    // But we still don't want to send totally empty requests if nothing changed.
    // For simplicity, we just allow it and let the backend decide.

    setIsConfiguring(true);
    setApiError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: apiKeyInput,
          model_id: selectedModelId,
          auto_save: autoSave
        })
      });

      if (res.ok) {
        // Find if this was just an auto-save toggle or a full reconfig
        const isReconfig = apiKeyInput.trim() !== "" || selectedModelId !== MODELS[0].id; // Simplified check

        showAlert(
          lang === 'pt' ? 'Configurações Salvas' : 'Settings Saved',
          lang === 'pt' ? 'As alterações foram aplicadas com sucesso.' : 'Changes applied successfully.'
        );

        if (isReconfig) {
          setTimeout(() => window.location.reload(), 1500);
        } else {
          setView('chat');
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        showAlert(
          lang === 'pt' ? 'Erro de Calibração' : 'Calibration Error',
          errData.detail || (lang === 'pt' ? 'Erro na validação da chave API.' : 'API Key validation failed.')
        );
      }
    } catch (e) {
      console.error('Failed to configure auth', e);
      showAlert('Error', lang === 'pt' ? 'Falha ao conectar com o servidor.' : 'Failed to connect to server.');
    } finally {
      setIsConfiguring(false);
    }
  };

  const handleDeleteAPIKey = async () => {
    showConfirm(
      lang === 'pt' ? 'Deletar Chave' : 'Delete Key',
      lang === 'pt'
        ? 'Deseja realmente remover a chave de API? Isso impedirá o funcionamento do conselho até que uma nova chave seja fornecida.'
        : 'Do you really want to remove the API key? This will prevent the council from functioning until a new key is provided.',
      async () => {
        try {
          await fetch(`${API_BASE}/auth/configure`, { method: 'DELETE' });
          setAuthError(true);
          if (view === 'settings') setView('chat');
          setApiKeyInput('');
          window.location.reload();
        } catch (e) {
          console.error(e);
        }
      }
    );
  };

  const fetchAgents = async () => {
    try {
      const res = await fetch(`${API_BASE}/agents`);
      const data: Agent[] = await res.json();
      setAgents(data);
      if (data.length > 0 && !selectedAgent) {
        const helpAgent = data.find(a => a.id === 'rlb-agent-help');
        setSelectedAgent(helpAgent || data[0]);
      }
    } catch (e) {
      console.error('Failed to fetch agents', e);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const res = await fetch(`${API_BASE}/campaigns`);
      const data: string[] = await res.json();
      setCampaigns(data);
      if (data.length > 0 && !data.includes(activeCampaign)) {
        setActiveCampaign(data[0]);
      }
    } catch (e) {
      console.error('Failed to fetch campaigns', e);
    }
  };

  const fetchWiki = async (campaignId: string) => {
    try {
      const res = await fetch(`${API_BASE}/wiki?campaign_id=${campaignId}`);
      const data = await res.json();
      setWikiNodes(data);
    } catch (e) {
      console.error('Failed to fetch wiki', e);
    }
  };

  useEffect(() => {
    if (backendReady) {
      fetchWiki(activeCampaign);
    }
  }, [backendReady, activeCampaign]);

  const fetchWorkflows = async () => {
    try {
      const res = await fetch(`${API_BASE}/workflows`);
      const data = await res.json();
      setWorkflows(data);
    } catch (e) {
      console.error('Failed to fetch workflows', e);
    }
  };

  const changeAgent = (agent: Agent) => {
    if (selectedAgent?.id !== agent.id) {
      setSelectedAgent(agent);
      if (view !== 'chat') setView('chat');
    }
  };

  const loadWikiFile = async (path: string) => {
    try {
      const res = await fetch(`${API_BASE}/wiki/content?path=${path}&campaign_id=${activeCampaign}`);
      const data = await res.json();
      setSelectedWikiContent(data.content);
    } catch (e) {
      console.error('Failed to load wiki file', e);
    }
  };

  const handleCreateCampaign = async () => {
    const name = window.prompt(lang === 'pt' ? 'Nome da nova campanha:' : 'New campaign name:');
    if (!name) return;

    try {
      const res = await fetch(`${API_BASE}/campaigns?name=${encodeURIComponent(name)}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setCampaigns(prev => [...prev, data.id]);
        handleSwitchCampaign(data.id);
      }
    } catch (e) {
      console.error('Failed to create campaign', e);
    }
  };

  const handleExportCampaign = () => {
    window.open(`${API_BASE}/campaigns/${activeCampaign}/export`);
  };

  const handleSwitchCampaign = (id: string) => {
    setActiveCampaign(id);
    setConversations({});
    setSelectedWikiContent(null);
    if (view !== 'chat') setView('chat');
  };

  const handleSendMessage = async (customMessage?: string, hidden: boolean = false, files: any[] = [], clearHistory: boolean = false) => {
    const activeMsg = customMessage !== undefined ? customMessage : inputValue;
    if (!activeMsg.trim() && !files.length && !selectedAgent) return;

    if (customMessage === undefined) setInputValue('');
    setIsTyping(true);
    setAuthError(false);

    // Context isolation logic
    const currentAgentId = selectedAgent!.id;
    const historyPayload = clearHistory ? [] : (conversations[currentAgentId] || []).map(m => ({ role: m.role === 'ai' ? 'model' : 'user', content: m.content }));

    // Update state to include User Message
    setConversations(prev => ({
      ...prev,
      [currentAgentId]: [...(prev[currentAgentId] || []), { role: 'user', content: activeMsg, hidden, files }]
    }));

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: currentAgentId,
          message: activeMsg,
          campaign_id: activeCampaign,
          history: historyPayload,
          files: files
        })
      });

      if (res.status === 401) {
        setAuthError(true);
        // Rollback message if auth failed
        setConversations(prev => ({
          ...prev,
          [currentAgentId]: (prev[currentAgentId] || []).slice(0, -1)
        }));
        if (customMessage === undefined) setInputValue(activeMsg); // Restore input
        return;
      }

      const data = await res.json();
      if (res.ok) {
        setConversations(prev => ({
          ...prev,
          [currentAgentId]: [...(prev[currentAgentId] || []), { role: 'ai', content: data.response }]
        }));

        // Show toast if tool was used
        if (data.tool_used) {
          showAlert(
            lang === 'pt' ? 'Ação Autônoma' : 'Autonomous Action',
            lang === 'pt' ? 'O agente realizou uma operação de escrita/memória com sucesso.' : 'The agent successfully performed a write/memory operation.'
          );
          // Refresh wiki if needed
          fetchWiki(activeCampaign);
        }
      } else {
        throw new Error(data.detail || 'Unknown error');
      }
    } catch (e) {
      console.error('Chat failed', e);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = () => {
    if (!selectedAgent) return;
    showConfirm(
      lang === 'pt' ? 'Limpar Contexto' : 'Clear Context',
      lang === 'pt'
        ? `Tem certeza que deseja apagar o histórico de ${getAgentInfo(selectedAgent.id, lang, agents, workflows).name}? O agente esquecerá tudo o que foi discutido nesta sessão.`
        : `Are you sure you want to clear the history for ${getAgentInfo(selectedAgent.id, lang, agents, workflows).name}? The agent will forget everything discussed in this session.`,
      () => {
        setConversations(prev => ({ ...prev, [selectedAgent.id]: [] }));
      }
    );
  };

  const toggleLanguage = () => {
    setLang(lang === 'pt' ? 'en' : 'pt');
  };

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <Titlebar lang={lang} />
      {!backendReady && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--void)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          <img src="/assets/logo.png" alt="RPG Lore Builder" style={{ height: 140, objectFit: 'contain', mixBlendMode: 'screen', filter: 'drop-shadow(0 0 42px rgba(78,207,198,0.7))', animation: 'gemPulse 2s ease-in-out infinite' }} />
          <RunicLoader size={58} />
          <span style={{ fontWeight: 600, fontSize: 13, color: 'rgba(196,174,255,0.6)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            {lang === 'pt' ? 'Despertando o Conselho…' : 'Awakening the Council…'}
          </span>
        </div>
      )}

      {/* Persistent Fail-safe Auth Overlay */}
      {/* Removed Generic Auth Overlay */}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {!authError && (
          <Sidebar
            view={view === 'settings' ? 'chat' : view}
            setView={setView}
            agents={agents}
            selectedAgent={selectedAgent}
            setSelectedAgent={changeAgent}
            lang={lang}
            onLangToggle={toggleLanguage}
            getAgentInfo={(id, l) => getAgentInfo(id, l as Lang, agents, workflows)}
            onOpenSettings={() => setView('settings')}
            activeCampaign={activeCampaign}
            campaigns={campaigns}
            onSwitchCampaign={handleSwitchCampaign}
            onCreateCampaign={handleCreateCampaign}
            onExportCampaign={handleExportCampaign}
          />
        )}

        <main className="main-content">
          <div className="scanline" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }} />
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0, position: 'relative', zIndex: 1 }}>
            {!authError && view === 'chat' && (
              <ChatView
                agent={selectedAgent}
                messages={messages}
                inputValue={inputValue}
                setInputValue={setInputValue}
                handleSendMessage={handleSendMessage}
                isTyping={isTyping}
                lang={lang}
                getAgentInfo={(id, l) => getAgentInfo(id, l as Lang, agents, workflows)}
                onClearHistory={handleClearHistory}
                showAlert={showAlert}
              />
            )}
            {view === 'wiki' && !authError && (
              <CodexView
                wikiNodes={wikiNodes}
                selectedWikiContent={selectedWikiContent}
                loadWikiFile={loadWikiFile}
                lang={lang}
              />
            )}
            {view === 'rituals' && !authError && (
              <RitualsView
                lang={lang}
                setView={setView}
                setInputValue={setInputValue}
                setSelectedAgent={setSelectedAgent}
                agents={agents}
                workflows={workflows}
                handleSendMessage={(msg, hidden) => handleSendMessage(msg, hidden, [], true)}
              />
            )}
            {(authError || view === 'settings') && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div style={{ maxWidth: 500, width: '100%' }} className="hud-panel shimmer-panel">
                  <div className="hi" style={{ padding: '2rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                      <div style={{ padding: '1rem', borderRadius: '50%', background: 'rgba(78,207,198,0.05)', border: '1px solid rgba(78,207,198,0.2)' }}>
                        <Shield size={40} color="#4ecfc6" />
                      </div>
                      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#c4aeff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        {lang === 'pt' ? 'Configurações do Santuário' : 'Sanctum Settings'}
                      </h2>
                    </div>

                    <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                      <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>{lang === 'pt' ? 'MODELO MÍSTICO' : 'MYSTIC MODEL'}</label>
                      <select
                        value={selectedModelId}
                        onChange={(e) => setSelectedModelId(e.target.value)}
                        style={{ width: '100%', padding: '0.7rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--teal)', outline: 'none' }}
                      >
                        {MODELS.map(m => <option key={m.id} value={m.id} style={{ background: '#0a0b1c' }}>{m.name}</option>)}
                      </select>

                      {/* Model Info Card */}
                      {(() => {
                        const m = MODELS.find(m => m.id === selectedModelId);
                        if (!m) return null;
                        return (
                          <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(196, 174, 255, 0.03)', border: '1px solid rgba(196, 174, 255, 0.1)', borderRadius: 6, fontSize: '0.85rem' }}>
                            <p style={{ color: 'var(--text-sec)', margin: '0 0 10px 0', lineHeight: 1.4 }}>{m.desc[lang]}</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                              <div>
                                <h4 style={{ fontSize: 9, color: '#4ecfc6', margin: '0 0 4px 0', textTransform: 'uppercase' }}>PROS</h4>
                                <p style={{ margin: 0, fontSize: 11, color: 'rgba(205,202,233,0.7)' }}>{m.pros[lang]}</p>
                              </div>
                              <div>
                                <h4 style={{ fontSize: 9, color: '#ff6b6b', margin: '0 0 4px 0', textTransform: 'uppercase' }}>CONS</h4>
                                <p style={{ margin: 0, fontSize: 11, color: 'rgba(205,202,233,0.7)' }}>{m.cons[lang]}</p>
                              </div>
                            </div>

                            <div style={{ fontSize: 10, color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                              <span>FREE: {m.free.rpm} · {m.free.rpd}</span>
                              <span style={{ color: '#c4aeff' }}>{m.pay}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
                      <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>GEMINI API KEY</label>
                      <input
                        type="password"
                        placeholder="sk-..."
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        style={{ width: '100%', padding: '0.7rem', background: 'rgba(0,0,0,0.4)', border: `1px solid ${apiError ? 'rgba(255,100,100,0.4)' : 'var(--border)'}`, borderRadius: 4, color: 'var(--teal)', outline: 'none' }}
                      />
                      {apiError && <p style={{ color: '#ff6b6b', fontSize: 11, marginTop: 4 }}>{apiError}</p>}
                    </div>

                    <div style={{ textAlign: 'left', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input
                        type="checkbox"
                        id="autoSave"
                        checked={autoSave}
                        onChange={(e) => setAutoSave(e.target.checked)}
                        style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--teal)' }}
                      />
                      <label htmlFor="autoSave" style={{ fontSize: 13, color: 'var(--text-sec)', cursor: 'pointer' }}>
                        {lang === 'pt' ? 'Habilitar Auto-Save (Function Calling)' : 'Enable Auto-Save (Function Calling)'}
                      </label>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <button
                        onClick={handleConfigureAuth}
                        disabled={isConfiguring}
                        style={{ padding: '0.8rem', background: 'rgba(78,207,198,0.1)', border: '1px solid var(--teal)', color: 'var(--teal)', borderRadius: 4, cursor: 'pointer', fontWeight: 700 }}
                      >
                        {isConfiguring ? '...' : (lang === 'pt' ? 'SALVAR ALTERAÇÕES' : 'SAVE CHANGES')}
                      </button>
                      <button
                        onClick={handleDeleteAPIKey}
                        style={{ padding: '0.6rem', background: 'transparent', border: '1px solid rgba(255,100,100,0.2)', color: 'rgba(255,100,100,0.6)', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                      >
                        {lang === 'pt' ? 'EXCLUIR CHAVE' : 'DELETE KEY'}
                      </button>
                    </div>

                    <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(205,202,233,0.1)' }}>
                      <button onClick={() => setShowBillingTutorial(true)} style={{ background: 'transparent', border: 'none', color: 'var(--teal)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>
                        {lang === 'pt' ? 'Tutorial: como limitar gasto a $0' : 'Tutorial: how to limit spend to $0'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <BillingModal isOpen={showBillingTutorial} onClose={() => setShowBillingTutorial(false)} lang={lang} />

      {/* Global Lore Modal */}
      <LoreModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
        onCancel={modal.onCancel}
        lang={lang}
      />
    </div>
  );
};

export default App;
