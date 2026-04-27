import React from 'react';
import RunicLoader from './RunicLoader';
interface RitualsViewProps {
    lang: string;
    setView: (v: 'chat' | 'wiki' | 'rituals') => void;
    setInputValue: (v: string) => void;
    setSelectedAgent: (a: any) => void;
    agents: any[];
    workflows: any[];
    handleSendMessage: (customMessage?: string, hidden?: boolean, files?: any[], clearHistory?: boolean) => void | Promise<void>;
}

const RitualsView: React.FC<RitualsViewProps> = ({ lang, setView, setInputValue, setSelectedAgent, agents, workflows, handleSendMessage }) => {
    const handleClick = (w: any) => {
        setSelectedAgent(w);
        const startPrompt = lang === 'pt'
            ? `SYSTEM: Ritual iniciado: ${w.name}. Por favor, apresente-se conforme seu propósito e peça o input inicial necessário ao usuário.`
            : `SYSTEM: Ritual started: ${w.name}. Please introduce yourself according to your purpose and ask the user for the necessary initial input.`;

        handleSendMessage(startPrompt, true);
        setView('chat');
    };

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2.5rem', gap: '1.2rem' }}>
            <RunicLoader size={64} />
            <div style={{ fontWeight: 600, fontSize: 18, color: '#4ecfc6', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 8 }}>
                {lang === 'pt' ? 'Câmara de Rituais' : 'Ritual Chamber'}
            </div>
            <img src="/assets/decoratives/rune-divider.svg" alt="" style={{ width: 300, opacity: 0.4 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, maxWidth: 500, width: '100%' }}>
                {workflows.map((w, i) => (
                    <div key={i} onClick={() => handleClick(w)} className="hud-panel shimmer-panel" style={{ borderRadius: 6, padding: '15px', cursor: 'pointer', transition: 'all 0.2s', opacity: 0.9 }}>
                        <div className="hi" style={{ zIndex: 2 }}>
                            <div style={{ fontWeight: 600, fontSize: 11, color: '#c4aeff', letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 6 }}>
                                {w.name}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                {w.description}
                            </div>
                            <div style={{ marginTop: 8, fontSize: 8, fontWeight: 600, letterSpacing: '0.12em', color: 'rgba(78,207,198,0.7)', border: '1px solid rgba(78,207,198,0.3)', padding: '2px 8px', borderRadius: 9999, display: 'inline-block', background: 'rgba(78,207,198,0.05)' }}>
                                {lang === 'pt' ? 'INICIAR RITUAL' : 'START RITUAL'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RitualsView;
