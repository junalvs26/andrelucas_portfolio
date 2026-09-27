"use client"

import { useEffect, useRef } from "react"
import { clamp01, lerp } from "@/config/scenes"
import { subscribeMotion } from "@/lib/motion"

/**
 * Moldura persistente: a barra de progresso na base da tela.
 *
 * Existe para dar continuidade a experiencia. Entre duas cenas a tela pode
 * ficar quase vazia por alguns frames, e sem nenhum elemento persistente a
 * transicao parece um erro de carregamento em vez de uma passagem.
 *
 * O indicador "01 / 06" e o rotulo "CENA 0X - NOME" foram removidos: nomear a
 * cena e linguagem de storyboard, util enquanto se constroi a sequencia e
 * ruido para quem so quer ver o trabalho. A barra sozinha ja responde a unica
 * pergunta que o visitante faz - quanto falta.
 */
export default function SceneChrome() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    let smoothProgress = 0
    let lastScale = -1

    return subscribeMotion((state) => {
      // A barra segue o scroll suavizado com um leve atraso proprio: ela chega
      // ao destino depois do conteudo, o que da a leitura de inercia.
      smoothProgress = lerp(smoothProgress, state.scroll, state.prefersReducedMotion ? 1 : 0.12)
      const scaleX = clamp01(smoothProgress)
      if (Math.abs(scaleX - lastScale) > 0.001) {
        bar.style.transform = "scaleX(" + scaleX.toFixed(4) + ")"
        lastScale = scaleX
      }
    })
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 z-30" aria-hidden="true">
      {/* Trilha de progresso na base da tela. */}
      <div className="absolute bottom-0 left-0 h-px w-full bg-pureWhite/10">
        <div
          ref={barRef}
          className="h-full w-full origin-left bg-gradient-to-r from-neonGray via-pureWhite to-pureWhite"
          style={{ transform: "scaleX(0)", willChange: "transform" }}
        />
      </div>
    </div>
  )
}
