"use client"

import { useEffect, useRef } from "react"
import { SCENES, SceneId, lerp } from "@/config/scenes"
import { subscribeMotion } from "@/lib/motion"
import { asset } from "@/lib/asset"

const BACKDROPS: Record<SceneId, string> = {
  void: "/backgrounds/scene_01_void.webp",
  reveal: "/backgrounds/scene_02_reveal.webp",
  projection: "/backgrounds/scene_03_projection.webp",
  gallery: "/backgrounds/scene_04_gallery.webp",
  process: "/backgrounds/scene_05_process.webp",
  rebirth: "/backgrounds/scene_06_rebirth.webp",
}

const BASE_OPACITY = 0.9
const EPS = 0.0015

/**
 * Fundos em crossfade continuo.
 *
 * A versao anterior tinha dois problemas que juntos produziam quase todo o
 * travamento da pagina:
 *
 * 1. `lenis.on("scroll", () => ScrollTrigger.refresh())`. `refresh()` remede a
 *    posicao de todos os triggers da pagina e forca layout sincrono. Rodava a
 *    cada evento de scroll, varias vezes por frame.
 *
 * 2. Os ScrollTriggers usavam `start: "top top+=20%"`, que e 20% da ALTURA DA
 *    VIEWPORT, nao 20% do scroll. Com a pagina de varias viewports, todos os
 *    seis crossfades terminavam dentro da primeira rolagem e depois os fundos
 *    ficavam parados.
 *
 * Agora a opacidade vem direto do peso de cena, ja com overlap, e o ScrollTrigger
 * nao participa. Cada fundo ainda ganha um zoom lento de parallax para o quadro
 * nunca ficar estatico.
 */
export default function SceneBackdrop() {
  const containerRef = useRef<HTMLDivElement>(null)
  const layersRef = useRef<Partial<Record<SceneId, HTMLDivElement | null>>>({})

  useEffect(() => {
    const entries = SCENES.map((scene) => {
      const id = scene.id as SceneId
      return { id, el: layersRef.current[id] }
    }).filter((e): e is { id: SceneId; el: HTMLDivElement } => Boolean(e.el))

    const last = new Map<SceneId, { opacity: number; transform: string }>()
    for (const { id, el } of entries) {
      el.style.opacity = "0"
      el.style.visibility = "hidden"
      last.set(id, { opacity: 0, transform: "" })
    }

    return subscribeMotion((state) => {
      for (const { id, el } of entries) {
        const w = state.weight[id]
        const cached = last.get(id)!

        const visible = w > EPS
        if (visible !== cached.opacity > EPS) {
          el.style.visibility = visible ? "visible" : "hidden"
          el.style.willChange = visible ? "opacity, transform" : "auto"
        }

        const opacity = w * BASE_OPACITY
        if (Math.abs(opacity - cached.opacity) > EPS) {
          el.style.opacity = opacity.toFixed(4)
          cached.opacity = opacity
        }

        if (!visible) continue

        // Deriva lenta ao longo da cena. O movimento vem sobretudo do
        // deslocamento vertical, nao do zoom.
        //
        // O zoom era 1.06 -> 1.14 mais um empurrao por velocidade. Os fundos tem
        // 1920x1080, ou seja, num painel 2x de largura equivalente eles ja
        // chegam a tela a 2x de ampliacao so pelo `object-cover`; os 14% extras
        // empilhavam em cima disso. Agora o zoom vai so ate 1.04, e o empurrao
        // por velocidade saiu - ele custava nitidez exatamente nos momentos de
        // rolagem rapida, que e quando o efeito menos se percebe.
        const p = state.progress[id]
        const zoom = lerp(1.0, 1.04, p)
        const shift = lerp(-1.8, 1.8, p) * (state.prefersReducedMotion ? 0 : 1)
        const transform =
          "translate3d(0," + shift.toFixed(2) + "%,0) scale(" + zoom.toFixed(4) + ")"

        if (transform !== cached.transform) {
          el.style.transform = transform
          cached.transform = transform
        }
      }
    })
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 -z-10 bg-void" aria-hidden="true">
      {SCENES.map((scene) => {
        const id = scene.id as SceneId
        return (
          <div
            key={id}
            ref={(el) => {
              layersRef.current[id] = el
            }}
            className="absolute inset-0"
            style={{ opacity: 0, backfaceVisibility: "hidden" }}
          >
            <img
              src={asset(BACKDROPS[id])}
              alt=""
              decoding="async"
              loading={id === "void" || id === "reveal" ? "eager" : "lazy"}
              className="h-full w-full object-cover"
              draggable={false}
            />
          </div>
        )
      })}

      {/* Graduacao suave por cima dos fundos: mantem o contraste do texto
          projetado constante mesmo quando duas imagens estao em crossfade. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void/50 via-transparent to-void/80" />
    </div>
  )
}
