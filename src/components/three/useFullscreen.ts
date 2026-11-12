'use client'

import { useCallback, useEffect, useState, type RefObject } from 'react'

/**
 * Fullscreen for a viewer. Uses the browser's Fullscreen API when it is allowed; where it is not
 * (iPhone Safari, some embedded browsers) the viewer still fills the window, because the caller
 * also applies `fixed inset-0` while `full` is true. Esc or the button leaves either mode.
 */
export function useFullscreen(ref: RefObject<HTMLElement | null>) {
  const [full, setFull] = useState(false)

  const exit = useCallback(() => {
    setFull(false)
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
  }, [])

  const toggle = useCallback(() => {
    if (full) return exit()
    setFull(true)
    ref.current?.requestFullscreen?.().catch(() => {
      /* not allowed here: the fixed overlay is the fallback */
    })
  }, [full, exit, ref])

  // the browser's own exit (Esc, swipe) must also drop our state
  useEffect(() => {
    const onChange = () => {
      if (!document.fullscreenElement) setFull(false)
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  // overlay fallback: Esc closes, and the page behind does not scroll
  useEffect(() => {
    if (!full) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') exit()
    }
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', onKey)
    }
  }, [full, exit])

  return { full, toggle }
}
