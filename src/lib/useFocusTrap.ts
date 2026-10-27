import { useEffect, type RefObject } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Keeps Tab inside `ref` while `active`, closes on Escape, and focuses the first control on open. */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean, onEscape: () => void, initial?: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!active || !el) return
    ;(initial?.current ?? el.querySelector<HTMLElement>(FOCUSABLE))?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onEscape(); return }
      if (e.key !== 'Tab') return
      const items = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (!items.length) return
      const first = items[0], last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // onEscape is recreated each render; binding once per open is intended.
  }, [active])
}
