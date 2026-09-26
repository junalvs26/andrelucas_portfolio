"use client"

import { useEffect, useRef, useState } from "react"
import ProjectMedia from "@/components/ProjectMedia"
import RevealText from "@/components/RevealText"
import { ASPECT_CLASSES, GALLERY_PROJECTS } from "@/config/projects"
import { clamp01, lerp, smootherstep } from "@/config/scenes"
import { subscribeMotion } from "@/lib/motion"
import { useSceneLayer } from "@/hooks/useSceneLayer"

const CARD_WIDTH = 320
const GAP = 28
const STRIDE = CARD_WIDTH + GAP

interface SceneGalleryProps {
  activeSceneId: string
}

/**
 * Cena 04 - galeria lateral.
 *
 * Tres problemas graves da versao anterior:
 *
 * 1. A galeria andava com `scrollContainer.scrollLeft = x` a cada frame.
 *    Escrever `scrollLeft` e uma operacao de layout: obriga o navegador a
 *    reavaliar o fluxo do container em todo frame de rolagem, e ainda concorre
 *    com o scroll-snap CSS declarado no mesmo elemento. Agora a trilha e
 *    movida por `translate3d`, que fica no compositor.
 *
 * 2. O `useEffect` que criava o ScrollTrigger tinha `focusedIndex` nas
 *    dependencias e chamava `setFocusedIndex` dentro do proprio `onUpdate`.
 *    Cada troca de foco destruia e recriava o trigger, no meio da animacao.
 *
 * 3. Os cards usavam `transition: transform 0.3s` junto com um transform
 *    dirigido pelo scroll. Uma transicao CSS sobre um valor que muda todo
 *    frame nunca termina - ela reinicia a interpolacao continuamente, e o
 *    resultado e exatamente a sensacao de arrasto emborrachado.
 */
export default function SceneGallery({ activeSceneId }: SceneGalleryProps) {
  const layerRef = useSceneLayer<HTMLDivElement>("gallery", {
    yFrom: 40,
    blurFrom: 8,
  })

  const trackRef = useRef<HTMLDivElement>(null)
  const [focused, setFocused] = useState(0)
  const active = activeSceneId === "gallery"

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const cards = Array.from(track.querySelectorAll<HTMLElement>("[data-card]"))
    const n = cards.length
    if (n === 0) return

    const lastCard = new Array(n).fill("")
    let lastX = Number.NaN
    let lastFocused = -1
    let smoothCursor = 0
    let primed = false

    return subscribeMotion((state) => {
      if (state.weight.gallery <= 0.0015) return

      const viewport = track.parentElement?.clientWidth ?? window.innerWidth
      const travel = Math.max(0, n * STRIDE - GAP - viewport)

      // Curva de percurso com pontas suaves: a galeria comeca e termina
      // parada em vez de entrar em cena ja em movimento.
      const p = smootherstep(clamp01((state.progress.gallery - 0.06) / 0.88))
      const cursorTarget = p * (n - 1)

      if (!primed) {
        smoothCursor = cursorTarget
        primed = true
      }
      smoothCursor = lerp(
        smoothCursor,
        cursorTarget,
        state.prefersReducedMotion ? 1 : 0.14
      )

      const x = -p * travel
      if (Number.isNaN(lastX) || Math.abs(x - lastX) > 0.05) {
        track.style.transform = "translate3d(" + x.toFixed(2) + "px,0,0)"
        lastX = x
      }

      for (let i = 0; i < n; i++) {
        // Foco proximal: o card mais perto do centro do percurso cresce e sai
        // do desfoque. A curva e continua, entao nenhum card "salta" de estado.
        const d = Math.abs(smoothCursor - i)
        const focus = smootherstep(clamp01(1 - d / 1.35))

        const scale = lerp(0.9, 1.04, focus)
        const y = lerp(16, 0, focus)
        const opacity = lerp(0.35, 1, focus)
        const blur = lerp(3.2, 0, focus)

        const transform =
          "translate3d(0," + y.toFixed(2) + "px,0) scale(" + scale.toFixed(4) + ")"
        const key = transform + "|" + opacity.toFixed(3) + "|" + blur.toFixed(2)
        if (key === lastCard[i]) continue
        lastCard[i] = key

        const el = cards[i]
        el.style.transform = transform
        el.style.opacity = opacity.toFixed(3)
        el.style.filter =
          blur > 0.1 && !state.prefersReducedMotion ? "blur(" + blur.toFixed(2) + "px)" : "none"
      }

      const nearest = Math.round(smoothCursor)
      if (nearest !== lastFocused) {
        lastFocused = nearest
        setFocused(nearest)
      }
    })
  }, [])

  return (
    <div ref={layerRef} className="absolute inset-0" aria-hidden="true">
      <div className="absolute bottom-[14vh] left-0 w-full overflow-hidden">
        <div
          ref={trackRef}
          className="flex items-end will-change-transform"
          style={{ gap: GAP + "px", paddingLeft: "6vw", paddingRight: "6vw" }}
        >
          {GALLERY_PROJECTS.map((proj, i) => (
            <article
              key={proj.id}
              data-card
              className={
                "relative flex-shrink-0 " + (ASPECT_CLASSES[proj.aspect] ?? "aspect-video")
              }
              style={{
                width: CARD_WIDTH + "px",
                // Sem `transition`: o valor e dirigido pelo scroll e reescrito
                // a cada frame, ja no seu valor final.
                willChange: "transform, opacity, filter",
                transformOrigin: "50% 100%",
              }}
            >
              <ProjectMedia
                videoSrc={proj.video}
                poster={proj.poster}
                title={proj.title}
                active={active && Math.abs(focused - i) <= 1}
                className="h-full w-full rounded-[3px]"
              />

              <div className="pointer-events-none absolute inset-0 rounded-[3px] border border-pureWhite/20" />
              <div className="scanline-overlay pointer-events-none absolute inset-0 rounded-[3px]" />
              <div className="pointer-events-none absolute inset-0 rounded-[3px] bg-gradient-to-t from-void/85 via-void/10 to-transparent" />

              <div className="pointer-events-none absolute bottom-4 left-4 right-4 projected-text mono-text">
                <p className="mb-1 text-[0.55rem] tracking-[0.35em] text-neonGray">
                  {proj.category}
                </p>
                <p className="truncate text-xs font-light tracking-[0.25em]">{proj.title}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="absolute left-[6vw] top-[10vh]">
        <RevealText
          text="GALERIA PROJETADA"
          sceneId="gallery"
          from={0.04}
          to={0.34}
          rise={12}
          blur={5}
          stagger={0.7}
          className="projected-text mono-text text-[0.62rem] tracking-[0.35em] text-neonGray"
        />
      </div>

      <div className="absolute right-[6vw] top-[10vh] text-right">
        <RevealText
          text="REDES SOCIAIS · EVENTOS · CORPORATIVO"
          sceneId="gallery"
          from={0.12}
          to={0.46}
          rise={10}
          blur={4}
          stagger={0.75}
          className="projected-text mono-text text-[0.55rem] tracking-[0.3em] text-neonGray"
        />
      </div>
    </div>
  )
}
