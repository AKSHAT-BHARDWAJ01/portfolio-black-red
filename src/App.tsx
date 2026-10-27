import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { createGravityTransition, initLenis, initReveals, reducedMotion, type GravityTransition } from './lib/motion'
import { CAPABILITIES, HONORS, INTERNSHIPS, JULLEY, JULLEY_STACK, LINKS, PRINCIPLES, PROJECTS, PUBLICATION, TOOLKIT } from './content'
import { Nav } from './components/Nav'
import { CaseStudy } from './components/CaseStudy'
import { ProjectVisual } from './components/ProjectVisual'

const caseFromHash = () => {
  const slug = /^#\/work\/([\w-]+)$/.exec(location.hash)?.[1]
  return PROJECTS.some((p) => p.slug === slug) ? slug! : null
}

function useTilt() {
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse' || reducedMotion()) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5
    e.currentTarget.style.setProperty('--rx', `${-y * 6}deg`)
    e.currentTarget.style.setProperty('--ry', `${x * 8}deg`)
  }
  const onLeave = (e: React.PointerEvent<HTMLElement>) => { e.currentTarget.style.setProperty('--rx', '0deg'); e.currentTarget.style.setProperty('--ry', '0deg') }
  return { onPointerMove: onMove, onPointerLeave: onLeave }
}

export default function App() {
  const root = useRef<HTMLDivElement>(null)
  const lenisRef = useRef<ReturnType<typeof initLenis> | null>(null)
  const transitions = useRef<GravityTransition[]>([])
  const returnFocus = useRef<HTMLElement | null>(null)
  const tilt = useTilt()
  const [caseSlug, setCaseSlug] = useState<string | null>(caseFromHash)

  // Freeze the page behind an overlay (menu or case study).
  const lock = useCallback((on: boolean) => {
    const lenis = lenisRef.current?.lenis
    if (on) lenis?.stop(); else lenis?.start()
    document.documentElement.classList.toggle('locked', on)
    const main = root.current?.querySelector('main')
    if (main) main.inert = on
  }, [])

  const go = useCallback((id: string, immediate = false) => {
    const el = document.querySelector<HTMLElement>(id)
    if (!el) return
    // A pinned section's own box is offset by its pin distance once the pin ends; its spacer keeps the real position.
    const anchor = el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el
    const target = Math.max(0, Math.round(anchor.getBoundingClientRect().top + window.scrollY))
    // A long jump skips the falls it passes, so no debris lands on the destination.
    if (immediate || Math.abs(target - window.scrollY) > window.innerHeight * 1.2)
      transitions.current.forEach((t) => { if (window.scrollY < t.start() && target >= t.start()) t.settle() })
    const lenis = lenisRef.current?.lenis
    if (lenis) lenis.scrollTo(target, { immediate })
    else window.scrollTo({ top: target, behavior: immediate || reducedMotion() ? 'auto' : 'smooth' })
    el.focus({ preventScroll: true })
  }, [])

  const openCase = (slug: string) => {
    if (!caseSlug) returnFocus.current = document.activeElement as HTMLElement
    history[caseSlug ? 'replaceState' : 'pushState'](null, '', `#/work/${slug}`)
    setCaseSlug(slug)
  }
  const closeCase = () => {
    history.pushState(null, '', location.pathname + location.search)
    setCaseSlug(null)
  }

  useEffect(() => {
    const onPop = () => setCaseSlug(caseFromHash())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    lock(!!caseSlug)
    if (!caseSlug) returnFocus.current?.focus({ preventScroll: true })
  }, [caseSlug, lock])

  // Layout effect: the intro must be set up before first paint, or the headline flashes.
  useLayoutEffect(() => {
    const r = root.current!
    const mm = gsap.matchMedia(r)
    // Reduced motion: none of this runs — no Lenis, gravity, pinning, parallax or reveal offsets.
    // matchMedia reverts or rebuilds it live if the preference changes.
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      lenisRef.current = initLenis()
      const $ = (s: string) => r.querySelector<HTMLElement>(s)!
      transitions.current = [createGravityTransition($('#hero'), $('#about')), createGravityTransition($('#about'), $('#experience'))]
      initReveals(r)
      const masks = r.querySelectorAll<HTMLElement>('#hero .mask')
      gsap.set(masks, { overflow: 'hidden' })
      gsap.from('.hero-line', { yPercent: 110, opacity: 0, duration: 1.1, stagger: 0.09, ease: 'expo.out', onComplete: () => gsap.set(masks, { clearProps: 'overflow' }) })
      // Hero pointer parallax moves the [data-depth] wrapper, never the [data-fall] child Physics2D drives.
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return
        const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5
        r.querySelectorAll<HTMLElement>('[data-depth]').forEach((el) => {
          const d = Number(el.dataset.depth)
          gsap.to(el, { x: x * d, y: y * d, duration: 0.8, ease: 'power3.out', overwrite: 'auto' })
        })
      }
      window.addEventListener('pointermove', onMove)
      return () => {
        window.removeEventListener('pointermove', onMove)
        transitions.current.forEach((t) => t.kill())
        transitions.current = []
        lenisRef.current?.destroy()
        lenisRef.current = null
      }
    })
    // Deep link to a section (#work): land there directly once motion is set up.
    if (/^#[a-z]+$/.test(location.hash)) requestAnimationFrame(() => go(location.hash, true))
    if (caseFromHash()) lock(true)
    return () => mm.revert()
  }, [go, lock])

  const link = (id: string) => (e: React.MouseEvent) => { e.preventDefault(); go(id) }
  const caseLink = (slug: string) => (e: React.MouseEvent) => { e.preventDefault(); openCase(slug) }

  return (
    <div ref={root} className="site">
      <a className="skip" href="#main" onClick={link('#main')}>Skip to content</a>
      <Nav go={go} lock={lock} />
      <main id="main" tabIndex={-1}>
        <section id="hero" className="panel z3" tabIndex={-1} aria-labelledby="hero-title">
          <p className="label hero-eyebrow" data-fall>Platform engineering · Full-stack · AI/ML</p>
          <h1 id="hero-title" className="hero-h" aria-label="I build systems. I explore AI. I make ideas work.">
            <span className="mask" aria-hidden><span className="hero-line l1" data-fall>I BUILD SYSTEMS.</span></span>
            <span className="mask" aria-hidden><span className="hero-line l2" data-fall>I EXPLORE AI.</span></span>
            <span className="mask" aria-hidden><span className="hero-line l3" data-fall>I MAKE IDEAS WORK.</span></span>
          </h1>
          <div className="hero-foot" data-fall>
            <p>Software engineer focused on platform systems, full-stack products, and applied AI. From production mobile infrastructure to intelligent healthcare applications, I enjoy turning complex problems into useful software.</p>
            <div className="ctas">
              <a className="btn primary" href="#work" onClick={link('#work')}>Explore my work</a>
              <a className="btn" href="#contact" onClick={link('#contact')}>Let's connect</a>
            </div>
          </div>
          <div className="hero-art" aria-hidden>
            <div className="art-1" data-depth="30"><div className="glass frag" data-fall><code>eas update --branch production</code></div></div>
            <div className="art-2" data-depth="-24"><div className="glass frag" data-fall><span className="dot" /> rag.retrieve(query)</div></div>
            <div className="art-3" data-depth="16"><div className="prism-orb" data-fall /></div>
          </div>
          <div className="scroll-ind" aria-hidden data-fall>Scroll<span /></div>
        </section>

        <section id="about" className="panel z2 about" tabIndex={-1} aria-labelledby="about-title">
          <span className="idx" data-parallax="-30" aria-hidden>01</span>
          <div className="about-main">
            <span className="label" data-fall>About · B.Tech CSE, VJIT Hyderabad · 2022 – present</span>
            <h2 id="about-title" data-fall>Across the stack,<br />into <em>AI.</em></h2>
          </div>
          <div className="about-copy" data-fall>
            <p>I'm a Computer Science undergraduate who enjoys working across the software stack, from APIs and databases to mobile apps, deployment workflows, and AI-powered experiences.</p>
            <p className="muted">I've helped migrate a production React Native/Expo app from Firebase to PostgreSQL-backed REST APIs, improved release workflows, and explored RAG, local LLM inference, transformer fine-tuning, and healthcare AI research.</p>
          </div>
          <ul className="caps3">{CAPABILITIES.map(([n, t, d]) => (
            <li key={n} className="glass" data-fall><span className="label">{n}</span><strong>{t}</strong><p>{d}</p></li>))}
          </ul>
          <div className="tag-wrap t1" data-fall aria-hidden><span className="glass tag">{'firebase → postgres'}</span></div>
          <div className="tag-wrap t2" data-fall aria-hidden><span className="glass tag">GPA 8.25</span></div>
        </section>

        <section id="experience" className="z1 exp" tabIndex={-1} aria-labelledby="exp-title">
          <header className="sec-head" data-reveal><span className="label">02 · Experience</span><h2 id="exp-title">Production systems,<br />and research.</h2></header>
          <div className="how" data-reveal="stagger">
            <span className="label how-label">How I work</span>
            {PRINCIPLES.map(([t, d], i) => (
              <div key={t} className="principle"><span className="label">Principle 0{i + 1}</span><h3>{t}</h3><p>{d}</p></div>))}
          </div>
          <article className="job-main" data-reveal>
            <div className="job-head">
              <div><span className="label now"><i />Current</span><h3>Platform Engineer</h3><p className="org">JulleyOnline.in</p></div>
              <p className="meta">Hyderabad, India<br />Aug 2026 – Present</p>
            </div>
            <ol className="job-list">{JULLEY.map(([k, v], i) => <li key={k}><span className="label">{String(i + 1).padStart(2, '0')} / {k}</span><p>{v}</p></li>)}</ol>
            <ul className="job-stack" aria-label="Stack">{JULLEY_STACK.map((t) => <li key={t}>{t}</li>)}</ul>
          </article>
          <div className="job-minor">{INTERNSHIPS.map((j) => (
            <article key={j.org} className="glass" data-reveal><span className="label">{j.meta}</span><h3>{j.role}</h3><p className="org">{j.org}</p>
              <ul>{j.points.map((p) => <li key={p}>{p}</li>)}</ul></article>))}</div>
        </section>

        <section id="work" className="work" tabIndex={-1} aria-labelledby="work-title">
          <header className="sec-head" data-reveal><span className="label">03 · Selected work</span><h2 id="work-title">Built to be<br /><em>useful.</em></h2></header>
          <div className="projects">{PROJECTS.map((p, i) => (
            <article key={p.slug} className={`project p-${p.slug} ${i < 2 ? 'major' : 'minor'}`} data-reveal aria-labelledby={`p-${p.slug}`}>
              <span className="pnum" aria-hidden>0{i + 1}</span>
              {/* Mouse shortcut only; the text link below is the single accessible control. */}
              <a href={`#/work/${p.slug}`} className="glass holo pcard" tabIndex={-1} aria-hidden {...tilt} onClick={caseLink(p.slug)}><ProjectVisual slug={p.slug} /></a>
              <div className="pinfo">
                {p.marker && <span className="label marker">{p.marker}</span>}
                <h3 id={`p-${p.slug}`}>{p.name}</h3><p className="kind">{p.kind}</p><p>{p.desc}</p>
                <ul className="tags" aria-label="Technologies">{p.tags.map((t) => <li key={t}>{t}</li>)}</ul>
                <div className="plinks">
                  <a href={`#/work/${p.slug}`} onClick={caseLink(p.slug)}>View case study<span className="sr-only">: {p.name}</span> →</a>
                  {p.link && <a href={p.link.href} target="_blank" rel="noreferrer">{p.link.label}<span className="sr-only"> (opens in a new tab)</span></a>}
                </div>
              </div>
            </article>))}</div>
        </section>

        <section id="research" className="research" tabIndex={-1} aria-labelledby="research-title">
          <header className="sec-head" data-reveal><span className="label">04 · Research & recognition</span><h2 id="research-title">Research, recognition<br />& publications.</h2></header>
          <div className="pub-row">
            <article className="glass holo paper" data-reveal>
              <span className="label pub-label">Published IEEE research · 2026</span>
              <h3>{PUBLICATION.title}</h3>
              <p className="muted">{PUBLICATION.authors}</p>
              <p>{PUBLICATION.venue}</p>
              <a className="doi" href={LINKS.doi} target="_blank" rel="noreferrer">DOI {PUBLICATION.doi} ↗<span className="sr-only"> (opens in a new tab)</span></a>
            </article>
            <aside className="glass record" data-reveal aria-label="Publication record">
              <span className="label">Record</span>
              <dl>{PUBLICATION.record.map(([k, v]) => <div key={k}><dt className="label">{k}</dt><dd>{v}</dd></div>)}</dl>
            </aside>
          </div>
          <div className="honors" data-reveal="stagger">{HONORS.map(([k, t, d]) => (
            <div key={t}><span className="label">{k}</span><h3>{t}</h3><p>{d}</p></div>))}</div>
        </section>

        <section id="toolkit" className="toolkit" tabIndex={-1} aria-labelledby="toolkit-title">
          <header className="sec-head" data-reveal><span className="label">05 · Toolkit</span><h2 id="toolkit-title">The working<br />stack.</h2></header>
          <ol className="tk" data-reveal="stagger">{TOOLKIT.map(([k, v], i) => <li key={k}><span>0{i + 1}</span><strong>{k}</strong><em>{v}</em></li>)}</ol>
        </section>

        <section id="contact" className="contact" tabIndex={-1} aria-labelledby="contact-title">
          <div data-reveal><h2 id="contact-title">LET'S BUILD<br />SOMETHING<br /><em>MEANINGFUL.</em></h2><p className="contact-sub">Interested in software engineering, platform systems, full-stack development, and applied AI. Let's connect.</p></div>
          <div className="contact-row" data-reveal="stagger">
            <a className="btn primary" href={LINKS.email}>{LINKS.emailLabel}</a>
            <a href={LINKS.github} target="_blank" rel="noreferrer">GitHub ↗<span className="sr-only"> (opens in a new tab)</span></a>
            <a href={LINKS.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗<span className="sr-only"> (opens in a new tab)</span></a>
          </div>
          <footer className="foot"><span>© {new Date().getFullYear()} Akshat Bhardwaj · Hyderabad, Telangana, India</span><button type="button" onClick={() => go('#hero')}>Back to top ↑</button></footer>
        </section>
      </main>
      {caseSlug && <CaseStudy key={caseSlug} slug={caseSlug} onClose={closeCase} onOpen={openCase} />}
    </div>
  )
}
