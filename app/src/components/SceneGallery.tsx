"use client"

import { useEffect, useRef, useState } from "react"
import ProjectMedia from "@/components/ProjectMedia"
import RevealText from "@/components/RevealText"
import { ASPECT_CLASSES, GALLERY_PROJECTS, type Project } from "@/config/projects"
import { clamp01, lerp, smootherstep } from "@/config/scenes"
import { subscribeMotion } from "@/lib/motion"
import { useSceneLayer } from "@/hooks/useSceneLayer"

/*
  260px, nao 320.

  O acervo virou todo 9:16: a 320px de largura o card tem 569px de altura, e
  ancorado em `bottom-[14vh]` ele passava do topo da viewport em qualquer
  notebook de 768px de altura. A 260px sao 462px - cabe, e ainda entra um card
  a mais no percurso horizontal.
*/
const CARD_WIDTH = 260
const GAP = 28
const STRIDE = CARD_WIDTH + GAP

interface SceneGalleryProps {
  activeSceneId: string
  /** Abre o trabalho completo. Chamado so por card com `youtubeId`. */
  onOpenProject: (project: Project) => void
  /**
   * Lightbox aberto. Os loops sao pausados enquanto isso: seis videos
   * decodificando atras de um modal opaco gastam o mesmo frame que o player
   * precisa para comecar.
   */
  lightboxOpen: boolean
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
export default function SceneGallery({
  activeSceneId,
  onOpenProject,
  lightboxOpen,
}: SceneGalleryProps) {
  const active = activeSceneId === "gallery"

  const layerRef = useSceneLayer<HTMLDivElement>("gallery", {
    yFrom: 40,
    blurFrom: 8,
    /*
      `interactive: active`, nao `true`.

      Com `true` o hook decidia sozinho por `weight > 0.65` - um limiar que nao
      coincide exatamente com o `active` que decide MOSTRAR o botao. Dava uma
      faixa de rolagem em que o "ASSISTIR" estava visivel e a camada ainda nao
      recebia ponteiro: o botao aparecia e nao clicava. Agora os dois usam o
      mesmo criterio.
    */
    interactive: active,
  })

  const trackRef = useRef<HTMLDivElement>(null)
  const [focused, setFocused] = useState(0)
  const [lowPower, setLowPower] = useState(false)
  const lowPowerRef = useRef(false)

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
      if (state.lowPower !== lowPowerRef.current) {
        lowPowerRef.current = state.lowPower
        setLowPower(state.lowPower)
      }
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
          blur > 0.1 && !state.prefersReducedMotion && !state.lowPower
            ? "blur(" + blur.toFixed(2) + "px)"
            : "none"
      }

      const nearest = Math.round(smoothCursor)
      if (nearest !== lastFocused) {
        lastFocused = nearest
        setFocused(nearest)
      }
    })
  }, [])

  return (
    /*
      Sem `aria-hidden` aqui: a camada deixou de ser puramente decorativa no
      momento em que os cards viraram botoes. Um controle dentro de uma subarvore
      `aria-hidden` e invisivel para leitor de tela mas continua clicavel e
      focavel - o pior dos dois mundos. As sobreposicoes decorativas de dentro
      seguem marcadas individualmente.
    */
    <div ref={layerRef} className="absolute inset-0">
      <div className="absolute bottom-[14vh] left-0 w-full overflow-hidden">
        <div
          ref={trackRef}
          className="flex items-end will-change-transform"
          style={{ gap: GAP + "px", paddingLeft: "6vw", paddingRight: "6vw" }}
        >
          {GALLERY_PROJECTS.map((proj, i) => {
            const playable = Boolean(proj.youtubeId)
            // So o card em foco recebe o clique. Os vizinhos estao a 35% de
            // opacidade e desfocados: clicar num deles seria sempre acidente.
            const clickable = playable && active && focused === i

            return (
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
                  // Em aparelho fraco, so o card em foco decodifica. Ver a nota
                  // equivalente em `SceneProjection`.
                  active={
                    active && !lightboxOpen && Math.abs(focused - i) <= (lowPower ? 0 : 1)
                  }
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

                {/*
                  O botao cobre o card inteiro e fica acima das sobreposicoes.
                  Projeto sem `youtubeId` nao ganha botao nenhum: uma afordancia
                  de play que nao abre nada e pior do que nao ter afordancia.
                */}
                {playable && (
                  <button
                    type="button"
                    onClick={() => onOpenProject(proj)}
                    tabIndex={clickable ? 0 : -1}
                    aria-label={"Assistir " + proj.title}
                    className="group absolute inset-0 z-10 flex items-center justify-center rounded-[3px] focus:outline-none focus-visible:ring-1 focus-visible:ring-pureWhite"
                    style={{
                      /*
                        `pointer-events` explicito no proprio botao.

                        O palco e `pointer-events-none` e `pointer-events` e uma
                        propriedade HERDADA: sem um `auto` proprio, o botao
                        dependia de a camada da cena ter reativado o ponteiro no
                        ancestral. Declarar aqui torna o alvo de clique
                        independente da composicao das cenas - um descendente com
                        `auto` e clicavel mesmo sob um ancestral `none`.
                      */
                      pointerEvents: clickable ? "auto" : "none",
                      cursor: "none",
                    }}
                  >
                    <span
                      className="mono-text border border-pureWhite/40 px-4 py-2 text-[0.5rem] tracking-[0.35em] text-pureWhite/80 backdrop-blur-[2px] transition-all duration-500 ease-out group-hover:border-pureWhite group-hover:text-pureWhite"
                      style={{
                        // A afordancia aparece so no card em foco. Nos vizinhos
                        // desfocados ela viraria ruido visual.
                        opacity: clickable ? 1 : 0,
                        transition: "opacity 500ms cubic-bezier(0.22, 1, 0.36, 1)",
                      }}
                    >
                      ASSISTIR
                    </span>
                  </button>
                )}
              </article>
            )
          })}
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
