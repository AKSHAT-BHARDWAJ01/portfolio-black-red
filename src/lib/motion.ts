import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Physics2DPlugin } from 'gsap/Physics2DPlugin'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger, Physics2DPlugin)

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
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
export function createGravityTransition(outgoing: HTMLElement, incoming: HTMLElement) {
  const els = Array.from(outgoing.querySelectorAll<HTMLElement>('[data-fall]'))
  let running: gsap.core.Animation[] = []
  let state: 'idle' | 'fallen' = 'idle'

  const killAll = () => {
    running.forEach((a) => a.kill())
    running = []
    gsap.killTweensOf(els)
  }

  const fall = () => {
    if (state === 'fallen') return
    state = 'fallen'
    killAll()
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
    outgoing.style.pointerEvents = 'none'
  }

  const restore = () => {
    if (state === 'idle') return
    state = 'idle'
    killAll()
    outgoing.style.pointerEvents = ''
    running.push(
      gsap.to(els, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.03 }),
    )
  }

  // Pin the outgoing layer (no spacing) so the incoming section scrolls up beneath it.
  const pin = ScrollTrigger.create({ trigger: outgoing, start: 'top top', end: () => '+=' + window.innerHeight, pin: true, pinSpacing: false })
  const trig = ScrollTrigger.create({
    trigger: incoming,
    start: 'top 75%',
    onEnter: fall,
    onLeaveBack: restore,
    onRefresh: (self) => { if (self.progress === 0) restore() },
  })
  return () => { killAll(); pin.kill(); trig.kill(); gsap.set(els, { clearProps: 'all' }) }
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
