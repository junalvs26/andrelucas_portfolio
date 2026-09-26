"use client"

import { useEffect, useRef } from "react"
import { SceneId, lerp, smootherstep } from "@/config/scenes"
import { motion, subscribeMotion } from "@/lib/motion"

export interface SceneLayerOptions {
  /** Escala no inicio da entrada. 1 = sem zoom. */
  scaleFrom?: number
  /** Deslocamento vertical inicial, em px. */
  yFrom?: number
  /** Deslocamento horizontal inicial, em px. */
  xFrom?: number
  /** Desfoque inicial, em px. Da a sensacao de "entrar em foco". */
  blurFrom?: number
  /** Deriva de parallax ao longo da cena, em px (negativo sobe). */
  parallax?: number
  /** Zoom lento continuo durante a cena, somado a escala de entrada. */
  drift?: number
  /** Opacidade maxima da camada. */
  maxOpacity?: number
  /**
   * Libera eventos de ponteiro quando a camada esta praticamente cheia.
   * Fica desligado por padrao: uma camada a 20% de opacidade nao deve
   * interceptar cliques destinados a cena que esta entrando.
   */
  interactive?: boolean
}

const EPS = 0.0015

/**
 * Compoe uma camada de cena a partir do peso da cena no store de movimento.
 *
 * Tres coisas que a versao anterior nao fazia e que causavam os cortes secos:
 *
 * - A camada nunca desmonta. Antes era `if (!isActive) return null`, entao ao
 *   cruzar a fronteira o DOM inteiro da cena desaparecia num frame. Aqui a
 *   opacidade vem do peso com overlap, e duas cenas coexistem na travessia.
 *
 * - `visibility` e `willChange` sao ligados so enquanto a camada esta visivel.
 *   Manter `will-change` permanente em cinco camadas de tela cheia obriga o
 *   compositor a guardar cinco texturas do tamanho da viewport para sempre.
 *
 * - As escritas de estilo passam por comparacao com o ultimo valor. Reescrever
 *   a mesma string de transform a cada frame invalida o estilo e forca
 *   recalculo mesmo quando nada mudou.
 */
export function useSceneLayer<T extends HTMLElement>(
  id: SceneId,
  options: SceneLayerOptions = {}
) {
  const ref = useRef<T | null>(null)
  const optsRef = useRef(options)
  optsRef.current = options

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let lastOpacity = -1
    let lastTransform = ""
    let lastFilter = ""
    let visible = false
    let interactive = false

    el.style.opacity = "0"
    el.style.visibility = "hidden"
    el.style.transformOrigin = "50% 50%"
    el.style.backfaceVisibility = "hidden"

    return subscribeMotion((state) => {
      const o = optsRef.current
      const w = state.weight[id]
      const p = state.progress[id]

      const shouldBeVisible = w > EPS
      if (shouldBeVisible !== visible) {
        visible = shouldBeVisible
        el.style.visibility = visible ? "visible" : "hidden"
        el.style.willChange = visible ? "opacity, transform, filter" : "auto"
      }
      if (!visible) {
        if (interactive) {
          interactive = false
          el.style.pointerEvents = "none"
        }
        return
      }

      const shouldInteract = Boolean(o.interactive) && w > 0.65
      if (shouldInteract !== interactive) {
        interactive = shouldInteract
        el.style.pointerEvents = interactive ? "auto" : "none"
      }

      // Curva de entrada separada da opacidade: a opacidade sobe linear com o
      // peso (crossfade limpo), o transform usa uma curva C2 para o movimento
      // nao ter quina no meio da travessia.
      const e = smootherstep(w)
      const maxOpacity = o.maxOpacity ?? 1
      const opacity = w * maxOpacity

      if (Math.abs(opacity - lastOpacity) > EPS) {
        el.style.opacity = opacity.toFixed(4)
        lastOpacity = opacity
      }

      const driftAmount = (o.drift ?? 0) * p
      const scale = lerp(o.scaleFrom ?? 1, 1, e) + driftAmount
      const y = lerp(o.yFrom ?? 0, 0, e) + (o.parallax ?? 0) * p
      const x = lerp(o.xFrom ?? 0, 0, e)

      // translate3d mantem a camada na propria layer do compositor, entao a
      // travessia nao repinta o documento inteiro.
      const transform =
        "translate3d(" +
        x.toFixed(2) +
        "px," +
        y.toFixed(2) +
        "px,0) scale(" +
        scale.toFixed(4) +
        ")"

      if (transform !== lastTransform) {
        el.style.transform = transform
        lastTransform = transform
      }

      const blurBase = o.blurFrom ?? 0
      if (blurBase > 0 && !state.prefersReducedMotion) {
        const blur = lerp(blurBase, 0, e)
        const filter = blur > 0.05 ? "blur(" + blur.toFixed(2) + "px)" : "none"
        if (filter !== lastFilter) {
          el.style.filter = filter
          lastFilter = filter
        }
      }
    })
  }, [id])

  return ref
}

/** Leitura pontual do store, para efeitos que nao rodam por frame. */
export function readMotion() {
  return motion
}
