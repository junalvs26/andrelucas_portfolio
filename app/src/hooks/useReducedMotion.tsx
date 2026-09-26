'use client'

import { useEffect, useState, useCallback, createContext, useContext, ReactNode } from 'react'

interface ReducedMotionContextValue {
  prefersReducedMotion: boolean
}

const ReducedMotionContext = createContext<ReducedMotionContextValue>({
  prefersReducedMotion: false,
})

export function ReducedMotionProvider({ children }: { children: ReactNode }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return (
    <ReducedMotionContext.Provider value={{ prefersReducedMotion }}>
      {children}
    </ReducedMotionContext.Provider>
  )
}

export function useReducedMotion(): boolean {
  const context = useContext(ReducedMotionContext)
  if (!context) {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
    return false
  }
  return context.prefersReducedMotion
}

