import { useRef } from 'react'
import { PROJECTS, PUBLICATION, REPOS } from '../content'
import { useFocusTrap } from '../lib/useFocusTrap'
import { ProjectVisual } from './ProjectVisual'

type Props = { slug: string; onClose: () => void; onOpen: (slug: string) => void }

export function CaseStudy({ slug, onClose, onOpen }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const title = useRef<HTMLHeadingElement>(null)
  useFocusTrap(ref, true, onClose, title)

  const i = PROJECTS.findIndex((p) => p.slug === slug)
  const p = PROJECTS[i]
  const next = PROJECTS[(i + 1) % PROJECTS.length]
  const n = String(i + 1).padStart(2, '0')

  return (
    // data-lenis-prevent: the dialog scrolls natively while Lenis stays stopped underneath.
    <div ref={ref} className="cs" role="dialog" aria-modal="true" aria-labelledby="cs-title" data-lenis-prevent>
      <div className="cs-bar">
        <button type="button" className="cs-back" onClick={onClose}>← All work</button>
        <span className="label">Case study {n} / 0{PROJECTS.length}</span>
      </div>

      <header className="cs-head">
        {p.marker && <span className="label marker">{p.marker}</span>}
        <h1 id="cs-title" ref={title} tabIndex={-1}>{p.name}</h1>
        <p className="cs-kind"><em>{p.kind}</em></p>
      </header>

      <div className="cs-visual">
        <div className="glass holo pcard is-static"><ProjectVisual slug={p.slug} /></div>
        <aside className="glass cs-facts" aria-label="At a glance">
          <span className="label">At a glance</span>
          <dl>
            <div><dt className="label">Kind</dt><dd>{p.kind}</dd></div>
            <div><dt className="label">Stack</dt><dd>{p.tags.join(' · ')}</dd></div>
            <div><dt className="label">Visual</dt><dd>Conceptual illustration — not a product screenshot</dd></div>
            {REPOS[p.slug] && <div><dt className="label">Source</dt><dd><a className="doi" href={REPOS[p.slug].url} target="_blank" rel="noreferrer">{REPOS[p.slug].url.replace('https://', '')} ↗<span className="sr-only"> (opens in a new tab)</span></a>
              {REPOS[p.slug].fork && <span className="fork-note">Fork of {REPOS[p.slug].fork}</span>}
              {REPOS[p.slug].alias && <span className="fork-note">Named {REPOS[p.slug].alias} in the repository</span>}</dd></div>}
            {p.link && <div><dt className="label">Paper</dt><dd><a className="doi" href={p.link.href} target="_blank" rel="noreferrer">DOI {PUBLICATION.doi} ↗</a></dd></div>}
          </dl>
        </aside>
      </div>

      <section className="cs-block" aria-labelledby="cs-problem">
        <h2 id="cs-problem" className="label">01 / Problem</h2>
        <p className="cs-lead">{p.desc}</p>
      </section>
      <section className="cs-block" aria-labelledby="cs-impl">
        <h2 id="cs-impl" className="label">02 / Implementation</h2>
        <ul className="cs-list">{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
      </section>
      <section className="cs-block" aria-labelledby="cs-tech">
        <h2 id="cs-tech" className="label">03 / Technologies</h2>
        <ul className="tags">{p.tags.map((t) => <li key={t}>{t}</li>)}</ul>
      </section>
      {p.outcomes.length > 0 && (
        <section className="cs-block" aria-labelledby="cs-out">
          <h2 id="cs-out" className="label">04 / Verified outcomes</h2>
          <ul className="cs-list cs-out">{p.outcomes.map((o) => <li key={o}>{o}</li>)}</ul>
        </section>
      )}

      <a className="cs-next" href={`#/work/${next.slug}`} onClick={(e) => { e.preventDefault(); onOpen(next.slug) }}>
        <span className="label">Next project</span><strong>{next.name} →</strong>
      </a>
    </div>
  )
}
