'use client'

import { useEffect, type RefObject } from 'react'

/**
 * Reveals `[data-reveal]` children as they enter the viewport.
 *
 * Why this cannot leave content stuck invisible:
 *  - Server HTML has no hidden state; `.reveal-pending` is only added after hydration.
 *  - IntersectionObserver measures real geometry, so pinned sections and their
 *    spacers (GSAP ScrollTrigger) cannot throw the trigger positions off.
 *  - Reduced-motion users and browsers without IO never get the hidden state.
 */
export function useReveal(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return

    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))
    root.classList.add('reveal-pending')
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('reveal-in')
            io.unobserve(e.target)
          }
        }),
      { threshold: 0, rootMargin: '0px 0px -6% 0px' },
    )
    items.forEach((el) => io.observe(el))
    return () => {
      io.disconnect()
      root.classList.remove('reveal-pending')
      items.forEach((el) => el.classList.remove('reveal-in'))
    }
  }, [ref])
}
