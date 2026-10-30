import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

export const REDUCED = '(prefers-reduced-motion: reduce)'
export const reducedMotion = () => window.matchMedia(REDUCED).matches

/**
 * Hero exit: as the hero scrolls away its headline lines drift upward at different depths and dim,
 * while the supporting copy and art recede. Scrubbed, so it reverses exactly with the scroll.
 */
export function initHeroExit(hero: HTMLElement) {
  const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom 15%', scrub: 0.6 } })
  // The last line holds still: its full stop is where the line begins.
  hero.querySelectorAll<HTMLElement>('.mask').forEach((m, i, all) => tl.to(m, { yPercent: (all.length - 1 - i) * -24, opacity: i === all.length - 1 ? 0.5 : 0.12, duration: 1 }, 0))
  tl.to(hero.querySelectorAll('.hero-eyebrow, .hero-foot'), { y: -40, opacity: 0, duration: 0.8 }, 0)
    .to(hero.querySelector('.hero-art'), { yPercent: -18, opacity: 0, duration: 1 }, 0)
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
