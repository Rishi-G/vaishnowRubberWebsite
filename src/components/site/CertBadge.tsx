import React from 'react'

/**
 * Animated ISO certification mark, drawn as SVG so it stays sharp and can move:
 * the 9001 badge carries a slowly turning "CERTIFIED COMPANY" ring, the 14001 badge
 * draws its globe once. Animations live in globals.css and stop for reduced motion.
 */
export function CertBadge({ kind, className = '' }: { kind: '9001' | '14001'; className?: string }) {
  const id = `ring-${kind}`
  const ink = '#1556a8'
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label={`ISO ${kind}:2015 certified`}>
      <circle cx="100" cy="100" r="97" fill="#fff" stroke={ink} strokeWidth="3" />
      <circle cx="100" cy="100" r="66" fill={ink} />
      {kind === '9001' && (
        <>
          <defs>
            <path id={id} d="M100 100 m-81 0 a81 81 0 1 1 162 0 a81 81 0 1 1 -162 0" />
          </defs>
          <g className="badge-spin" style={{ transformOrigin: '100px 100px' }}>
            <text fill={ink} fontSize="17" fontWeight="800" fontFamily="system-ui, sans-serif">
              <textPath href={`#${id}`} textLength="500" lengthAdjust="spacing">CERTIFIED COMPANY • CERTIFIED COMPANY •</textPath>
            </text>
          </g>
        </>
      )}
      {kind === '14001' && (
        <g className="draw-in" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.85">
          <circle cx="100" cy="100" r="58" pathLength={1} />
          <ellipse cx="100" cy="100" rx="24" ry="58" pathLength={1} />
          <ellipse cx="100" cy="100" rx="46" ry="58" pathLength={1} />
          <path d="M42 100 H158 M52 72 H148 M52 128 H148" pathLength={1} />
        </g>
      )}
      <text x="100" y={kind === '9001' ? 112 : 108} textAnchor="middle" fill="#fff" fontSize="42" fontWeight="900" fontFamily="Georgia, 'Times New Roman', serif">ISO</text>
      <text x="100" y="140" textAnchor="middle" fill="#fff" fontSize="15" fontWeight="600" fontFamily="system-ui, sans-serif">{kind}:2015</text>
    </svg>
  )
}

export const certKind = (name: string): '9001' | '14001' | null => (name.includes('9001') ? '9001' : name.includes('14001') ? '14001' : null)
