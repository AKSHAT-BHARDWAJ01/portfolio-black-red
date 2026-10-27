import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap'
import { createGravityTransition, initLenis, initReveals, reducedMotion } from './lib/motion'

// Content (source: resume) --------------------------------------------------
const LINKS = {
  email: 'mailto:akshatbhardwaj0801@gmail.com',
  github: 'https://github.com/AKSHAT-BHARDWAJ01',
  linkedin: 'https://www.linkedin.com/in/akshat-bhardwaj-84bb52271/',
  doi: 'https://doi.org/10.1109/ICoECIT68303.2026.11497893',
}
type Project = { id: string; name: string; kind: string; desc: string; tags: string[]; features: string[]; marker?: string; link?: { label: string; href: string } }
const PROJECTS: Project[] = [
  { id: 'healthcare', name: 'Healthcare.AI', kind: 'AI Health Prediction Platform', marker: 'IEEE RESEARCH PUBLICATION · 2026',
    desc: 'An integrated healthcare AI platform designed to bring patient information, medical reports, and AI-assisted health insights into one experience.',
    tags: ['React', 'FastAPI', 'Supabase', 'PyTorch', 'Hugging Face', 'JWT'],
    features: ['NLP-based symptom analysis and preliminary health insights.', 'Secure medical report upload and storage, with AI-assisted summaries.', 'QR-code-based sharing of reports.', 'A unified patient profile containing reports, diagnoses, medications, and AI observations.', 'Caregiver support, emergency contacts, health alerts, and secure report sharing.'],
    link: { label: 'Read the IEEE paper ↗', href: 'https://doi.org/10.1109/ICoECIT68303.2026.11497893' } },
  { id: 'taskflow', name: 'TaskFlow', kind: 'Full-Stack Task Management Platform',
    desc: 'A full-stack productivity application built around task organization, secure access, progress tracking, and an analytics-driven workflow.',
    tags: ['React', 'FastAPI', 'Supabase', 'PostgreSQL', 'JWT', 'Docker', 'Vercel'],
    features: ['JWT authentication and bcrypt password hashing.', 'Role-based access control and session management.', 'Full create, read, update, and delete task workflows.', 'Status updates and priority-based filtering.', 'Search across titles, descriptions, categories, status, and priority.', 'Analytics with completion-rate charts and task-status distributions.', 'Deployed through Vercel with Supabase PostgreSQL.', 'Automated tests with pytest and Vitest; CI/CD through GitHub Actions.'] },
  { id: 'burry', name: 'Burry AI', kind: 'Personal Finance Advisor',
    desc: 'An AI-oriented personal finance application for understanding spending patterns and exploring more informed financial decisions.',
    tags: ['React', 'FastAPI', 'PostgreSQL', 'Scikit-Learn', 'Pandas', 'NumPy'],
    features: ['Personalized recommendations based on spending trends and financial goals.', 'Income and expense tracking with data visualizations.', 'Cost-optimization insights to identify avoidable expenses.', 'Trend analysis, category breakdowns, and income-versus-spending comparisons.'] },
  { id: 'webopedia', name: 'Webopedia', kind: 'Accessible Wikipedia Clone',
    desc: 'An accessible information-discovery experience focused on making articles and knowledge more approachable.',
    tags: ['React', 'Wikipedia API', 'Web Speech API', 'CSS'],
    features: ['Dynamic article search and content rendering through the Wikipedia API.', 'Live article and image retrieval.', 'Assistive navigation using a floating action button.', 'Text-to-speech for audio-based content consumption.', 'Built with Team Blaze at the Hack-O-Mania Hackathon, 2023.'] },
]
const TOOLKIT = [
  ['Languages', 'Python · JavaScript · TypeScript · SQL · HTML · CSS'],
  ['Mobile & Frontend', 'React Native · Expo · Expo Router · React'],
  ['Backend & DevOps', 'FastAPI · PostgreSQL · Firebase · REST APIs · JWT · Docker · Vercel · GitHub Actions · EAS Build · EAS Update'],
  ['AI/ML & Data', 'Hugging Face · PyTorch · Scikit-Learn · Pandas · NumPy · RAG · LLM fine-tuning · Prompt engineering · NLP · Generative AI · Ollama'],
  ['Testing & Tools', 'Git · pytest · Vitest · Functional testing · Regression testing · Figma design translation'],
]
const JULLEY = [
  ['Backend migration', 'Contributed to migrating a production React Native/Expo application from Firebase to PostgreSQL-backed REST APIs across 30+ files while maintaining production uptime.'],
  ['Version control recovery', 'Reconciled a branch divergence involving 126+ commits across nine core application screens, restoring a clean branch baseline with no data or feature loss.'],
  ['QA & hotfixes', 'Diagnosed and fixed production UI issues, including touch-interception and task-creation gating, using an isolated Git worktree with functional, regression, lint, type-check, and real-device validation.'],
  ['Release engineering', 'Audited GitHub Actions and EAS configuration; implemented a Firebase Remote Config force-update mechanism with version comparison and fail-open error handling.'],
  ['Mobile features', 'Translated Figma designs into React Native components for task management, workspace hierarchies, Insights drill-downs, biometric authentication, and document previews.'],
]
const INTERNSHIPS = [
  { org: 'Swecha Telangana', role: 'AI Research Intern', meta: 'IIIT Hyderabad (Hybrid) · May 2025 – Jun 2025', points: ['Built an open-source AI assistant with Hugging Face supporting 50+ complex query types through prompt engineering.', 'Designed a RAG system with custom knowledge bases, reducing information retrieval time by 40%.', 'Deployed local LLM inference via Ollama and PocketPal, enabling offline execution of 7+ language models.', 'Fine-tuned transformer models for specialized NLP tasks, improving accuracy by 15%.'] },
  { org: 'Agnirva.com Space Community', role: 'AI Research Intern', meta: 'Remote · Jul 2025', points: ['Built LLM-based AI assistants using generative AI techniques for design, audio, and video generation.', 'Analyzed AI applications in climate research and satellite data processing.', 'Explored generative AI workflows and prompt engineering.'] },
]
// ---------------------------------------------------------------------------

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

function Nav({ go }: { go: (id: string) => void }) {
  return (
    <header className="nav glass">
      <a href="#hero" onClick={(e) => { e.preventDefault(); go('#hero') }} className="mark">Akshat<span>Bhardwaj</span></a>
      <nav aria-label="Primary">
        {['about', 'experience', 'work', 'research', 'toolkit', 'contact'].map((s) => (
          <a key={s} href={`#${s}`} onClick={(e) => { e.preventDefault(); go(`#${s}`) }}>{s}</a>
        ))}
      </nav>
      <span className="avail"><i />Hyderabad · Open to connect</span>
    </header>
  )
}

function ProjectVisual({ id }: { id: string }) {
  if (id === 'healthcare') return (
    <div className="pv pv-health" aria-hidden>
      <ol className="ptl">{['Report uploaded', 'AI summary', 'Shared via QR'].map((t) => <li key={t}><i />{t}</li>)}</ol>
      <div className="report"><span className="label">Medical report · sample</span><b /><b /><b className="s" /><div className="ai">AI observation · illustrative</div></div>
      <svg viewBox="0 0 300 60"><polyline points="0,30 70,30 88,8 104,52 120,30 300,30" /></svg>
    </div>)
  if (id === 'taskflow') return (
    <div className="pv pv-task" aria-hidden>
      {[['To do', 3], ['In progress', 2], ['Done', 4]].map(([c, n]) => (
        <div key={c} className="col"><span className="label">{c}</span>{Array.from({ length: n as number }).map((_, i) => <b key={i} className={`pr${i % 3}`} />)}</div>))}
      <div className="ring"><span>Completion</span></div>
    </div>)
  if (id === 'burry') return (
    <div className="pv pv-fin" aria-hidden>{[40, 62, 48, 78, 55, 88, 70].map((h, i) => <b key={i} style={{ height: `${h}%` }} />)}
      <svg viewBox="0 0 100 40" preserveAspectRatio="none"><polyline points="0,30 16,26 33,32 50,18 66,22 83,10 100,14" /></svg><div className="chip">Income vs spending · illustrative</div></div>)
  return (
    <div className="pv pv-wiki" aria-hidden><span className="label">Article</span><b /><b /><b className="s" /><b /><b className="s" /><div className="fab">♪</div><div className="chip">Text-to-speech</div></div>)
}

export default function App() {
  const root = useRef<HTMLDivElement>(null)
  const lenisRef = useRef<ReturnType<typeof initLenis> | null>(null)
  const tilt = useTilt()
  const [open, setOpen] = useState<string | null>(null)
  const toggle = (id: string) => { setOpen((o) => (o === id ? null : id)); requestAnimationFrame(() => setTimeout(() => ScrollTrigger.refresh(), 50)) }

  const go = (id: string) => {
    const el = document.querySelector<HTMLElement>(id)
    if (!el) return
    if (lenisRef.current) lenisRef.current.lenis.scrollTo(el, { offset: 0 })
    else el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' })
  }

  useEffect(() => {
    const r = root.current!
    // Reduced motion: no Lenis, no gravity, no pinning, no parallax — content stays visible.
    if (reducedMotion()) return
    lenisRef.current = initLenis()
    const ctx = gsap.context(() => {
      const $ = (s: string) => r.querySelector<HTMLElement>(s)!
      createGravityTransition($('#hero'), $('#about'))
      createGravityTransition($('#about'), $('#experience'))
      initReveals(r)
      gsap.from('.hero-line', { yPercent: 110, opacity: 0, duration: 1.1, stagger: 0.09, ease: 'expo.out' })
    }, r)
    // Hero pointer parallax (fine pointers only).
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5
      r.querySelectorAll<HTMLElement>('[data-depth]').forEach((el) => {
        const d = Number(el.dataset.depth)
        gsap.to(el.firstElementChild ?? el, { x: x * d, y: y * d, duration: 0.8, ease: 'power3.out', overwrite: 'auto' })
      })
    }
    window.addEventListener('pointermove', onMove)
    const onResize = () => ScrollTrigger.refresh()
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('resize', onResize); ctx.revert(); lenisRef.current?.destroy(); lenisRef.current = null }
  }, [])

  return (
    <div ref={root} className="site">
      <Nav go={go} />
      <main>
        <section id="hero" className="panel z3">
          <p className="label" data-fall>PLATFORM ENGINEERING · FULL-STACK · AI/ML</p>
          <h1 className="hero-h" aria-label="I build systems. I explore AI. I make ideas work.">
            <span className="mask"><span className="hero-line l1" data-fall>I BUILD SYSTEMS.</span></span>
            <span className="mask"><span className="hero-line l2" data-fall>I EXPLORE AI.</span></span>
            <span className="mask"><span className="hero-line l3" data-fall>I MAKE IDEAS WORK.</span></span>
          </h1>
          <div className="hero-foot" data-fall>
            <p>Software engineer focused on platform systems, full-stack products, and applied AI. From production mobile infrastructure to intelligent healthcare applications, I enjoy turning complex problems into useful software.</p>
            <div className="ctas"><a className="btn primary" href="#work" onClick={(e) => { e.preventDefault(); go('#work') }}>Explore my work</a>
              <a className="btn" href="#contact" onClick={(e) => { e.preventDefault(); go('#contact') }}>Let's connect</a></div>
          </div>
          <div className="hero-art" aria-hidden>
            <div data-depth="30"><div className="glass frag f1" data-fall><code>eas update --branch production</code></div></div>
            <div data-depth="-24"><div className="glass frag f2" data-fall><span className="dot" /> rag.retrieve(query)</div></div>
            <div data-depth="16"><div className="prism-orb" data-fall /></div>
          </div>
          <div className="scroll-ind" data-fall>Scroll<span /></div>
        </section>

        <section id="about" className="panel z2 about">
          <span className="idx" data-parallax="-30">01</span>
          <div className="about-main">
            <span className="label" data-fall>About · B.Tech CSE, VJIT Hyderabad · 2022 – present</span>
            <h2 data-fall>Across the stack,<br />into <em>AI.</em></h2>
          </div>
          <div className="about-copy" data-fall>
            <p>I'm a Computer Science undergraduate who enjoys working across the software stack, from APIs and databases to mobile apps, deployment workflows, and AI-powered experiences.</p>
            <p className="muted">I've helped migrate a production React Native/Expo app from Firebase to PostgreSQL-backed REST APIs, improved release workflows, and explored RAG, local LLM inference, transformer fine-tuning, and healthcare AI research.</p>
          </div>
          <ul className="caps3">{[
            ['01', 'Platform & Engineering', 'Production mobile systems, backend migration, API integration, version control, CI/CD, release engineering.'],
            ['02', 'Full-Stack Products', 'Task management, authentication, database-backed apps, analytics dashboards, interactive UX.'],
            ['03', 'AI & Research', 'RAG systems, NLP, Hugging Face, model fine-tuning, local inference, applied healthcare AI.'],
          ].map(([n, t, d]) => <li key={n} className="glass" data-fall><span className="label">{n}</span><strong>{t}</strong><p>{d}</p></li>)}</ul>
          <div className="glass tag t1" data-fall>{'firebase → postgres'}</div>
          <div className="glass tag t2" data-fall>GPA 8.25</div>
        </section>

        <section id="experience" className="z1 exp">
          <header className="sec-head" data-reveal><span className="label">02 · Experience</span><h2>Production systems,<br />and research.</h2></header>
          <article className="job-main" data-reveal>
            <div className="job-head">
              <div><span className="label now"><i />Current</span><h3>Platform Engineer</h3><p className="org">JulleyOnline.in</p></div>
              <p className="meta">Hyderabad, India<br />Aug 2026 – Present</p>
            </div>
            <ol className="job-list">{JULLEY.map(([k, v], i) => <li key={k}><span className="label">{String(i + 1).padStart(2, '0')} / {k}</span><p>{v}</p></li>)}</ol>
            <div className="job-stack">{['React Native', 'Expo', 'PostgreSQL', 'REST APIs', 'Firebase Remote Config', 'GitHub Actions', 'EAS'].map((t) => <span key={t}>{t}</span>)}</div>
          </article>
          <div className="job-minor">{INTERNSHIPS.map((j) => (
            <article key={j.org} className="glass" data-reveal><span className="label">{j.meta}</span><h4>{j.role}</h4><p className="org">{j.org}</p>
              <ul>{j.points.map((p) => <li key={p}>{p}</li>)}</ul></article>))}</div>
        </section>

        <section id="work" className="work">
          <header className="sec-head" data-reveal><span className="label">03 · Selected work</span><h2>Built to be<br /><em>useful.</em></h2></header>
          <div className="projects">{PROJECTS.map((p, i) => (
            <article key={p.id} className={`project p-${p.id} ${i < 2 ? 'major' : 'minor'}`} data-reveal>
              <span className="pnum">0{i + 1}</span>
              <button type="button" className="glass holo pcard" {...tilt} onClick={() => toggle(p.id)} aria-expanded={open === p.id} aria-controls={`case-${p.id}`} aria-label={`${p.name} case study`}><ProjectVisual id={p.id} /></button>
              <div className="pinfo">
                {p.marker && <span className="label marker">{p.marker}</span>}
                <h3>{p.name}</h3><p className="kind">{p.kind}</p><p>{p.desc}</p>
                <ul className="tags">{p.tags.map((t) => <li key={t}>{t}</li>)}</ul>
                <div className="plinks"><button type="button" onClick={() => toggle(p.id)} aria-expanded={open === p.id} aria-controls={`case-${p.id}`}>{open === p.id ? 'Close case study ×' : 'View case study →'}</button>
                  {p.link && <a href={p.link.href} target="_blank" rel="noreferrer">{p.link.label}</a>}</div>
                <div id={`case-${p.id}`} className="case" hidden={open !== p.id}><span className="label">Key features</span><ul>{p.features.map((f) => <li key={f}>{f}</li>)}</ul></div>
              </div>
            </article>))}</div>
        </section>

        <section id="research" className="research">
          <header className="sec-head" data-reveal><span className="label">04</span><h2>Research, recognition<br />& publications.</h2></header>
          <article className="glass holo paper" data-reveal>
            <span className="label">PUBLISHED IEEE RESEARCH · 2026</span>
            <h3>Healthcare AI: An Integrated AI Platform for Proactive Patient Care and Medical Data Management</h3>
            <p className="muted">A. Bhardwaj, M. M. Ali, M. S. U. Tayyab, M. W. Uddin Taher, and P. K. Yadala</p>
            <p>2026 IEEE International Conference on Emerging Computing and Intelligent Technologies (ICoECIT), Hyderabad, India, pp. 1–5.</p>
            <a className="doi" href={LINKS.doi} target="_blank" rel="noreferrer">DOI 10.1109/ICoECIT68303.2026.11497893 ↗</a>
          </article>
          <div className="honors" data-reveal="stagger">
            <div><span className="label">Paper presentation · Jan 2026</span><h4>Healthcare.AI: An Integrated Artificial Intelligence Platform for Proactive Patient Care</h4><p>Presented at ICCIDSDT 2026, MANUU, Hyderabad. A presentation, separate from the publication above.</p></div>
            <div><span className="label">Hackathon · Nov 2023</span><h4>1st Place: Hack-O-Mania</h4><p>Organized by GDSC and DSS, VJIT. Built Webopedia with Team Blaze in 24 hours.</p></div>
            <div><span className="label">Certification · Feb 2026</span><h4>Introduction to Generative AI Studio</h4><p>Simplilearn</p></div>
          </div>
        </section>

        <section id="toolkit" className="toolkit">
          <header className="sec-head" data-reveal><span className="label">05 · Toolkit</span><h2>The working<br />stack.</h2></header>
          <ol className="tk" data-reveal="stagger">{TOOLKIT.map(([k, v], i) => <li key={k}><span>0{i + 1}</span><strong>{k}</strong><em>{v}</em></li>)}</ol>
        </section>

        <section id="contact" className="contact">
          <div data-reveal><h2>LET'S BUILD<br />SOMETHING<br /><em>MEANINGFUL.</em></h2><p className="contact-sub">Interested in software engineering, platform systems, full-stack development, and applied AI. Let's connect.</p></div>
          <div className="contact-row" data-reveal="stagger">
            <a className="btn primary" href={LINKS.email}>akshatbhardwaj0801@gmail.com</a>
            <a href={LINKS.github} target="_blank" rel="noreferrer">GitHub ↗</a>
            <a href={LINKS.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
          </div>
          <footer className="foot"><span>© {new Date().getFullYear()} Akshat Bhardwaj · Hyderabad, Telangana, India</span><button onClick={() => go('#hero')}>Back to top ↑</button></footer>
        </section>
      </main>
    </div>
  )
}
