'use client'

import React, { useEffect, useState } from 'react'

const MIN_VISIBLE_MS = 1900 // lets the logo wipe finish (see .preloader-* in globals.css)
const MIN_VISIBLE_REDUCED_MS = 300
const MAX_WAIT_MS = 4500 // never trap the visitor behind a stalled asset
const EXIT_MS = 600 // keep in sync with .preloader transition

type Phase = 'show' | 'leave' | 'gone'

/**
 * Full-screen brand preloader. It is server-rendered visible (so the animation starts on first paint),
 * then fades out once the window has loaded and the logo animation has had time to play.
 */
export function Preloader() {
  const [phase, setPhase] = useState<Phase>('show')

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const minMs = reduced ? MIN_VISIBLE_REDUCED_MS : MIN_VISIBLE_MS
    let leaveTimer: ReturnType<typeof setTimeout> | undefined
    let finished = false

    const finish = () => {
      if (finished) return
      finished = true
      // performance.now() is measured from navigation start, so time already spent loading counts.
      leaveTimer = setTimeout(() => setPhase('leave'), Math.max(0, minMs - performance.now()))
    }

    if (document.readyState === 'complete') finish()
    else window.addEventListener('load', finish, { once: true })
    const capTimer = setTimeout(finish, MAX_WAIT_MS)

    return () => {
      window.removeEventListener('load', finish)
      clearTimeout(capTimer)
      clearTimeout(leaveTimer)
    }
  }, [])

  useEffect(() => {
    if (phase === 'leave') {
      const t = setTimeout(() => setPhase('gone'), EXIT_MS)
      return () => clearTimeout(t)
    }
  }, [phase])

  // Lock page scroll only while the overlay is up.
  useEffect(() => {
    if (phase === 'gone') return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [phase])

  if (phase === 'gone') return null

  return (
    <div
      className={`preloader${phase === 'leave' ? ' preloader-leave' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading Vaishno Rubber Industries"
    >
      {/* Without JS the overlay could never dismiss itself, so hide it. */}
      <noscript>
        <style>{'.preloader{display:none!important}'}</style>
      </noscript>

      <div className="preloader-stage">
        <div className="preloader-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo.png" alt="" width={338} height={142} className="preloader-logo-ghost" draggable={false} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo.png" alt="" width={338} height={142} className="preloader-logo-color" draggable={false} />
          <span className="preloader-scan" aria-hidden="true" />
        </div>
        <div className="preloader-bar" aria-hidden="true">
          <span />
        </div>
        <p className="preloader-label">Vaishno Rubber Industries</p>
      </div>
    </div>
  )
}
