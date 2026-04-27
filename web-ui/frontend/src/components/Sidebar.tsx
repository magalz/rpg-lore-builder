import React, { useState } from 'react';
import {
    MessageSquare,
    Book,
    Sword,
    Shield
} from 'lucide-react';

interface SidebarProps {
    view: 'chat' | 'wiki' | 'rituals';
    setView: (view: 'chat' | 'wiki' | 'rituals') => void;
    agents: any[];
    selectedAgent: any;
    setSelectedAgent: (agent: any) => void;
    lang: string;
    onLangToggle: () => void;
    getAgentInfo: (id: string, lang: string) => { name: string; desc: string };
    onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    view,
    setView,
    agents,
    selectedAgent,
    setSelectedAgent,
    lang,
    getAgentInfo,
    onOpenSettings
}) => {
    const [hov, setHov] = useState<string | null>(null);

    const navItems = [
        { id: 'chat', icon: MessageSquare, pt: 'Gabinete do Mestre', en: "Master's Sanctum" },
        { id: 'wiki', icon: Book, pt: 'Codex de Lore', en: 'Lore Codex' },
        { id: 'rituals', icon: Sword, pt: 'Rituais', en: 'Rituals' }
    ];

    return (
        <aside className="hud-panel shimmer-panel" style={{
            width: 248,
            display: 'flex',
            flexDirection: 'column',
            padding: '16px 14px',
            flexShrink: 0,
            borderRadius: 0,
            borderTop: 'none',
            borderBottom: 'none',
            borderLeft: 'none',
            height: '100%',
            overflow: 'hidden'
        }}>
            <div className="hi" style={{ display: 'flex', flexDirection: 'column', height: '100%', zIndex: 2 }}>
                {/* Logo */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                    <img
                        src="/assets/logo.png"
                        alt="RPG Lore Builder"
                        style={{ height: 120, objectFit: 'contain', filter: 'drop-shadow(0 0 10px rgba(78,207,198,0.35))' }}
                    />
                </div>

                <div className="hud-label">{lang === 'pt' ? 'Navegação' : 'Navigation'}</div>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 14 }}>
                    {navItems.map((n) => {
                        const active = view === n.id;
                        const Icon = n.icon;
                        return (
                            <div
                                key={n.id}
                                onClick={() => setView(n.id as any)}
                                onMouseEnter={() => setHov(n.id)}
                                onMouseLeave={() => setHov(null)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    padding: '9px 10px',
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                    color: active ? '#4ecfc6' : hov === n.id ? 'rgba(196,174,255,0.7)' : 'var(--text-muted)',
                                    background: active ? 'rgba(78,207,198,0.07)' : hov === n.id ? 'rgba(196,174,255,0.04)' : 'transparent',
                                    borderLeft: active ? '2px solid rgba(78,207,198,0.7)' : '2px solid transparent',
                                    fontSize: 13,
                                    transition: 'all 0.15s',
                                    animation: active ? 'navNeon 2.5s ease-in-out infinite' : 'none',
                                }}
                            >
                                <Icon size={16} color={active ? '#4ecfc6' : hov === n.id ? 'rgba(196,174,255,0.6)' : 'rgba(205,202,233,0.35)'} />
                                {lang === 'pt' ? n.pt : n.en}
                            </div>
                        );
                    })}
                </nav>

                <img
                    src="/assets/decoratives/rune-divider.svg"
                    alt=""
                    style={{ width: '100%', opacity: 0.45, marginBottom: 14 }}
                />

                <div className="hud-label">{lang === 'pt' ? 'Conselho' : 'Council'}</div>
                <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>

                    {agents.map((agent) => {
                        const active = selectedAgent?.id === agent.id;
                        const info = getAgentInfo(agent.id, lang);
                        return (
                            <div
                                key={agent.id}
                                onClick={() => {
                                    setSelectedAgent(agent);
                                    if (view !== 'chat') setView('chat');
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '7px 10px',
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                    color: active ? '#c4aeff' : 'var(--text-muted)',
                                    background: active ? 'rgba(107,79,240,0.1)' : 'transparent',
                                    fontSize: 13,
                                    transition: 'all 0.15s'
                                }}
                            >
                                <Shield size={13} color={active ? '#c4aeff' : 'rgba(205,202,233,0.28)'} />
                                {info.name}
                            </div>
                        );
                    })}
                </div>

                {/* Fixed bottom controls */}
                <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(78,207,198,0.1)' }}>
                    <div
                        onClick={onOpenSettings}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 4, cursor: 'pointer',
                            color: 'var(--text-muted)', fontSize: 13, transition: 'all 0.15s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#c4aeff'; e.currentTarget.style.background = 'rgba(107,79,240,0.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                    >
                        <Shield size={13} color="rgba(205,202,233,0.28)" />
                        {lang === 'pt' ? 'Configurações' : 'Settings'}
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
