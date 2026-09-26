"use client"

import { useEffect, useRef } from "react"
import { clamp01, smootherstep } from "@/config/scenes"
import { subscribeMotion } from "@/lib/motion"

/**
 * Indicador de rolagem.
 *
 * Substitui o bloco que ficava em `page.tsx` com
 * `opacity: scrollProgress > 0.02 ? 1 : 0` mais `transition-opacity`. Aquele
 * padrao produzia um piscar no limiar: qualquer micro-oscilacao do scroll em
 * torno de 0.02 ligava e desligava a transicao de 700ms. Aqui a opacidade e
 * uma rampa continua, entao nao existe limiar para oscilar.
 */
export default function ScrollHint() {
  const rootRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const fill = fillRef.current
    if (!root || !fill) return

    let lastOpacity = -1

    return subscribeMotion((state) => {
      // Entra DEPOIS da abertura sair (que termina em 8.5%) e segue ate 18%.
      // Antes as duas apareciam juntas e diziam a mesma coisa em dois lugares.
      const fadeIn = smootherstep(clamp01((state.scroll - 0.07) / 0.03))
      const fadeOut = smootherstep(1 - clamp01((state.scroll - 0.1) / 0.08))
      const opacity = fadeIn * fadeOut
      if (Math.abs(opacity - lastOpacity) > 0.002) {
        root.style.opacity = opacity.toFixed(4)
        root.style.visibility = opacity > 0.002 ? "visible" : "hidden"
        lastOpacity = opacity
      }
      if (opacity <= 0.002) return

      // Pulso descendo a trilha, por tempo e nao por keyframe CSS, para
      // acompanhar o mesmo relogio do resto da pagina.
      const t = (state.time / 2200) % 1
      const travel = smootherstep(t) * 100
      fill.style.transform = "translate3d(0," + travel.toFixed(2) + "%,0)"
      fill.style.opacity = (1 - t).toFixed(3)
    })
  }, [])

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute bottom-[5vh] left-1/2 z-30 -translate-x-1/2"
      style={{ opacity: 0, willChange: "opacity" }}
      aria-hidden="true"
    >
      {/* Sem rotulo de texto: a abertura ja diz "role para conhecer". Aqui fica
          so a trilha com o pulso, como marcador continuo de rolagem. */}
      <div className="projected-text mono-text text-center">
        <div className="relative mx-auto h-16 w-px overflow-hidden bg-pureWhite/20">
          <div
            ref={fillRef}
            className="absolute left-0 top-0 h-1/3 w-full bg-pureWhite"
            style={{ willChange: "transform, opacity" }}
          />
        </div>
      </div>
    </div>
  )
}
