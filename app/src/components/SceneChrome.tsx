"use client"

import { useEffect, useRef } from "react"
import { SCENES, SceneId, clamp01, lerp, smootherstep } from "@/config/scenes"
import { subscribeMotion } from "@/lib/motion"

/**
 * Moldura persistente: rotulo da cena atual, indice e barra de progresso.
 *
 * Existe para dar continuidade a experiencia. Antes, entre duas cenas, a tela
 * podia ficar completamente vazia por alguns frames, o que fazia a transicao
 * parecer um erro de carregamento em vez de uma passagem.
 */
export default function SceneChrome() {
  const barRef = useRef<HTMLDivElement>(null)
  const indexRef = useRef<HTMLSpanElement>(null)
  const labelWrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const bar = barRef.current
    const indexEl = indexRef.current
    const wrap = labelWrapRef.current
    if (!bar || !indexEl || !wrap) return

    const labels = Array.from(wrap.querySelectorAll<HTMLElement>("[data-scene-label]"))
    const lastOpacity = new Map<string, number>()
    let lastIndexText = ""
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

      const sceneIndex = SCENES.findIndex((s) => s.id === state.sceneId)
      const indexText =
        String(sceneIndex + 1).padStart(2, "0") + " / " + String(SCENES.length).padStart(2, "0")
      if (indexText !== lastIndexText) {
        indexEl.textContent = indexText
        lastIndexText = indexText
      }

      // Os rotulos ficam todos montados e fazem crossfade pelo peso da cena,
      // entao nunca ha um frame sem rotulo na travessia.
      for (const el of labels) {
        const id = el.dataset.sceneLabel as SceneId
        const value = smootherstep(state.weight[id])
        if (Math.abs(value - (lastOpacity.get(id) ?? -1)) < 0.002) continue
        lastOpacity.set(id, value)
        el.style.opacity = value.toFixed(4)
        el.style.transform = "translate3d(0," + lerp(10, 0, value).toFixed(2) + "px,0)"
      }
    })
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 z-30" aria-hidden="true">
      <div className="absolute left-[6vw] top-[6vh] flex items-baseline gap-4">
        <span
          ref={indexRef}
          className="projected-text mono-text text-[0.6rem] tracking-[0.35em] text-pureWhite/70"
        >
          01 / 06
        </span>

        <div ref={labelWrapRef} className="relative h-4 min-w-[15rem]">
          {SCENES.map((scene) => (
            <span
              key={scene.id}
              data-scene-label={scene.id}
              className="mono-text absolute left-0 top-0 whitespace-nowrap text-[0.6rem] tracking-[0.35em] text-neonGray"
              style={{ opacity: 0, willChange: "opacity, transform" }}
            >
              {scene.label}
            </span>
          ))}
        </div>
      </div>

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
