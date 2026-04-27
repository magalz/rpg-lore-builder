import React from 'react';

declare global {
    interface Window {
        require: any;
    }
}

const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null };

interface TitlebarProps {
    lang: string;
}

const Titlebar: React.FC<TitlebarProps> = ({ lang }) => {
    const handleAction = (action: string) => {
        if (ipcRenderer) ipcRenderer.send(action);
    };

    return (
        <div style={{
            height: '32px',
            background: 'rgba(8,6,22,0.95)',
            borderBottom: '1px solid rgba(78,207,198,0.18)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            userSelect: 'none',
            position: 'relative',
            WebkitAppRegion: 'drag'
        } as any}>
            {/* Scanline overlay effect moved to CSS or main.css usually, but can be simulated */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 3px)'
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', zIndex: 1 }}>
                <img src="/assets/logo.png" alt="RPG Lore Builder" style={{ height: '18px', width: '18px', objectFit: 'contain' }} />
                <span style={{ fontFamily: 'Avenir Next LT Pro Cn, sans-serif', fontWeight: 600, fontSize: '11px', letterSpacing: '0.1em', color: 'rgba(196,174,255,0.7)', textTransform: 'uppercase' }}>
                    {lang === 'pt' ? 'LORE SANCTUM' : 'LORE SANCTUM'}
                </span>
            </div>

            <div style={{ flex: 1 }} />

            <span style={{ fontSize: '9px', letterSpacing: '0.08em', color: 'rgba(136,116,204,0.5)', zIndex: 1, marginRight: '12px', fontFamily: 'monospace' }}>
                v2.0.0
            </span>

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', zIndex: 1, WebkitAppRegion: 'no-drag' } as any}>
                <button
                    onClick={() => handleAction('window-min')}
                    style={{ width: '12px', height: '12px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(196,174,255,0.4)', borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(196,174,255,0.6)', transition: 'all 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    title="Minimize"
                />
                <button
                    onClick={() => handleAction('window-max')}
                    style={{ width: '12px', height: '12px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(78,207,198,0.4)', borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(78,207,198,0.6)', transition: 'all 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    title="Maximize"
                />
                <button
                    onClick={() => handleAction('window-close')}
                    style={{ width: '12px', height: '12px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(200,50,50,0.7)', borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(200,50,50,0.9)', transition: 'all 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    title="Close"
                />
            </div>
        </div>
    );
};

export default Titlebar;
