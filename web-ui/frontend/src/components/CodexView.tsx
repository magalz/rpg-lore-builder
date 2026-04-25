import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface WikiNode {
    name: string;
    path: string;
    type: 'file' | 'directory';
    children?: WikiNode[];
}

interface CodexViewProps {
    wikiNodes: WikiNode[];
    selectedWikiContent: string | null;
    loadWikiFile: (path: string) => void;
    lang: string;
}

const TreeNode = ({ node, level, onSelect }: { node: WikiNode, level: number, onSelect: (path: string) => void }) => {
    const [open, setOpen] = useState(level === 0);
    const isDir = node.type === 'directory';

    return (
        <div>
            <div
                onClick={() => isDir ? setOpen(!open) : onSelect(node.path)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: `5px 5px 5px ${level * 14 + 8}px`,
                    cursor: 'pointer',
                    fontSize: 12,
                    color: isDir ? 'rgba(78,207,198,0.65)' : 'var(--text-muted)',
                    borderRadius: 3,
                    transition: 'all 0.12s'
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.color = '#4ecfc6';
                    e.currentTarget.style.background = 'rgba(78,207,198,0.05)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.color = isDir ? 'rgba(78,207,198,0.65)' : 'var(--text-muted)';
                    e.currentTarget.style.background = 'transparent';
                }}
            >
                <span style={{ fontSize: 8, width: 10, color: '#4ecfc6', flexShrink: 0, opacity: 0.65 }}>
                    {isDir ? (open ? '▼' : '▶') : '◈'}
                </span>
                {node.name}
            </div>
            {isDir && open && node.children?.map(c => (
                <TreeNode key={c.path} node={c} level={level + 1} onSelect={onSelect} />
            ))}
        </div>
    );
};

const CodexView: React.FC<CodexViewProps> = ({ wikiNodes, selectedWikiContent, loadWikiFile, lang }) => {
    return (
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '220px 1fr', overflow: 'hidden' }}>
            <div className="hud-panel" style={{
                borderRadius: 0,
                borderTop: 'none',
                borderBottom: 'none',
                borderLeft: 'none',
                padding: '14px 10px',
                overflowY: 'auto'
            }}>
                <div className="hi" style={{ position: 'relative', zIndex: 2 }}>
                    <div className="hud-label">{lang === 'pt' ? 'Índice' : 'Index'}</div>
                    {wikiNodes.map(node => (
                        <TreeNode key={node.path} node={node} level={0} onSelect={loadWikiFile} />
                    ))}
                </div>
            </div>
            <div style={{ padding: '24px 32px', overflowY: 'auto', lineHeight: 1.85, color: 'rgba(205,202,233,0.72)', fontSize: 13 }}>
                {selectedWikiContent ? (
                    <div className="markdown-body">
                        <ReactMarkdown>{selectedWikiContent}</ReactMarkdown>
                    </div>
                ) : (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, opacity: 0.35 }}>
                        <img src="/assets/decoratives/compass-rose.svg" width="64" height="64" alt="" />
                        <span style={{ fontSize: 12, letterSpacing: '0.08em' }}>
                            {lang === 'pt' ? 'Selecione um pergaminho' : 'Select a scroll'}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CodexView;
