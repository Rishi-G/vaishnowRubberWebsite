'use client'

import React, { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

const KEY = 'vextra-theme'

/** Light/dark switch. The choice is remembered in this browser; layout.tsx applies it before first paint. */
export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.dataset.theme === 'dark')
  }, [])

  const toggle = () => {
    const next = dark ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    setDark(!dark)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      /* private mode: the choice just lasts for this visit */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={dark}
      className={`rounded-md p-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-brand-blue ${className}`}
    >
      {dark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}
