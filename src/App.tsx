import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { initHeroExit, initLenis, initProjects, initReveals, reducedMotion } from './lib/motion'
import { CAPABILITIES, HONORS, INTERNSHIPS, JULLEY, JULLEY_STACK, LINKS, PROCESS, PROJECTS, PUBLICATION, REPOS, TOOLKIT } from './content'
import { Nav } from './components/Nav'
import { NerveLine } from './components/NerveLine'
import { CaseStudy } from './components/CaseStudy'
import { ProjectVisual } from './components/ProjectVisual'

const GitHubMark = () => (
  <svg className="gh" width="15" height="15" viewBox="0 0 16 16" aria-hidden><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" /></svg>
)

const SIDE: Record<string, string> = { 'healthcare-ai': 'el', taskflow: 'er', 'burry-ai': 'el', webopedia: 'er' }

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
    const target = Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY))
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
    // Reduced motion: none of this runs — no Lenis, hero exit, parallax or reveal offsets.
    // matchMedia reverts or rebuilds it live if the preference changes.
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      lenisRef.current = initLenis()
      const $ = (s: string) => r.querySelector<HTMLElement>(s)!
      initHeroExit($('#hero'))
      initReveals(r)
      initProjects(r)
      const masks = r.querySelectorAll<HTMLElement>('#hero .mask')
      gsap.set(masks, { overflow: 'hidden' })
      gsap.from('.hero-line', { yPercent: 110, opacity: 0, duration: 1.1, stagger: 0.09, ease: 'expo.out', onComplete: () => gsap.set(masks, { clearProps: 'overflow' }) })
      // Hero pointer parallax moves the [data-depth] wrappers; the hero exit moves .hero-art itself.
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
        <NerveLine />
        <section id="hero" className="panel hero" tabIndex={-1} aria-labelledby="hero-title">
          <p className="label hero-eyebrow"><span className="hero-name">Akshat Bhardwaj</span> Platform engineering · Full-stack · AI/ML</p>
          <h1 id="hero-title" className="hero-h" aria-label="I build systems that connect.">
            <span className="mask" aria-hidden><span className="hero-line l1">I BUILD</span></span>
            <span className="mask" aria-hidden><span className="hero-line l2">SYSTEMS THAT</span></span>
            {/* The full stop is where the line begins. */}
            <span className="mask" aria-hidden><span className="hero-line l3">CONNECT<span className="h-stop" data-node="c" data-major /></span></span>
          </h1>
          <div className="hero-foot">
            <p>I work across platform engineering, full-stack products, and applied AI—turning complex technical problems into useful software.</p>
            <div className="ctas">
              <a className="btn primary" href="#work" onClick={link('#work')}>Explore my work</a>
              <a className="btn" href="#contact" onClick={link('#contact')}>Let's connect</a>
              <a className="btn cv" href={LINKS.resume} download={LINKS.resumeFile}>Download resume <span className="cv-ic" aria-hidden>↓</span><span className="sr-only"> (PDF, 2 pages)</span></a>
            </div>
          </div>
          <div className="hero-art" aria-hidden>
            <div className="art-1" data-depth="30"><div className="glass frag"><code>eas update --branch production</code></div></div>
            <div className="art-2" data-depth="-24"><div className="glass frag"><span className="dot" /> rag.retrieve(query)</div></div>
            <div className="art-3" data-depth="16"><div className="orb" /></div>
          </div>
        </section>

        <section id="about" className="panel about" tabIndex={-1} aria-labelledby="about-title" data-tint>
          <span className="idx" data-parallax="-30" aria-hidden>01</span>
          <div className="about-main" data-reveal>
            <span className="label sec">01 · About · B.Tech CSE, VJIT Hyderabad · 2022 – present</span>
            <h2 id="about-title">Across the stack,<br />into <em>AI.</em></h2>
          </div>
          <div className="about-copy" data-reveal data-node="el" data-node-y="top" data-f=".1">
            <p>I'm a Computer Science undergraduate who enjoys working across the software stack, from APIs and databases to mobile apps, deployment workflows, and AI-powered experiences.</p>
            <p className="muted" data-node="el" data-dx="-28" data-node-y="bottom" data-swing="0">I've helped migrate a production React Native/Expo app from Firebase to PostgreSQL-backed REST APIs, improved release workflows, and explored RAG, local LLM inference, transformer fine-tuning, and healthcare AI research.</p>
          </div>
          <ul className="caps3" data-reveal="stagger">{CAPABILITIES.map(([n, t, d], i) => (
            <li key={n} className="glass" data-node={i === 2 ? 'gr' : undefined} data-f=".22"><span className="label">{n}</span><strong>{t}</strong><p>{d}</p></li>))}
          </ul>
          <div className="tag-wrap t1" aria-hidden><span className="glass tag">{'firebase → postgres'}</span></div>
          <div className="tag-wrap t2" aria-hidden><span className="glass tag">GPA 8.25</span></div>
        </section>

        <section id="experience" className="exp" tabIndex={-1} aria-labelledby="exp-title">
          <header className="sec-head" data-reveal><span className="label sec">02 · Experience</span><h2 id="exp-title" data-node="gr" data-major>Production systems,<br />and research.</h2></header>
          <article className="job-main" data-reveal>
            <div className="job-head">
              <div><span className="label now"><i />Current</span><h3 data-node="er">Platform Engineer</h3><p className="org">JulleyOnline.in</p></div>
              <p className="meta">Hyderabad, India<br />Aug 2026 – Present</p>
            </div>
            <ol className="job-list">{JULLEY.map(([k, v], i) => <li key={k} data-node={i === 0 ? 'gr' : undefined}><span className="label">{String(i + 1).padStart(2, '0')} / {k}</span><p>{v}</p></li>)}</ol>
            <ul className="job-stack" aria-label="Stack">{JULLEY_STACK.map((t) => <li key={t}>{t}</li>)}</ul>
          </article>
          <div className="job-minor">{INTERNSHIPS.map((j, i) => (
            <article key={j.org} className="glass" data-reveal data-node={i === 1 ? 'er' : undefined} data-f=".85"><span className="label">{j.meta}</span><h3>{j.role}</h3><p className="org">{j.org}</p>
              <ul>{j.points.map((p) => <li key={p}>{p}</li>)}</ul></article>))}</div>
        </section>

        <section id="work" className="work" tabIndex={-1} aria-labelledby="work-title">
          <header className="sec-head"><span className="label sec">03 · Selected projects</span><h2 id="work-title" data-node="gr" data-major><span className="hl"><span>Built to be</span></span><span className="hl"><em>useful.</em></span></h2><div className="work-rule" aria-hidden /><p className="work-sub">Four projects, four problems: health data, task flow, personal finance, accessible knowledge.</p></header>
          <div className="projects">{PROJECTS.map((p, i) => (
            <article key={p.slug} className={`project p-${p.slug}`} data-project aria-labelledby={`p-${p.slug}`}>
              <span className="pnum" aria-hidden>0{i + 1}</span>
              {/* Mouse shortcut only; the text link below is the single accessible control. */}
              <a href={`#/work/${p.slug}`} className="glass holo pcard" tabIndex={-1} aria-hidden data-node={SIDE[p.slug]} {...tilt} onClick={caseLink(p.slug)}><ProjectVisual slug={p.slug} /></a>
              <div className="pinfo">
                {p.marker && <span className="label marker">{p.marker}</span>}
                <h3 id={`p-${p.slug}`}>{p.name}</h3><p className="kind">{p.kind}</p><p>{p.desc}</p>
                <ul className="tags" aria-label="Technologies">{p.tags.map((t) => <li key={t}>{t}</li>)}</ul>
                <div className="plinks">
                  <a href={`#/work/${p.slug}`} onClick={caseLink(p.slug)}>View case study<span className="sr-only">: {p.name}</span> →</a>
                  {REPOS[p.slug] && <a className="src" href={REPOS[p.slug]} target="_blank" rel="noreferrer"><GitHubMark /><span>View source<span className="sr-only">: {p.name} on GitHub (opens in a new tab)</span> <span className="src-ic" aria-hidden>↗</span></span></a>}
                  {p.link && <a href={p.link.href} target="_blank" rel="noreferrer">{p.link.label}<span className="sr-only"> (opens in a new tab)</span></a>}
                </div>
              </div>
            </article>))}</div>
        </section>

        <section id="process" className="process" tabIndex={-1} aria-labelledby="process-title">
          <header className="sec-head" data-reveal><span className="label sec">04 · How I work</span><h2 id="process-title" data-node="gl" data-major>From problem<br />to <em>proof.</em></h2></header>
          <ol className="stages" data-reveal="stagger">{PROCESS.map(([name, line, ev], i) => (
            <li key={name} className="stage" data-node={i === PROCESS.length - 1 ? 'gr' : 'el'} data-node-y="top" data-bow="-26"><span className="label">Stage 0{i + 1}</span><h3>{name}</h3><p className="stage-line">{line}</p><p className="muted">{ev}</p></li>))}
          </ol>
        </section>

        <section id="research" className="research" tabIndex={-1} aria-labelledby="research-title">
          <header className="sec-head" data-reveal><span className="label sec">05 · Research & recognition</span><h2 id="research-title" data-node="gr" data-major>Research, recognition<br />& publications.</h2></header>
          {/* Featured publication: the line plugs into its right edge, which lights the card when reached. */}
          <div className="pub-wrap">
            <article className="paper" data-reveal data-node="er" data-node-y="top" data-f=".35" aria-labelledby="paper-title">
              <div className="paper-main">
                <div className="paper-top"><span className="label pub-label"><i />Featured publication</span><span className="label">IEEE · ICoECIT 2026</span></div>
                <h3 id="paper-title" className="paper-title">{PUBLICATION.title}</h3>
                <p className="paper-authors"><strong>A. Bhardwaj</strong>{PUBLICATION.authors.replace(/^A\. Bhardwaj/, '')}</p>
                <p className="paper-venue">{PUBLICATION.venue}</p>
                <div className="paper-actions">
                  <a className="btn primary" href={LINKS.doi} target="_blank" rel="noreferrer">Read the paper ↗<span className="sr-only"> (opens in a new tab)</span></a>
                  <a className="paper-related" href="#/work/healthcare-ai" onClick={caseLink('healthcare-ai')}>Related project: Healthcare.AI →</a>
                </div>
              </div>
              <aside className="paper-record" aria-label="Publication record">
                <span className="label">Record</span>
                <dl>{PUBLICATION.record.map(([k, v]) => <div key={k}><dt className="label">{k}</dt><dd>{v}</dd></div>)}</dl>
                <a className="doi" href={LINKS.doi} target="_blank" rel="noreferrer"><span className="label">DOI</span><span>{PUBLICATION.doi}{'\u00a0'}↗</span><span className="sr-only"> (opens in a new tab)</span></a>
                <span className="pub-mark" aria-hidden>IEEE</span>
              </aside>
            </article>
          </div>
          <div className="honors" data-reveal="stagger">{HONORS.map(([k, t, d], i) => (
            <div key={t} data-node={i === 1 ? 'er' : undefined} data-dx="24" data-f=".62"><span className="label">{k}</span><h3>{t}</h3><p>{d}</p></div>))}</div>
        </section>

        <section id="toolkit" className="toolkit" tabIndex={-1} aria-labelledby="toolkit-title">
          <header className="sec-head" data-reveal><span className="label sec">06 · Technical toolkit</span><h2 id="toolkit-title" data-node="gl" data-major>The working<br />stack.</h2></header>
          <ol className="tk" data-reveal="stagger">{TOOLKIT.map(([k, v], i) => <li key={k} data-node={i === TOOLKIT.length - 1 ? 'gl' : undefined}><span>0{i + 1}</span><strong>{k}</strong><em>{v}</em></li>)}</ol>
        </section>

        <section id="contact" className="contact" tabIndex={-1} aria-labelledby="contact-title">
          <div data-reveal><span className="label sec">07 · Contact</span><h2 id="contact-title" data-node="gr" data-major>LET'S BUILD<br />SOMETHING<br /><em>MEANINGFUL.</em></h2><p className="contact-sub">Interested in software engineering, platform systems, full-stack development, and applied AI. Let's connect.</p></div>
          <div className="contact-row" data-reveal="stagger">
            <a className="btn primary" href={LINKS.email}>{LINKS.emailLabel}</a>
            <span className="cv-pair">
              <a className="cv" href={LINKS.resume} download={LINKS.resumeFile}>Resume <span className="cv-ic" aria-hidden>↓</span><span className="sr-only"> download (PDF, 2 pages)</span></a>
              <a className="cv-view" href={LINKS.resume} target="_blank" rel="noreferrer">View<span className="sr-only"> resume (opens in a new tab)</span></a>
            </span>
            <a href={LINKS.github} target="_blank" rel="noreferrer">GitHub ↗<span className="sr-only"> (opens in a new tab)</span></a>
            <a href={LINKS.linkedin} target="_blank" rel="noreferrer" data-node="er" data-dx="22" data-f=".72">LinkedIn ↗<span className="sr-only"> (opens in a new tab)</span></a>
          </div>
          <footer className="foot"><span>© {new Date().getFullYear()} Akshat Bhardwaj · Hyderabad, Telangana, India</span><button type="button" onClick={() => go('#hero')}>Back to top ↑</button></footer>
        </section>
      </main>
      {caseSlug && <CaseStudy key={caseSlug} slug={caseSlug} onClose={closeCase} onOpen={openCase} />}
    </div>
  )
}
