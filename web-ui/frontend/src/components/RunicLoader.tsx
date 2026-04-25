import React from 'react';

interface RunicLoaderProps {
    size?: number;
}

const RunicLoader: React.FC<RunicLoaderProps> = ({ size = 52 }) => {
    const rings = [
        { s: 0, d: '2.2s', c: 'rgba(78,207,198,0.8)', r: false },
        { s: size * 0.14, d: '1.5s', c: 'rgba(136,116,204,0.75)', r: true },
        { s: size * 0.32, d: '0.95s', c: '#c4aeff', r: false }
    ];

    return (
        <div style={{ position: 'relative', width: size, height: size }}>
            {rings.map((ring, i) => (
                <div
                    key={i}
                    style={{
                        position: 'absolute',
                        inset: ring.s,
                        borderRadius: '50%',
                        border: '1.5px solid transparent',
                        borderTopColor: ring.c,
                        borderRightColor: ring.r ? ring.c : 'transparent',
                        animation: `${ring.r ? 'orbitR' : 'orbit'} ${ring.d} linear infinite`
                    }}
                />
            ))}
            <div
                style={{
                    position: 'absolute',
                    inset: size * 0.42,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'gemPulse 1.6s ease-in-out infinite'
                }}
            >
                <div
                    style={{
                        width: size * 0.16,
                        height: size * 0.16,
                        background: '#00e8d8',
                        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                        boxShadow: '0 0 8px #00e8d8'
                    }}
                />
            </div>
        </div>
    );
};

export default RunicLoader;
