import { useEffect, useRef, useState } from 'react'
import { LINKS, SECTIONS } from '../content'
import { useFocusTrap } from '../lib/useFocusTrap'

type Props = { go: (id: string) => void; lock: (on: boolean) => void }

/** Tracks which section crosses the middle of the viewport (works with or without motion). */
function useActiveSection() {
  const [active, setActive] = useState<string | null>(null)
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id === 'hero' ? null : e.target.id)),
      { rootMargin: '-50% 0px -50% 0px' },
    )
    ;['hero', ...SECTIONS].forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [])
  return active
}

export function Nav({ go, lock }: Props) {
  const active = useActiveSection()
  const [open, setOpen] = useState(false)
  const sheet = useRef<HTMLDivElement>(null)
  const menuBtn = useRef<HTMLButtonElement>(null)

  const close = (restoreFocus = true) => {
    setOpen(false)
    lock(false)
    if (restoreFocus) menuBtn.current?.focus()
  }
  useFocusTrap(sheet, open, () => close())

  const nav = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    if (open) close(false)
    go(`#${id}`)
  }

  return (
    <>
      <header className="nav glass">
        <a href="#hero" onClick={nav('hero')} className="mark">Akshat<span>Bhardwaj</span></a>
        <nav aria-label="Primary" className="nav-links">
          {SECTIONS.map((s) => (
            <a key={s} href={`#${s}`} onClick={nav(s)} aria-current={active === s ? 'true' : undefined}>{s}</a>
          ))}
        </nav>
        <span className="avail"><i />Hyderabad · Open to connect</span>
        <button ref={menuBtn} type="button" className="icon-btn menu-btn" aria-label="Open menu" aria-expanded={open} aria-controls="site-menu"
          onClick={() => { setOpen(true); lock(true) }}>
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden><path d="M3 6h14M3 14h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </button>
      </header>

      {open && (
        <div ref={sheet} id="site-menu" className="sheet" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="sheet-top">
            <span className="label">Menu</span>
            <button type="button" className="icon-btn" aria-label="Close menu" onClick={() => close()}>
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            </button>
          </div>
          <nav aria-label="Primary (menu)">
            <ol className="sheet-links">
              {SECTIONS.map((s, i) => (
                <li key={s}>
                  <a href={`#${s}`} onClick={nav(s)} aria-current={active === s ? 'true' : undefined}>
                    <span className="label">0{i + 1}</span>{s}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="sheet-foot">
            <span className="avail sheet-avail"><i />Hyderabad · Open to connect</span>
            <div className="sheet-contact">
              <a href={LINKS.email}>Email</a>
              <a href={LINKS.github} target="_blank" rel="noreferrer">GitHub ↗</a>
              <a href={LINKS.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
