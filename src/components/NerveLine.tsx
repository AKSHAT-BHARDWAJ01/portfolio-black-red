import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// The nerve line: one organic crimson thread that runs down the whole page, from the full stop of the
// hero headline to the contact links. Geometry is measured from the content itself — every element
// marked `data-node` becomes a milestone, and the line travels between consecutive milestones:
//   data-node     gl | gr  page gutter, left or right     el | er  the element's left or right edge
//                 c        the element's centre
//   data-node-y   top | bottom  (default: vertical centre)
//   data-dx       sideways offset in px for an element edge on desktop (e.g. the middle of a column gap)
//   data-swing    override how far a leg swings sideways (0 runs it straight, as a rule along an edge)
//   data-f        where along the leg into this node the line crosses sideways (0–1, default .5), so a
//                 sweep can be placed in the whitespace between blocks instead of over text
//   data-bow      vertical bow for a nearly level leg (negative lifts it above the content)
//   data-major    a section milestone: larger node with a slow breathing ring
// Elements marked `data-tint` get a panel drawn behind the line, so a tinted section never hides it.
// The SVG lives in <main> beneath all content (sections are transparent), is absolutely positioned
// (never affects layout) and is redrawn only when the measured geometry actually changes.

type Node = { x: number; y: number; major: boolean }
type Seg = { d: string; twig: { d: string; y: number } | null }
type Geo = { w: number; h: number; nodes: Node[]; segs: Seg[]; tints: { y: number; h: number }[] }

const offsetBox = (el: HTMLElement, root: HTMLElement) => {
  // offset* ignores transforms, so reveal offsets, the hero exit and card tilt can't skew the measurement.
  let x = 0, y = 0
  for (let cur: HTMLElement | null = el; cur && cur !== root; cur = cur.offsetParent as HTMLElement | null) { x += cur.offsetLeft; y += cur.offsetTop }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight }
}

/** Milestones that are actually rendered (a breakpoint may hide some, e.g. secondary copy on mobile). */
const anchors = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLElement>('[data-node]')).filter((el) => el.offsetParent !== null)

/** Undrawn state of segment i. The first leg starts slightly drawn, so the line is already emerging from the full stop at load. */
const start0 = (i: number) => (i === 0 ? 0.92 : 1)

const r1 = (n: number) => Math.round(n * 10) / 10
const bez = (p0: number, p1: number, p2: number, p3: number, t: number) => {
  const u = 1 - t
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3
}

function measure(root: HTMLElement): Geo {
  const w = root.offsetWidth, h = root.offsetHeight
  const mobile = w < 768, narrow = w < 1024
  const g = mobile ? 24 : w * 0.06
  const xl = g * 0.5, xr = w - g * 0.5
  const els = anchors(root)
  const nodes = els.map((el) => {
    const b = offsetBox(el, root)
    let side = el.dataset.node!
    // Below desktop the columns stack, so the line runs one compact lane in the left gutter.
    if (narrow && side !== 'c') side = 'gl'
    const dx = narrow ? 0 : Number(el.dataset.dx ?? 0)
    const x = (side === 'gl' ? xl : side === 'gr' ? xr : side === 'el' ? b.x : side === 'er' ? b.x + b.w : b.x + b.w / 2) + dx
    const at = el.dataset.nodeY
    const y = at === 'top' ? b.y : at === 'bottom' ? b.y + b.h : b.y + b.h / 2
    return { x: Math.round(x), y: Math.round(y), major: 'major' in el.dataset }
  })
  const segs: Seg[] = []
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i], b = nodes[i + 1], ds = els[i + 1].dataset
    const dx = b.x - a.x, dy = b.y - a.y
    if (Math.abs(dy) < 90) {
      // Nearly level: one soft arc.
      const bow = Number(ds.bow ?? 12)
      segs.push({ d: `M${a.x} ${a.y} C${r1(a.x + dx * 0.35)} ${r1(a.y + bow)} ${r1(a.x + dx * 0.65)} ${r1(b.y + bow)} ${b.x} ${b.y}`, twig: null })
      continue
    }
    // A sweep: leave vertically, cross sideways with a horizontal tangent at the crossing height, arrive
    // vertically. Its swing grows with the space it has, so long gaps get broad gestures and short ones
    // subtle bends; alternating sides keeps consecutive legs from repeating.
    const sgn = i % 2 ? 1 : -1
    const swing = ds.swing !== undefined && !mobile ? Number(ds.swing) : Math.min(Math.max(Math.abs(dy) * 0.05, mobile ? 4 : 10), mobile ? 7 : narrow ? 18 : 30)
    const f = Number(ds.f ?? 0.5)
    const xm = (a.x + b.x) / 2 + sgn * swing, ym = a.y + dy * f
    // Tension follows the distance travelled, so wide crossings stay round rather than kinked.
    const k = Math.min(0.85, 0.6 + Math.abs(dx) / Math.max(w, 1) * 0.4)
    const c1y = a.y + k * (ym - a.y), c2x = (a.x + xm) / 2
    const d = `M${a.x} ${a.y} C${a.x} ${r1(c1y)} ${r1(c2x)} ${r1(ym)} ${r1(xm)} ${r1(ym)} S${b.x} ${r1(ym + (1 - k) * (b.y - ym))} ${b.x} ${b.y}`
    let twig: Seg['twig'] = null
    if (!mobile && ds.swing === undefined) {
      // A short twig off the first leg, curling toward the nearer page edge.
      const t = 0.42
      const tx = bez(a.x, a.x, c2x, xm, t), ty = bez(a.y, c1y, ym, ym, t)
      const dir = tx < w / 2 ? -1 : 1, L = Math.min(g * 0.42, narrow ? 26 : 38)
      twig = { d: `M${r1(tx)} ${r1(ty)} q${r1(dir * L * 0.15)} ${r1(-L * 0.55)} ${r1(dir * L * 0.7)} ${r1(-L * 0.85)}`, y: ty }
    }
    segs.push({ d, twig })
  }
  const tints = Array.from(root.querySelectorAll<HTMLElement>('[data-tint]')).map((el) => { const b = offsetBox(el, root); return { y: b.y, h: b.h } })
  return { w, h, nodes, segs, tints }
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
        const s = JSON.stringify([g.w, g.h, g.nodes, g.tints])
        if (s !== sig.current) { sig.current = s; setGeo(g) }
      })
    }
    run()
    const ro = new ResizeObserver(run)
    ro.observe(root)
    document.fonts?.ready.then(run)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])

  // Scroll wiring: one scrubbed timeline per segment draws the line and carries a spark at its tip,
  // so drawing and retracing always agree. Under reduced motion nothing runs and CSS shows the finished line.
  useEffect(() => {
    if (!geo) return
    const root = svg.current!.parentElement as HTMLElement
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const s = svg.current!
      const els = anchors(root)
      const at = (i: number) => (els[i].dataset.nodeY === 'top' ? 'top 62%' : els[i].dataset.nodeY === 'bottom' ? 'bottom 62%' : 'center 62%')
      const last = geo.segs.length - 1
      geo.segs.forEach((_, i) => {
        // The line leaves the hero as soon as scrolling starts, and finishes as the page bottoms out.
        const start = i === 0 ? 'top top' : at(i), end = i === last ? () => ScrollTrigger.maxScroll(window) - 4 : at(i + 1)
        // autoRound off: dash offsets are fractions of a unit path length, and GSAP would otherwise round them
        // to whole pixels, snapping each segment on in one step instead of drawing it.
        const tl = gsap.timeline({ defaults: { ease: 'none', autoRound: false }, scrollTrigger: { trigger: i === 0 ? root : els[i], endTrigger: els[i + 1], start, end, scrub: 0.5 } })
        tl.fromTo(s.querySelectorAll(`.seg-${i}`), { strokeDashoffset: start0(i) }, { strokeDashoffset: 0, duration: 1 }, 0)
          .fromTo(s.querySelector(`.spark-${i}`), { strokeDashoffset: 0.04 }, { strokeDashoffset: -0.96, duration: 1 }, 0)
          .fromTo(s.querySelector(`.spark-${i}`), { opacity: 0 }, { opacity: 1, duration: 0.06 }, 0)
          .to(s.querySelector(`.spark-${i}`), { opacity: 0, duration: 0.06 }, 0.94)
      })
      const nodes = s.querySelectorAll<SVGGElement>('.node')
      nodes.forEach((n, i) => {
        const set = (st: ScrollTrigger) => n.classList.toggle('on', i === 0 || st.progress > 0)
        // The final node sits where the page can't scroll far enough to reach mid-viewport, so it lights near the very bottom instead.
        const end = i === nodes.length - 1
        ScrollTrigger.create({
          trigger: els[i], start: end ? () => ScrollTrigger.maxScroll(window) - 40 : at(i),
          end: end ? () => ScrollTrigger.maxScroll(window) + 4000 : 'max', onUpdate: set, onRefresh: set,
        })
      })
      s.querySelectorAll<SVGPathElement>('.twig').forEach((tw) => {
        const y = Math.round(Number(tw.dataset.y))
        gsap.fromTo(tw, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'none', autoRound: false, scrollTrigger: { trigger: root, start: `top+=${y} 62%`, end: `top+=${y + 90} 62%`, scrub: 0.5 } })
      })
    })
    return () => mm.revert()
  }, [geo])

  const n = geo?.nodes.length ?? 0
  return (
    <svg ref={svg} className="nerve" aria-hidden focusable="false" width={geo?.w ?? 0} height={geo?.h ?? 0} viewBox={`0 0 ${geo?.w ?? 0} ${geo?.h ?? 0}`}>
      {geo && (
        <>
          {geo.tints.map((t, i) => <rect key={`p${i}`} className="tint" x="0" y={t.y} width={geo.w} height={t.h} />)}
          {geo.segs.map((s, i) => <path key={`t${i}`} d={s.d} className="track" fill="none" />)}
          {geo.segs.map((s, i) => (
            <g key={`s${i}`} fill="none" strokeLinecap="round">
              <path d={s.d} className={`seg seg-${i} glow`} pathLength={1} strokeDasharray="1" strokeDashoffset={start0(i)} />
              <path d={s.d} className={`seg seg-${i}`} pathLength={1} strokeDasharray="1" strokeDashoffset={start0(i)} />
              <path d={s.d} className={`spark spark-${i}`} pathLength={1} strokeDasharray="0.04 2" strokeDashoffset="0.04" />
              {s.twig && <path d={s.twig.d} data-y={s.twig.y} className="twig" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />}
            </g>
          ))}
          {geo.nodes.map((p, i) => (
            <g key={`n${i}`} className={`node${p.major ? ' major' : ''}${i === 0 ? ' origin' : ''}${i === n - 1 ? ' terminal' : ''}`} transform={`translate(${p.x} ${p.y})`}>
              {i === n - 1 && <circle className="halo" r="22" />}
              <circle className="ring" r={p.major || i === n - 1 ? 13 : 9} /><circle className="core" r={p.major || i === 0 || i === n - 1 ? 5 : 3.5} />
            </g>
          ))}
        </>
      )}
    </svg>
  )
}
