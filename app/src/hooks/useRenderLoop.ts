"use client"

import { useCallback, useEffect, useRef } from "react"
import { subscribeMotion } from "@/lib/motion"
import type { MotionState } from "@/lib/motion"

export interface Dimensions {
  width: number
  height: number
  dpr: number
}

const dimensionsRef = { current: { width: 0, height: 0, dpr: 1 } as Dimensions }
const resizeCallbacks = new Set<() => void>()
let resizeBound = false
let resizePending = 0

function measure() {
  if (typeof window === "undefined") return
  dimensionsRef.current = {
    width: window.innerWidth,
    height: window.innerHeight,
    // Acima de 2 o custo de fill rate cresce mais rapido que o ganho visual,
    // e telas 3x sao justamente as que menos tem folga de GPU.
    dpr: Math.min(window.devicePixelRatio || 1, 2),
  }
  resizeCallbacks.forEach((cb) => cb())
}

/**
 * Resize passa por rAF: `resize` dispara em rajadas e cada callback
 * redimensiona um canvas, o que e uma realocacao de buffer. Coalescer num
 * frame evita dezenas dessas realocacoes ao arrastar a janela.
 */
function scheduleMeasure() {
  if (resizePending) return
  resizePending = requestAnimationFrame(() => {
    resizePending = 0
    measure()
  })
}

function bindResize() {
  if (resizeBound || typeof window === "undefined") return
  resizeBound = true
  measure()
  window.addEventListener("resize", scheduleMeasure, { passive: true })
  window.addEventListener("orientationchange", scheduleMeasure, { passive: true })
}

export function getDimensions(): Dimensions {
  return dimensionsRef.current
}

/**
 * Executa `callback` uma vez por frame, no mesmo tick em que o scroll foi
 * resolvido. Antes isso era um requestAnimationFrame proprio, separado do
 * Lenis: cada canvas desenhava com uma posicao de scroll de um frame atras,
 * e o resultado era o fundo, o personagem e o texto nunca coincidirem.
 */
export function useRenderLoopFrame(
  callback: (time: number, dt: number, state: MotionState) => void,
  _priority: "high" | "normal" | "low" = "normal",
  deps: unknown[] = []
) {
  const cbRef = useRef(callback)
  cbRef.current = callback

  useEffect(() => {
    bindResize()
    return subscribeMotion((state) => {
      cbRef.current(state.time, state.dt, state)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/** Recebe as dimensoes atuais na montagem e a cada resize coalescido. */
export function useResizeObserver(callback: (dimensions: Dimensions) => void) {
  const cbRef = useRef(callback)
  cbRef.current = callback

  useEffect(() => {
    bindResize()
    const run = () => cbRef.current(dimensionsRef.current)
    resizeCallbacks.add(run)
    run()
    return () => {
      resizeCallbacks.delete(run)
    }
  }, [])
}

export function useRenderLoop() {
  return {
    getDimensions: useCallback(() => dimensionsRef.current, []),
    onResize: useCallback((cb: () => void) => {
      bindResize()
      resizeCallbacks.add(cb)
      return () => {
        resizeCallbacks.delete(cb)
      }
    }, []),
  }
}
