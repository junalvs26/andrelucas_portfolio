"use client"

import { useEffect, useRef, useState } from "react"
import ProjectMedia from "@/components/ProjectMedia"
import RevealText from "@/components/RevealText"
import { COMMERCIAL_PROJECTS } from "@/config/projects"
import { clamp01, lerp, smootherstep } from "@/config/scenes"
import { subscribeMotion } from "@/lib/motion"
import { useSceneLayer } from "@/hooks/useSceneLayer"


interface SceneProjectionProps {
  activeSceneId: string
}

/**
 * Cena 03 - o projeto em tela cheia.
 *
 * O que mudou:
 *
 * - O projeto em foco era trocado por `setInterval` de 8s. Isso desalinhava a
 *   troca do scroll: podia trocar no exato frame em que a cena entrava. Agora
 *   o projeto em foco vem do progresso da propria cena, entao rolar percorre
 *   os quatro projetos - a navegacao e a rolagem sao a mesma coisa.
 *
 * - Os quatro quadros ficam montados e fazem crossfade entre si. Antes so
 *   existia um `<video>` cujo `src` era trocado, o que forcava um novo ciclo
 *   de carregamento e um flash preto em cada troca.
 */
export default function SceneProjection({ activeSceneId }: SceneProjectionProps) {
  const layerRef = useSceneLayer<HTMLDivElement>("projection", {
    scaleFrom: 0.9,
    yFrom: 26,
    blurFrom: 12,
    drift: 0.04,
  })

  const framesRef = useRef<HTMLDivElement>(null)
  const [focused, setFocused] = useState(0)
  const active = activeSceneId === "projection"

  useEffect(() => {
    const wrap = framesRef.current
    if (!wrap) return

    const frames = Array.from(wrap.querySelectorAll<HTMLElement>("[data-frame]"))
    const n = frames.length
    if (n === 0) return

    const last = new Array(n).fill(-1)
    let lastFocused = -1

    return subscribeMotion((state) => {
      if (state.weight.projection <= 0.0015) return

      // Posicao continua na lista de projetos, 0..n-1.
      const p = clamp01((state.progress.projection - 0.08) / 0.84)
      const cursor = p * (n - 1)

      for (let i = 0; i < n; i++) {
        // Cada quadro tem seu pico em i e cai linearmente ate os vizinhos, com
        // a curva suavizada. Dois quadros no maximo ficam visiveis ao mesmo
        // tempo, e a soma nunca deixa a tela vazia.
        const d = Math.abs(cursor - i)
        const value = smootherstep(clamp01(1 - d))

        if (Math.abs(value - last[i]) < 0.0015) continue
        last[i] = value

        const el = frames[i]
        el.style.opacity = value.toFixed(4)
        // Quadros vizinhos entram levemente deslocados no eixo Z aparente, o
        // que da profundidade a passagem em vez de um dissolve plano.
        const scale = lerp(0.94, 1, value)
        const offset = (i - cursor) * 46
        el.style.transform =
          "translate3d(" + offset.toFixed(2) + "px,0,0) scale(" + scale.toFixed(4) + ")"
        el.style.visibility = value > 0.0015 ? "visible" : "hidden"
      }

      const nearest = Math.round(cursor)
      if (nearest !== lastFocused) {
        lastFocused = nearest
        setFocused(nearest)
      }
    })
  }, [])

  const project = COMMERCIAL_PROJECTS[focused] ?? COMMERCIAL_PROJECTS[0]

  return (
    <div ref={layerRef} className="absolute inset-0" aria-hidden="true">
      {/*
        Largura maxima 860px, nao `max-w-5xl` (1024px).
        Os posters tem 640x360. A 1024px de largura eram 1.6x de ampliacao num
        painel 1x e 3.2x num painel 2x - um bitmap de 640px esticado para quase
        toda a tela, que e a coisa mais pixelada da pagina. 860px mantem a
        ampliacao em 1.34x, no limite do que nao se percebe.

        Trocar os posters por versoes maiores permite subir este valor.
      */}
      <div
        ref={framesRef}
        className="absolute left-1/2 top-1/2 aspect-video w-[72vw] -translate-x-1/2 -translate-y-1/2"
        style={{ maxWidth: "860px" }}
      >
        {COMMERCIAL_PROJECTS.map((proj) => (
          <div
            key={proj.id}
            data-frame
            className="absolute inset-0"
            style={{ opacity: 0, visibility: "hidden", willChange: "opacity, transform" }}
          >
            <ProjectMedia
              videoSrc={proj.video}
              poster={proj.poster}
              title={proj.title}
              active={active}
              className="h-full w-full rounded-[3px]"
            />
            {/* Moldura de projecao: borda fina mais um halo externo, para o
                quadro parecer luz projetada e nao uma imagem colada. */}
            <div
              className="pointer-events-none absolute inset-0 rounded-[3px] border border-pureWhite/25"
              style={{ boxShadow: "0 0 90px rgba(255,255,255,0.09), inset 0 0 60px rgba(0,0,0,0.5)" }}
            />
            <div className="scanline-overlay pointer-events-none absolute inset-0 rounded-[3px]" />
          </div>
        ))}
      </div>

      {/* Metadados do projeto em foco, ancorados fora do quadro. */}
      <div
        className="absolute left-1/2 top-1/2 w-[72vw] -translate-x-1/2 -translate-y-1/2"
        style={{ maxWidth: "860px" }}
      >
        <div className="absolute -top-9 left-0 mono-text projected-text text-[0.6rem] tracking-[0.35em] text-neonGray">
          <span>{project.category}</span>
          <span className="mx-3 text-pureWhite/30">/</span>
          <span>{project.duration}</span>
        </div>
        <div className="absolute -bottom-10 left-0 mono-text projected-text text-base font-light tracking-[0.3em]">
          {project.title}
        </div>

        {/* Indicadores de posicao. Sao leitura, nao controle: a navegacao aqui
            e o scroll, e um botao que competisse com o scroll brigaria com o
            Lenis. */}
        <div className="absolute -bottom-10 right-0 flex items-center gap-2">
          {COMMERCIAL_PROJECTS.map((proj, i) => (
            <span
              key={proj.id}
              className="h-px transition-all duration-500 ease-out"
              style={{
                width: i === focused ? "28px" : "12px",
                backgroundColor:
                  i === focused ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.25)",
              }}
            />
          ))}
        </div>
      </div>

      <div className="absolute right-[6vw] top-[10vh] text-right">
        <RevealText
          text="TRABALHOS COMERCIAIS"
          sceneId="projection"
          from={0.05}
          to={0.35}
          rise={12}
          blur={5}
          stagger={0.7}
          className="projected-text mono-text text-[0.62rem] tracking-[0.35em] text-neonGray"
        />
      </div>
    </div>
  )
}
