import React, { useRef, useEffect, useState } from 'react';
import { Shield, ScrollText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import RunicLoader from './RunicLoader';

interface Message {
    role: 'user' | 'ai';
    content: string;
}

interface ChatViewProps {
    selectedAgent: any;
    messages: Message[];
    inputValue: string;
    setInputValue: (val: string) => void;
    handleSendMessage: () => void;
    isTyping: boolean;
    lang: string;
    getAgentInfo: (id: string, lang: string) => { name: string; desc: string };
}

const ChatView: React.FC<ChatViewProps> = ({
    selectedAgent,
    messages,
    inputValue,
    setInputValue,
    handleSendMessage,
    isTyping,
    lang,
    getAgentInfo
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [notify, setNotify] = useState(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    useEffect(() => {
        if (isTyping) {
            // Simulate chime or notification gem if needed
        } else if (messages.length > 0 && messages[messages.length - 1].role === 'ai') {
            setNotify(true);
            const t = setTimeout(() => setNotify(false), 2000);
            return () => clearTimeout(t);
        }
    }, [isTyping, messages]);

    const agentInfo = selectedAgent ? getAgentInfo(selectedAgent.id, lang) : { name: '', desc: '' };

    return (
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', padding: '18px 26px', overflow: 'hidden' }}>
            {/* Agent Header */}
            <div className="hud-panel" style={{
                borderRadius: 4,
                padding: '11px 16px',
                marginBottom: 14,
                flexShrink: 0,
                borderLeft: '2px solid rgba(78,207,198,0.45)',
                animation: 'neonGlow 3s ease-in-out infinite'
            }}>
                <div className="hi" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Shield size={20} color="#4ecfc6" />
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 13, letterSpacing: '0.1em', color: '#4ecfc6', textTransform: 'uppercase' }}>
                            {lang === 'pt' ? 'Consultando' : 'Consulting'} {agentInfo.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                            {lang === 'pt' ? 'Fale, Mestre. O conselho aguarda sua voz.' : 'Speak, Master. The council awaits your command.'}
                        </div>
                    </div>
                    {notify && (
                        <div style={{ marginLeft: 'auto', animation: 'gemPulse 0.4s ease-in-out infinite' }}>
                            <img src="/assets/decoratives/gem.svg" width="16" height="18" alt="" />
                        </div>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 12 }}>
                {messages.length === 0 && (
                    <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-muted)', opacity: 0.3 }}>
                        <ScrollText size={48} style={{ marginBottom: '1rem' }} />
                        <p>{lang === 'pt' ? 'O conselho aguarda...' : 'The council awaits...'}</p>
                    </div>
                )}
                {messages.map((m, i) => (
                    <div
                        key={i}
                        style={{
                            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '82%',
                            padding: '12px 16px',
                            borderRadius: 6,
                            fontSize: 13,
                            lineHeight: 1.75,
                            animation: 'runeIn 0.28s ease',
                            ...(m.role === 'user' ? {
                                background: 'rgba(107,79,240,0.09)',
                                borderRight: '2px solid rgba(78,207,198,0.5)',
                                color: 'var(--text-main)',
                            } : {
                                background: 'rgba(13,10,46,0.6)',
                                borderLeft: '2px solid rgba(136,116,204,0.4)',
                                color: 'rgba(205,202,233,0.82)',
                            }),
                        }}
                    >
                        <div className="markdown-content"><ReactMarkdown>{m.content}</ReactMarkdown></div>
                    </div>
                ))}
                {isTyping && (
                    <div style={{
                        alignSelf: 'flex-start',
                        padding: '16px 20px',
                        borderRadius: 6,
                        background: 'rgba(13,10,46,0.55)',
                        borderLeft: '2px solid rgba(78,207,198,0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 10
                    }}>
                        <RunicLoader size={52} />
                        <div style={{ display: 'flex', gap: 5 }}>
                            {[0, 0.2, 0.4].map((d, i) => (
                                <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#7b68e8', animation: `dotPulse 1.2s ${d}s infinite` }} />
                            ))}
                        </div>
                        <div style={{ fontSize: 11, color: 'rgba(78,207,198,0.55)', letterSpacing: '0.08em' }}>
                            {lang === 'pt' ? 'Consultando o Conselho…' : 'Consulting the Council…'}
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="hud-panel" style={{
                borderRadius: 6,
                padding: '10px 14px',
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                flexShrink: 0,
                marginTop: 4,
                animation: 'inputBreathe 3s ease-in-out infinite'
            }}>
                <div className="hi" style={{ display: 'flex', gap: 10, alignItems: 'center', width: '100%' }}>
                    <img src="/assets/decoratives/gem.svg" alt="" style={{ width: 14, height: 16, opacity: 0.5, flexShrink: 0 }} />
                    <input
                        type="text"
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: 'var(--text-main)',
                            fontFamily: 'inherit',
                            fontSize: 13
                        }}
                        placeholder={`${lang === 'pt' ? 'Pergunte ao' : 'Ask the'} ${agentInfo.name}…`}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button
                        onClick={handleSendMessage}
                        style={{
                            background: 'rgba(78,207,198,0.1)',
                            border: '1px solid rgba(78,207,198,0.4)',
                            color: '#4ecfc6',
                            padding: '7px 16px',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: 600,
                            letterSpacing: '0.06em',
                            transition: 'all 0.15s',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {lang === 'pt' ? 'ENVIAR' : 'SEND'} ›
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatView;
