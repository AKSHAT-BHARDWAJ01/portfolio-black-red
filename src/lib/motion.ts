import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Physics2DPlugin } from 'gsap/Physics2DPlugin'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger, Physics2DPlugin)

export const REDUCED = '(prefers-reduced-motion: reduce)'
export const reducedMotion = () => window.matchMedia(REDUCED).matches
const isMobile = () => window.innerWidth < 768

/** Per-object fall configuration (data attributes override defaults). */
export interface FallConfig {
  velocity: number // initial px/s
  angle: number // degrees, 90 = straight down
  gravity: number // px/s^2 downward acceleration
  rotation: number // degrees of spin during fall (signed)
  compression: number // scaleY at impact
  rebound: number // px bounce height
  settle: number // seconds of settling
  delay: number
}

function configFor(el: HTMLElement, i: number): FallConfig {
  const d = el.dataset
  const m = isMobile() ? 0.55 : 1
  const sign = i % 2 ? -1 : 1
  return {
    velocity: Number(d.vel ?? 80 + ((i * 37) % 120)),
    angle: Number(d.angle ?? 90 + sign * (4 + ((i * 7) % 10))),
    gravity: Number(d.gravity ?? 2600 + ((i * 211) % 900)),
    rotation: Number(d.rot ?? sign * (6 + ((i * 13) % 18))) * m,
    compression: Number(d.squash ?? 0.84),
    rebound: Number(d.rebound ?? 40 + ((i * 17) % 50)) * m,
    settle: 0.5,
    delay: Number(d.delay ?? i * 0.06),
  }
}

/**
 * Gravity transition: drops every [data-fall] element inside `outgoing`.
 * Physics2D drives x/y with velocity + gravity (true acceleration). Physics2D has
 * NO collision detection, so each frame we compare the element's y against its
 * own virtual floor (precomputed distance from its bottom edge to ~88% viewport).
 * When crossed we kill the physics tween, clamp to the floor and hand off to a
 * deterministic impact → rebound → settle → exit timeline.
 */
export interface GravityTransition {
  /** Scroll position (px) at which the fall triggers. */
  start: () => number
  /** Jump straight to the fallen end state without animating (direct navigation, reload mid-page). */
  settle: () => void
  kill: () => void
}

export function createGravityTransition(outgoing: HTMLElement, incoming: HTMLElement): GravityTransition {
  const els = Array.from(outgoing.querySelectorAll<HTMLElement>('[data-fall]'))
  let running: gsap.core.Animation[] = []
  let state: 'idle' | 'fallen' = 'idle'

  const killAll = () => {
    running.forEach((a) => a.kill())
    running = []
    gsap.killTweensOf(els)
  }

  // A fallen section is invisible: keep it out of the tab order and the accessibility tree.
  // `.is-fallen` also clears its background so the incoming section (layered beneath) shows through.
  const setFallen = (on: boolean) => {
    outgoing.style.pointerEvents = on ? 'none' : ''
    outgoing.inert = on
    outgoing.classList.toggle('is-fallen', on)
  }

  const settle = () => {
    if (state === 'fallen') return
    state = 'fallen'
    killAll()
    gsap.set(els, { opacity: 0 })
    setFallen(true)
  }

  const fall = () => {
    if (state === 'fallen') return
    // Already scrolled past (e.g. reload mid-page): nothing to watch, skip straight to the end state.
    if (outgoing.getBoundingClientRect().bottom <= 0) return settle()
    state = 'fallen'
    killAll()
    // The intro clips hero lines with their masks; falling text must not be clipped.
    outgoing.querySelectorAll<HTMLElement>('.mask').forEach((m) => (m.style.overflow = ''))
    const vh = window.innerHeight
    // Read layout once, before animating (no reads inside frames).
    const floors = els.map((el) => {
      gsap.set(el, { clearProps: 'transform' })
      return vh * (isMobile() ? 0.92 : 0.88) - el.getBoundingClientRect().bottom
    })
    els.forEach((el, i) => {
      const c = configFor(el, i)
      const floor = Math.max(floors[i], 60)
      gsap.set(el, { transformOrigin: '50% 100%', willChange: 'transform' })
      const spin = gsap.to(el, { rotation: c.rotation, duration: 1.1, delay: c.delay, ease: 'power1.in' })
      const phys = gsap.to(el, {
        delay: c.delay,
        duration: 3,
        physics2D: { velocity: c.velocity, angle: c.angle, gravity: c.gravity },
        onUpdate() {
          const y = gsap.getProperty(el, 'y') as number
          if (y < floor) return
          // Virtual collision: stop physics, snap to floor, run impact sequence.
          phys.kill()
          spin.kill()
          const rot = gsap.getProperty(el, 'rotation') as number
          const impact = gsap
            .timeline()
            .set(el, { y: floor })
            .to(el, { scaleY: c.compression, scaleX: 2 - c.compression, rotation: rot * 0.4, duration: 0.08, ease: 'power2.out' })
            .to(el, { scaleY: 1.04, scaleX: 0.97, y: floor - c.rebound, rotation: rot * 0.7, duration: 0.24, ease: 'power2.out' })
            .to(el, { scaleY: 1, scaleX: 1, y: floor, duration: 0.22, ease: 'power2.in' })
            .to(el, { y: floor - c.rebound * 0.18, duration: 0.1, ease: 'power1.out' })
            .to(el, { y: floor, rotation: rot * 0.5, duration: c.settle, ease: 'bounce.out' })
            .to(el, { opacity: 0, y: floor + 40, duration: 0.5, ease: 'power2.in' }, '+=0.15')
          running.push(impact)
        },
      })
      running.push(spin, phys)
    })
    setFallen(true)
  }

  // Authored resting offsets live in the CSS `translate`/`rotate` properties, which GSAP's
  // `transform` never touches — so restoring to zero returns every element to its designed pose.
  const restore = () => {
    if (state === 'idle') return
    state = 'idle'
    killAll()
    setFallen(false)
    running.push(
      gsap.to(els, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.03 }),
    )
  }

  // Pin the outgoing layer (no spacing) so the incoming section scrolls up beneath it. Pinning from
  // 'bottom bottom' equals 'top top' for a viewport-high panel, and lets a taller one be read fully first.
  const pin = ScrollTrigger.create({ trigger: outgoing, start: 'bottom bottom', end: () => '+=' + window.innerHeight, pin: true, pinSpacing: false })
  const trig = ScrollTrigger.create({
    trigger: incoming,
    start: 'top 75%',
    onEnter: fall,
    onLeaveBack: restore,
    onRefresh: (self) => { if (self.progress === 0) restore() },
  })
  return {
    start: () => trig.start,
    settle,
    kill: () => { killAll(); pin.kill(); trig.kill(); setFallen(false); gsap.set(els, { clearProps: 'all' }) },
  }
}

/** Lenis drives scroll; GSAP's ticker is the single RAF loop for both. */
export function initLenis() {
  const lenis = new Lenis({ duration: 1.05, smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  const tick = (t: number) => lenis.raf(t * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  return { lenis, destroy: () => { gsap.ticker.remove(tick); lenis.destroy() } }
}

export function initReveals(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.from(el.children.length && el.dataset.reveal === 'stagger' ? el.children : el, {
      opacity: 0, y: 28, duration: 0.8, ease: 'power3.out', stagger: 0.07,
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
    })
  })
  root.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    gsap.to(el, { yPercent: Number(el.dataset.parallax), ease: 'none', scrollTrigger: { trigger: el.closest('section'), scrub: true } })
  })
}

/**
 * Projects: heading rises out of its masks and a rule draws under it; each project then enters as its own
 * small timeline (visual wipes open, number and copy follow). All of it reverses with the scroll.
 */
export function initProjects(root: HTMLElement) {
  const head = root.querySelector<HTMLElement>('.work .sec-head')
  if (head) {
    const tl = gsap.timeline({ scrollTrigger: { trigger: head, start: 'top 80%', toggleActions: 'play none none reverse' } })
    tl.from(head.querySelector('.label'), { opacity: 0, y: 12, duration: 0.5, ease: 'power3.out' })
      .from(head.querySelectorAll('.hl > *'), { yPercent: 115, duration: 1, stagger: 0.12, ease: 'expo.out' }, 0.05)
      .from(head.querySelector('.work-rule'), { scaleX: 0, transformOrigin: '0 50%', duration: 1.1, ease: 'power3.inOut' }, 0.3)
      .from(head.querySelector('.work-sub'), { opacity: 0, y: 14, duration: 0.6, ease: 'power3.out' }, 0.6)
  }
  root.querySelectorAll<HTMLElement>('[data-project]').forEach((p) => {
    const flip = p.classList.contains('p-taskflow') || p.classList.contains('p-webopedia') ? -1 : 1
    const tl = gsap.timeline({ scrollTrigger: { trigger: p, start: 'top 78%', toggleActions: 'play none none reverse' } })
    // Animate the .pv child, never .pcard: .holo owns a CSS transform + transition for the hover tilt, which would fight GSAP.
    tl.from(p.querySelector('.pv'), { clipPath: 'inset(0 0 100% 0)', x: 40 * flip, opacity: 0, duration: 1, ease: 'expo.inOut' })
      .from(p.querySelector('.pnum'), { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out' }, 0.1)
      .from(p.querySelectorAll('.pinfo > *'), { opacity: 0, y: 26, duration: 0.7, stagger: 0.08, ease: 'power3.out' }, 0.25)
  })
}
