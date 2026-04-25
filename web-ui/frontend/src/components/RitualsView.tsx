import React from 'react';
import RunicLoader from './RunicLoader';

interface RitualsViewProps {
    lang: string;
}

const RitualsView: React.FC<RitualsViewProps> = ({ lang }) => {
    const workflows = [
        { pt: 'Registro de Sessão', en: 'Session Log', pt_d: 'Dump da sessão → Ingestão Universal.', en_d: 'Session dump → Universal Ingestion into Codex.' },
        { pt: 'Preparação de Sessão', en: 'Session Prep', pt_d: 'Auditoria matinal + roteiro dramático.', en_d: 'Morning audit + Weaver drama + Tactician.' },
        { pt: 'Gênese', en: 'Genesis', pt_d: 'Criação inicial do mundo e fundações.', en_d: 'Initial world creation and foundations.' },
        { pt: 'Conhecimento da Party', en: 'Party Intel', pt_d: 'Handout do que os heróis descobriram.', en_d: "Handout of the party's discoveries." },
    ];

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2.5rem', gap: '1.2rem' }}>
            <RunicLoader size={64} />
            <div style={{ fontWeight: 600, fontSize: 18, color: '#4ecfc6', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 8 }}>
                {lang === 'pt' ? 'Câmara de Rituais' : 'Ritual Chamber'}
            </div>
            <img src="/assets/decoratives/rune-divider.svg" alt="" style={{ width: 300, opacity: 0.4 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, maxWidth: 500, width: '100%' }}>
                {workflows.map((w, i) => (
                    <div key={i} className="hud-panel shimmer-panel" style={{ borderRadius: 6, padding: '15px', cursor: 'default' }}>
                        <div className="hi" style={{ position: 'relative', zIndex: 2 }}>
                            <div style={{ fontWeight: 600, fontSize: 11, color: '#c4aeff', letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 6 }}>
                                {lang === 'pt' ? w.pt : w.en}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                {lang === 'pt' ? w.pt_d : w.en_d}
                            </div>
                            <div style={{ marginTop: 8, fontSize: 8, fontWeight: 600, letterSpacing: '0.12em', color: 'rgba(78,207,198,0.38)', border: '1px solid rgba(78,207,198,0.15)', padding: '2px 8px', borderRadius: 9999, display: 'inline-block' }}>
                                {lang === 'pt' ? 'EM BREVE' : 'SOON'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RitualsView;
