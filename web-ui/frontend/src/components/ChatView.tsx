import React, { useRef, useEffect, useState } from 'react';
import { Shield, ScrollText, Paperclip, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import RunicLoader from './RunicLoader';

interface Message {
    role: 'user' | 'ai';
    content: string;
    hidden?: boolean;
    files?: Array<{ name: string; mime_type: string; data: string }>;
}

interface ChatViewProps {
    agent: any;
    messages: Message[];
    inputValue: string;
    setInputValue: (val: string) => void;
    handleSendMessage: (msg?: string, hidden?: boolean, files?: any[]) => void | Promise<void>;
    isTyping: boolean;
    lang: string;
    getAgentInfo: (id: string, lang: string) => { name: string; desc: string };
    onClearHistory: () => void;
    showAlert: (title: string, msg: string) => void;
}

const ChatView: React.FC<ChatViewProps> = ({
    agent,
    messages,
    inputValue,
    setInputValue,
    handleSendMessage,
    isTyping,
    lang,
    getAgentInfo,
    onClearHistory,
    showAlert
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [notify, setNotify] = useState(false);
    const [pendingFiles, setPendingFiles] = useState<Array<{ name: string; mime_type: string; data: string }>>([]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            Array.from(e.target.files).forEach(f => {
                if (!f.type.match('image.*') && !f.type.includes('pdf') && !f.type.includes('text') && !f.name.endsWith('.csv') && !f.name.endsWith('.md')) {
                    showAlert(
                        lang === 'pt' ? 'Grimório Incompatível' : 'Incompatible Tome',
                        lang === 'pt' ? `O arquivo ${f.name} não é suportado. Use imagens, PDF ou Texto legível.` : `File ${f.name} is not supported. Use images, PDF or Text.`
                    );
                    return;
                }
                const reader = new FileReader();
                reader.onload = (evt) => {
                    const b64 = (evt.target?.result as string)?.split(',')[1];
                    if (b64) {
                        setPendingFiles(prev => [...prev, { name: f.name, mime_type: f.type || 'text/plain', data: b64 }]);
                    }
                };
                reader.readAsDataURL(f);
            });
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeFile = (index: number) => {
        setPendingFiles(prev => prev.filter((_, i) => i !== index));
    };

    const onLocalSend = () => {
        handleSendMessage(undefined, false, pendingFiles);
        setPendingFiles([]);
    };

    useEffect(() => {
        if (isTyping) {
            // Simulate chime
        } else if (messages.length > 0 && messages[messages.length - 1].role === 'ai') {
            setNotify(true);
            const t = setTimeout(() => setNotify(false), 2000);
            return () => clearTimeout(t);
        }
    }, [isTyping, messages]);

    const agentInfo = agent ? getAgentInfo(agent.id, lang) : { name: '...', desc: '...' };

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
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, letterSpacing: '0.1em', color: '#4ecfc6', textTransform: 'uppercase' }}>
                            {lang === 'pt' ? 'Consultando' : 'Consulting'} {agentInfo.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                            {lang === 'pt' ? 'Fale, Mestre. O conselho aguarda sua voz.' : 'Speak, Master. The council awaits your command.'}
                        </div>
                    </div>

                    <button
                        onClick={onClearHistory}
                        title={lang === 'pt' ? 'Limpar Contexto: O agente esquecerá o que foi dito.' : 'Clear Context: The agent will forget what was said.'}
                        style={{
                            background: 'rgba(255,100,100,0.05)', border: '1px solid rgba(255,100,100,0.2)',
                            borderRadius: 4, padding: '4px 10px', color: 'rgba(255,100,100,0.6)',
                            fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,100,100,0.1)'; e.currentTarget.style.color = 'rgba(255,100,100,0.9)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,100,100,0.05)'; e.currentTarget.style.color = 'rgba(255,100,100,0.6)'; }}
                    >
                        <X size={12} />
                        {lang === 'pt' ? 'RESETAR CONTEXTO' : 'RESET CONTEXT'}
                    </button>

                    {notify && (
                        <div style={{ marginLeft: 12, animation: 'gemPulse 0.4s ease-in-out infinite' }}>
                            <img src="/assets/decoratives/gem.svg" width="16" height="18" alt="" />
                        </div>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 12 }} className="custom-scroll">
                {messages.length === 0 && (
                    <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 2rem' }}>
                        <ScrollText size={48} style={{ marginBottom: '1.5rem', opacity: 0.2 }} />
                        <h3 style={{ fontSize: '1rem', color: '#c4aeff', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {agentInfo.name}
                        </h3>
                        <p style={{ fontSize: '0.9rem', lineHeight: 1.6, opacity: 0.6, maxWidth: '400px' }}>
                            {agentInfo.desc}
                        </p>
                    </div>
                )}
                {messages.filter(m => !m.hidden).map((m, i) => (
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
                        {m.files && m.files.length > 0 && (
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                                {m.files.map((f, j) => (
                                    <div key={j} style={{ fontSize: 10, background: 'rgba(78,207,198,0.1)', color: '#4ecfc6', padding: '2px 6px', borderRadius: 4 }}>
                                        📎 {f.name}
                                    </div>
                                ))}
                            </div>
                        )}
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
            {pendingFiles.length > 0 && (
                <div style={{ display: 'flex', gap: 8, padding: '0 14px', flexWrap: 'wrap', marginTop: 8 }}>
                    {pendingFiles.map((f, i) => (
                        <div key={i} style={{ fontSize: 11, background: 'rgba(78,207,198,0.1)', color: '#4ecfc6', padding: '4px 8px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 6, border: '1px solid rgba(78,207,198,0.3)' }}>
                            <span style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                            <button onClick={() => removeFile(i)} style={{ background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
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
                    <button
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--teal)', opacity: 0.6, display: 'flex', alignItems: 'center' }}
                        onClick={() => fileInputRef.current?.click()}
                        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
                    >
                        <Paperclip size={18} />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        multiple
                        accept="image/*,application/pdf,text/plain,text/markdown,text/csv"
                        onChange={handleFileSelect}
                    />
                    <input
                        type="text"
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: 'var(--text-main)',
                            fontFamily: 'inherit',
                            fontSize: 13,
                            opacity: isTyping ? 0.5 : 1
                        }}
                        placeholder={isTyping ? (lang === 'pt' ? 'O conselho está deliberando...' : 'The council is deliberating...') : `${lang === 'pt' ? 'Pergunte ao' : 'Ask the'} ${agentInfo.name}…`}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !isTyping && onLocalSend()}
                        disabled={isTyping}
                    />
                    <button
                        onClick={onLocalSend}
                        disabled={isTyping}
                        style={{
                            background: 'rgba(78,207,198,0.1)',
                            border: '1px solid rgba(78,207,198,0.4)',
                            color: '#4ecfc6',
                            padding: '7px 16px',
                            borderRadius: 4,
                            cursor: isTyping ? 'default' : 'pointer',
                            fontSize: 12,
                            fontWeight: 600,
                            letterSpacing: '0.06em',
                            transition: 'all 0.15s',
                            whiteSpace: 'nowrap',
                            opacity: isTyping ? 0.5 : 1
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
