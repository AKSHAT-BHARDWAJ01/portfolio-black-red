// Conceptual product illustrations (not screenshots). Drawn on a 640×400 canvas so they scale
// with the card; the HTML badge stays legible at any size.

const MONO = { fontFamily: "'JetBrains Mono', monospace" }
const QR = [[1, 1, 1, 0, 1], [1, 0, 1, 1, 0], [1, 1, 1, 0, 1], [0, 1, 0, 1, 1], [1, 0, 1, 1, 1]]

function Health() {
  return (
    <svg viewBox="0 0 640 400" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="hc-glow" cx=".15" cy=".9" r=".7"><stop offset="0" stopColor="#E53945" stopOpacity=".22" /><stop offset="1" stopColor="#E53945" stopOpacity="0" /></radialGradient>
        <filter id="hc-blur"><feGaussianBlur stdDeviation="3" /></filter>
      </defs>
      <rect width="640" height="400" fill="url(#hc-glow)" />
      {Array.from({ length: 8 }, (_, i) => <rect key={i} y={i * 50} width="640" height="1" fill="#fff" opacity=".03" />)}
      <rect x="36" y="56" width="1" height="92" fill="#E53945" opacity=".35" />
      {['Report uploaded', 'AI summary', 'Shared via QR'].map((t, i) => (
        <g key={t}>
          <circle cx="36.5" cy={52.5 + i * 46} r="4.5" fill={i < 2 ? '#E53945' : 'none'} stroke="#E53945" />
          <text x="54" y={57 + i * 46} fontSize="12" fill="#A3A3AD" style={MONO}>{t}</text>
        </g>
      ))}
      <rect x="292" y="32" width="316" height="226" rx="10" fill="#08090B" fillOpacity=".62" stroke="#fff" strokeOpacity=".13" />
      <text x="312" y="60" fontSize="11" letterSpacing="1.5" fill="#A3A3AD" style={MONO}>MEDICAL REPORT · SAMPLE</text>
      <circle cx="327" cy="93" r="15" fill="#C42B36" opacity=".5" />
      <rect x="352" y="82" width="110" height="6" rx="3" fill="#fff" opacity=".16" />
      <rect x="352" y="96" width="70" height="6" rx="3" fill="#fff" opacity=".1" />
      {[276, 276, 168].map((w, i) => <rect key={i} x="312" y={128 + i * 16} width={w} height="6" rx="3" fill="#fff" opacity=".13" />)}
      <rect x="312" y="184" width="276" height="40" rx="8" fill="#FF8A8F" fillOpacity=".07" stroke="#FF8A8F" strokeOpacity=".35" />
      <text x="324" y="208" fontSize="12" fill="#FF8A8F" style={MONO}>AI observation · illustrative</text>
      {QR.flatMap((row, y) => row.map((v, x) => v ? <rect key={`${x}-${y}`} x={538 + x * 11} y={270 + y * 11} width="9" height="9" rx="1.5" fill="#F5F3F1" opacity=".85" /> : null))}
      <text x="520" y="346" fontSize="11" fill="#A3A3AD" style={MONO}>share via QR</text>
      <g transform="translate(24 300)">
        <polyline points="0,30 120,30 150,6 182,54 214,30 330,30 350,22 372,38 392,30 470,30" fill="none" stroke="#E53945" strokeWidth="5" opacity=".5" filter="url(#hc-blur)" />
        <polyline points="0,30 120,30 150,6 182,54 214,30 330,30 350,22 372,38 392,30 470,30" fill="none" stroke="#E53945" strokeWidth="2" strokeLinejoin="round" />
      </g>
    </svg>
  )
}

function Task() {
  const C = 2 * Math.PI * 34
  return (
    <svg viewBox="0 0 640 400" preserveAspectRatio="xMidYMid slice">
      <defs><radialGradient id="tf-glow" cx=".85" cy=".2" r=".7"><stop offset="0" stopColor="#FF4B55" stopOpacity=".22" /><stop offset="1" stopColor="#FF4B55" stopOpacity="0" /></radialGradient></defs>
      <rect width="640" height="400" fill="url(#tf-glow)" />
      {([['TO DO', 3], ['IN PROGRESS', 2], ['DONE', 4]] as const).map(([label, n], c) => {
        const x = 28 + c * 186
        return (
          <g key={label}>
            <rect x={x} y="28" width="172" height="260" rx="10" fill="#fff" fillOpacity=".025" stroke="#fff" strokeOpacity=".08" />
            <text x={x + 12} y="50" fontSize="11" letterSpacing="1.5" fill="#A3A3AD" style={MONO}>{label}</text>
            {Array.from({ length: n }, (_, i) => (
              <g key={i}>
                <rect x={x + 10} y={72 + i * 50} width="152" height="40" rx="8" fill="#fff" fillOpacity=".045" stroke="#fff" strokeOpacity=".13" />
                <rect x={x + 10} y={72 + i * 50} width="3" height="40" fill={['#FF4B55', '#F0B8B0', '#FF8A8F'][i % 3]} />
                <rect x={x + 24} y={82 + i * 50} width={100 - i * 10} height="5" rx="2.5" fill="#fff" opacity=".2" />
                <rect x={x + 24} y={94 + i * 50} width="60" height="5" rx="2.5" fill="#fff" opacity=".1" />
              </g>
            ))}
          </g>
        )
      })}
      <rect x="24" y="306" width="140" height="10" rx="5" fill="#FF4B55" />
      <rect x="164" y="306" width="84" height="10" fill="#F0B8B0" />
      <rect x="248" y="306" width="36" height="10" rx="5" fill="#FF8A8F" />
      <text x="24" y="336" fontSize="11" fill="#A3A3AD" style={MONO}>status distribution · illustrative</text>
      <circle cx="572" cy="334" r="34" fill="none" stroke="#fff" strokeOpacity=".08" strokeWidth="8" />
      <circle cx="572" cy="334" r="34" fill="none" stroke="#FF4B55" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${C * 0.72} ${C}`} transform="rotate(-90 572 334)" />
      <text x="572" y="337" fontSize="9" textAnchor="middle" fill="#A3A3AD" style={MONO}>Completion</text>
    </svg>
  )
}

function Finance() {
  const C = 2 * Math.PI * 45
  const cats: [string, number][] = [['#E53945', 0.35], ['#9F303B', 0.3], ['#F0B8B0', 0.2], ['#FF8A8F', 0.15]]
  let acc = 0
  return (
    <svg viewBox="0 0 640 400" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="br-glow" cx=".5" cy=".9" r=".7"><stop offset="0" stopColor="#F0B8B0" stopOpacity=".18" /><stop offset="1" stopColor="#F0B8B0" stopOpacity="0" /></radialGradient>
        <linearGradient id="br-bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FF4B55" /><stop offset="1" stopColor="#FF4B55" stopOpacity=".1" /></linearGradient>
        <filter id="br-blur"><feGaussianBlur stdDeviation="3" /></filter>
      </defs>
      <rect width="640" height="400" fill="url(#br-glow)" />
      {[40, 62, 48, 78, 55, 88, 70].map((h, i) => <rect key={i} x={40 + i * 58} y={330 - h * 2.3} width="40" height={h * 2.3} rx="4" fill="url(#br-bar)" />)}
      <g transform="translate(40 120)">
        <path d="M0 150 L58 118 L116 160 L174 96 L232 118 L290 56 L348 76" fill="none" stroke="#F0B8B0" strokeWidth="6" opacity=".45" filter="url(#br-blur)" />
        <path d="M0 150 L58 118 L116 160 L174 96 L232 118 L290 56 L348 76" fill="none" stroke="#F0B8B0" strokeWidth="2.5" strokeLinejoin="round" />
      </g>
      <g transform="rotate(-90 539 95)">
        {cats.map(([c, f]) => { const seg = <circle key={c} cx="539" cy="95" r="45" fill="none" stroke={c} strokeWidth="16" strokeDasharray={`${C * f - 3} ${C}`} strokeDashoffset={-C * acc} opacity=".9" />; acc += f; return seg })}
      </g>
      <text x="470" y="168" fontSize="11" fill="#A3A3AD" style={MONO}>categories · illustrative</text>
      <rect x="448" y="196" width="168" height="86" rx="10" fill="#08090B" fillOpacity=".62" stroke="#fff" strokeOpacity=".13" />
      <text x="460" y="216" fontSize="9" letterSpacing="1.2" fill="#A3A3AD" style={MONO}>INSIGHT · ILLUSTRATIVE</text>
      <rect x="460" y="232" width="140" height="6" rx="3" fill="#fff" opacity=".16" />
      <rect x="460" y="248" width="108" height="6" rx="3" fill="#fff" opacity=".12" />
      <rect x="460" y="264" width="70" height="6" rx="3" fill="#F0B8B0" opacity=".5" />
      <text x="40" y="352" fontSize="11" fill="#A3A3AD" style={MONO}>income vs spending · illustrative</text>
    </svg>
  )
}

function Wiki() {
  return (
    <svg viewBox="0 0 640 400" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="wb-glow" cx=".8" cy=".8" r=".7"><stop offset="0" stopColor="#C42B36" stopOpacity=".22" /><stop offset="1" stopColor="#C42B36" stopOpacity="0" /></radialGradient>
        <linearGradient id="wb-img"><stop offset="0" stopColor="#C42B36" stopOpacity=".5" /><stop offset="1" stopColor="#9F303B" stopOpacity=".4" /></linearGradient>
      </defs>
      <rect width="640" height="400" fill="url(#wb-glow)" />
      <text x="32" y="42" fontSize="11" letterSpacing="1.5" fill="#A3A3AD" style={MONO}>ARTICLE</text>
      <rect x="32" y="54" width="330" height="20" rx="5" fill="#fff" opacity=".22" />
      <rect x="32" y="82" width="200" height="12" rx="4" fill="#fff" opacity=".12" />
      <rect x="32" y="112" width="330" height="120" rx="10" fill="url(#wb-img)" stroke="#fff" strokeOpacity=".13" />
      <path d="M60 218 L120 174 L160 204 L200 164 L290 218" fill="none" stroke="#F5F3F1" strokeOpacity=".5" strokeWidth="1.5" />
      {[330, 250, 330, 250].map((w, i) => <rect key={i} x="32" y={252 + i * 16} width={w} height="6" rx="3" fill="#fff" opacity=".13" />)}
      <rect x="396" y="60" width="212" height="64" rx="32" fill="#08090B" fillOpacity=".62" stroke="#fff" strokeOpacity=".13" />
      <circle cx="428" cy="92" r="20" fill="#F5F3F1" />
      <path d="M423 84 v16 l13 -8z" fill="#08090B" />
      {[10, 22, 30, 18, 34, 12, 26, 16, 8].map((h, i) => <rect key={i} x={466 + i * 15} y={92 - h / 2} width="6" height={h} rx="3" fill={i % 2 ? '#C42B36' : '#9F303B'} />)}
      <text x="408" y="148" fontSize="11" fill="#A3A3AD" style={MONO}>Text-to-speech</text>
      <text x="380" y="330" fontSize="11" fill="#A3A3AD" style={MONO}>assistive navigation</text>
      <circle cx="580" cy="324" r="28" fill="#F5F3F1" />
      <g transform="translate(568 312)"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="#08090B" /><path d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12" fill="none" stroke="#08090B" strokeWidth="1.6" strokeLinecap="round" /></g>
    </svg>
  )
}

const ART: Record<string, () => React.JSX.Element> = { 'healthcare-ai': Health, taskflow: Task, 'burry-ai': Finance, webopedia: Wiki }

export function ProjectVisual({ slug }: { slug: string }) {
  const Art = ART[slug]
  return (
    <div className="pv" aria-hidden>
      <Art />
      <span className="illus-badge">Conceptual illustration · not a screenshot</span>
    </div>
  )
}
