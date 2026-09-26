"use client"

import { useEffect, useRef, useState } from "react"
import Lenis from "lenis"
import { gsap } from "gsap"
import { SceneId } from "@/config/scenes"
import { commitMotion, motion, setReducedMotion } from "@/lib/motion"
import type { LenisScrollReturn } from "@/types/scene"

const lenisRef = { current: null as Lenis | null }

/**
 * Pipeline de scroll.
 *
 * Mudancas em relacao a versao anterior, que era a origem do travamento:
 *
 * 1. Existia UM ScrollTrigger por cena (seis triggers identicos cobrindo a
 *    pagina toda), e cada um chamava `setScrollProgress` no `onUpdate`. Isso
 *    dava seis re-renders da arvore inteira por frame. Agora nada por frame
 *    passa pelo React - o scroll vai para o store em `lib/motion`.
 *
 * 2. O Lenis nunca foi ligado ao GSAP, e o `SceneBackdrop` chamava
 *    `ScrollTrigger.refresh()` a cada evento de scroll. `refresh()` recalcula
 *    a posicao de todos os triggers e forca layout sincrono - era o gargalo
 *    mais caro da pagina. O ScrollTrigger saiu inteiro do caminho do scroll.
 *
 * 3. Havia tres requestAnimationFrame concorrentes (Lenis, useRenderLoop,
 *    CustomCursor), cada um lendo e escrevendo layout em momentos diferentes
 *    do frame. Agora ha um relogio unico: o `gsap.ticker`.
 */
export function useLenisScroll(): LenisScrollReturn {
  const [currentSceneId, setCurrentSceneId] = useState<SceneId>("void")
  const lastSceneRef = useRef<SceneId>("void")

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(reduced.matches)
    const onReducedChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    reduced.addEventListener("change", onReducedChange)

    const lenis = new Lenis({
      // Inercia mais longa e curva exponencial: a parada e assintotica em vez
      // de cortada, que e o que da a sensacao "deslizando" em vez de "puxando".
      duration: reduced.matches ? 0 : 1.45,
      easing: (t: number) => 1 - Math.pow(2, -10 * t),
      lerp: reduced.matches ? 1 : 0.085,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.6,
      syncTouch: true,
      // A roda em degraus grandes e o que mais quebra a continuidade; isso
      // espalha cada degrau ao longo da inercia.
      smoothWheel: !reduced.matches,
    })

    lenisRef.current = lenis

    // Um relogio para tudo. O Lenis avanca dentro do ticker do GSAP, entao
    // toda escrita de animacao acontece depois da posicao do scroll estar
    // resolvida naquele frame - nunca meio frame atrasada.
    const tick = (time: number, deltaMs: number) => {
      lenis.raf(time * 1000)

      // `lenis.progress` ja e scroll/limit, mas vem NaN enquanto o limite e 0
      // (primeiro frame, antes do layout). O fallback evita um NaN se
      // propagando por todas as poses.
      const progress = Number.isFinite(lenis.progress) ? lenis.progress : 0

      commitMotion(progress, time * 1000, deltaMs / 1000)

      if (motion.sceneId !== lastSceneRef.current) {
        lastSceneRef.current = motion.sceneId
        setCurrentSceneId(motion.sceneId)
      }
    }

    gsap.ticker.add(tick)
    // Sem isso o GSAP "compensa" frames perdidos ao voltar de uma aba
    // inativa, dando um salto visivel na timeline.
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      reduced.removeEventListener("change", onReducedChange)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return { currentSceneId, lenis: lenisRef.current }
}

export function useLenis() {
  return lenisRef.current
}
