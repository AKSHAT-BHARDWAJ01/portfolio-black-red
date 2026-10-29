import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// The nerve line: one organic SVG thread that runs down the page from Experience to Contact.
// Geometry is measured from the content itself — every element marked `data-node="gl|gr|el|er"`
// (gutter-left, gutter-right, element-left edge, element-right edge) becomes a node, and the spine
// travels between consecutive nodes. It lives in <main> beneath all text (sections are transparent,
// z-index above their backgrounds is avoided), is absolutely positioned (never affects layout) and
// is redrawn only when the measured geometry actually changes.

type Pt = { x: number; y: number; color: string }
type Geo = { w: number; h: number; pts: Pt[]; segs: string[]; twigs: { d: string; y: number }[] }

const offsetBox = (el: HTMLElement, root: HTMLElement) => {
  // offset* ignores transforms, so reveal offsets and card tilt can't skew the measurement.
  let x = 0, y = 0
  for (let cur: HTMLElement | null = el; cur && cur !== root; cur = cur.offsetParent as HTMLElement | null) { x += cur.offsetLeft; y += cur.offsetTop }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight }
}

const bez = (p0: number, p1: number, p2: number, p3: number, t: number) => {
  const u = 1 - t
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3
}

function measure(root: HTMLElement): Geo {
  const w = root.offsetWidth, h = root.offsetHeight
  const g = w < 768 ? 24 : w * 0.06
  const narrow = w < 1024
  const xl = g * 0.5, xr = w - g * 0.5
  const amp = Math.min(g * 0.3, 20)
  const pts: Pt[] = Array.from(root.querySelectorAll<HTMLElement>('[data-node]')).map((el) => {
    const b = offsetBox(el, root)
    let side = el.dataset.node!
    if (narrow) side = side === 'gr' ? 'gl' : side === 'er' ? 'el' : side
    const x = side === 'gl' ? xl : side === 'gr' ? xr : side === 'el' ? b.x : b.x + b.w
    return { x: Math.round(x), y: Math.round(b.y + b.h / 2), color: el.dataset.accent ?? '#8982ff' }
  })
  const segs: string[] = []
  const twigs: Geo['twigs'] = []
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1]
    const sgn = i % 2 ? 1 : -1
    const xm = (a.x + b.x) / 2 + sgn * amp, ym = (a.y + b.y) / 2
    // Leg A ends with a horizontal tangent at the midpoint, so any sideways travel happens in the gap between blocks.
    const c1y = a.y + 0.7 * (ym - a.y), c2x = (a.x + xm) / 2
    segs.push(`M${a.x} ${a.y} C${a.x} ${c1y} ${c2x} ${ym} ${xm} ${ym} S${b.x} ${ym + 0.3 * (b.y - ym)} ${b.x} ${b.y}`)
    if (w >= 768) {
      // A short twig off the first leg, curling toward the nearer page edge.
      const t = 0.42
      const tx = bez(a.x, a.x, c2x, xm, t), ty = bez(a.y, c1y, ym, ym, t)
      const dir = tx < w / 2 ? -1 : 1, L = Math.min(g * 0.42, 38)
      twigs.push({ d: `M${tx.toFixed(1)} ${ty.toFixed(1)} q${dir * L * 0.15} ${-L * 0.55} ${dir * L * 0.7} ${-L * 0.85}`, y: ty })
    }
  }
  return { w, h, pts, segs, twigs }
}

export function NerveLine() {
  const svg = useRef<SVGSVGElement>(null)
  const [geo, setGeo] = useState<Geo | null>(null)
  const sig = useRef('')

  // Measure on mount, on resize of <main>, and once fonts settle (they change text heights).
  useLayoutEffect(() => {
    const root = svg.current!.parentElement as HTMLElement
    let raf = 0
    const run = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const g = measure(root)
        const s = JSON.stringify([g.w, g.h, g.pts])
        if (s !== sig.current) { sig.current = s; setGeo(g) }
      })
    }
    run()
    const ro = new ResizeObserver(run)
    ro.observe(root)
    document.fonts?.ready.then(run)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])

  // Scroll wiring. Under reduced motion nothing runs and CSS shows the finished line.
  useEffect(() => {
    if (!geo) return
    const root = svg.current!.parentElement as HTMLElement
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const s = svg.current!
      const els = Array.from(root.querySelectorAll<HTMLElement>('[data-node]'))
      geo.segs.forEach((_, i) => {
        gsap.fromTo(s.querySelectorAll(`.seg-${i}`), { strokeDashoffset: 1 }, {
          strokeDashoffset: 0, ease: 'none',
          scrollTrigger: { trigger: els[i], endTrigger: els[i + 1], start: 'center 62%', end: 'center 62%', scrub: 0.4 },
        })
      })
      const nodes = s.querySelectorAll<SVGGElement>('.node')
      nodes.forEach((n, i) => {
        const set = (st: ScrollTrigger) => n.classList.toggle('on', st.progress > 0)
        // The final node sits where the page can't scroll far enough to centre it, so it lights near the very bottom instead.
        const last = i === nodes.length - 1
        ScrollTrigger.create({
          trigger: els[i], start: last ? () => ScrollTrigger.maxScroll(window) - 40 : 'center 62%',
          end: last ? () => ScrollTrigger.maxScroll(window) + 4000 : 'max', onUpdate: set, onRefresh: set,
        })
      })
      s.querySelectorAll<SVGPathElement>('.twig').forEach((tw, i) => {
        const y = Math.round(geo.twigs[i].y)
        gsap.fromTo(tw, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: root, start: `top+=${y} 62%`, end: `top+=${y + 90} 62%`, scrub: 0.4 } })
      })
    }, svg)
    return () => mm.revert()
  }, [geo])

  return (
    <svg ref={svg} className="nerve" aria-hidden focusable="false" width={geo?.w ?? 0} height={geo?.h ?? 0} viewBox={`0 0 ${geo?.w ?? 0} ${geo?.h ?? 0}`}>
      {geo && (
        <>
          <defs>
            {geo.segs.map((_, i) => (
              <linearGradient key={i} id={`ng${i}`} gradientUnits="userSpaceOnUse" x1="0" x2="0" y1={geo.pts[i].y} y2={geo.pts[i + 1].y + 1}>
                <stop offset="0" stopColor={geo.pts[i].color} /><stop offset="1" stopColor={geo.pts[i + 1].color} />
              </linearGradient>
            ))}
          </defs>
          {geo.segs.map((d, i) => <path key={`t${i}`} d={d} className="track" fill="none" />)}
          {geo.segs.map((d, i) => (
            <g key={`s${i}`} fill="none" stroke={`url(#ng${i})`} strokeLinecap="round">
              <path d={d} className={`seg seg-${i} glow`} pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
              <path d={d} className={`seg seg-${i}`} pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
            </g>
          ))}
          {geo.twigs.map((t, i) => <path key={`w${i}`} d={t.d} className="twig" pathLength={1} strokeDasharray="1" strokeDashoffset="1" fill="none" stroke={geo.pts[i].color} strokeLinecap="round" />)}
          {geo.pts.map((p, i) => (
            <g key={`n${i}`} className="node" style={{ color: p.color }} transform={`translate(${p.x} ${p.y})`}>
              <circle className="ring" r="13" /><circle className="core" r="5" />
            </g>
          ))}
        </>
      )}
    </svg>
  )
}
