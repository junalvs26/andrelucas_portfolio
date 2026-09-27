"use client"

import { useEffect, useRef, useState } from "react"
import ProjectMedia from "@/components/ProjectMedia"
import RevealText from "@/components/RevealText"
import { ASPECT_CLASSES, COMMERCIAL_PROJECTS, type Project } from "@/config/projects"
import { clamp01, lerp, smootherstep } from "@/config/scenes"
import { subscribeMotion } from "@/lib/motion"
import { useSceneLayer } from "@/hooks/useSceneLayer"


/**
 * Proporcao do quadro da projecao.
 *
 * A cena mantem os quatro projetos empilhados na MESMA caixa para poder fazer
 * crossfade entre eles, entao a proporcao e uma propriedade da cena, nao de
 * cada item. Hoje o acervo e uniformemente 9:16; se um dia entrar um 16:9 nos
 * destaques, ele sera encaixado nesta caixa (`object-cover`) em vez de mudar o
 * tamanho do quadro no meio da transicao.
 */
const FRAME_ASPECT = "9:16" as const

interface SceneProjectionProps {
  activeSceneId: string
  /** Abre o trabalho completo do projeto em foco. */
  onOpenProject: (project: Project) => void
  /** Lightbox aberto: os loops de fundo param de decodificar. */
  lightboxOpen: boolean
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
export default function SceneProjection({
  activeSceneId,
  onOpenProject,
  lightboxOpen,
}: SceneProjectionProps) {
  const active = activeSceneId === "projection"

  const layerRef = useSceneLayer<HTMLDivElement>("projection", {
    scaleFrom: 0.9,
    yFrom: 26,
    blurFrom: 12,
    drift: 0.04,
    // O botao "assistir" vive nesta camada. Ver a nota em `SceneGallery` sobre
    // por que o criterio e `active` e nao o limiar de peso do hook.
    interactive: active,
  })

  const framesRef = useRef<HTMLDivElement>(null)
  const [focused, setFocused] = useState(0)

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
        // 26px, nao 46: o quadro vertical tem ~1/3 da largura do antigo 16:9,
        // e o mesmo deslocamento fazia o vizinho aparecer deslocado meio quadro.
        const offset = (i - cursor) * 26
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
    /* Sem `aria-hidden`: a camada passou a conter um controle real. Ver a nota
       equivalente em `SceneGallery`. */
    <div ref={layerRef} className="absolute inset-0">
      {/*
        O quadro e dimensionado pela ALTURA, nao pela largura.

        O acervo e inteiro 9:16. Com `w-[72vw]` um vertical viraria uma coluna
        de ~1000px de altura numa viewport de 900px: recortado em cima e
        embaixo. `h-[64vh]` com a proporcao do projeto mantem o quadro inteiro
        na tela em qualquer altura de janela, e o resultado le como uma tela de
        celular projetada - que e literalmente o formato do trabalho.

        64vh e nao 80vh porque os metadados ficam acima e abaixo do quadro, e
        eles tambem precisam de espaco.
      */}
      <div
        ref={framesRef}
        className={
          "absolute left-1/2 top-1/2 h-[64vh] -translate-x-1/2 -translate-y-1/2 " +
          (ASPECT_CLASSES[FRAME_ASPECT] ?? "aspect-video")
        }
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
              active={active && !lightboxOpen}
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
        className={
          "pointer-events-none absolute left-1/2 top-1/2 h-[64vh] -translate-x-1/2 -translate-y-1/2 " +
          (ASPECT_CLASSES[FRAME_ASPECT] ?? "aspect-video")
        }
      >
        <div className="absolute -top-9 left-0 mono-text projected-text text-[0.6rem] tracking-[0.35em] text-neonGray">
          <span>{project.category}</span>
          <span className="mx-3 text-pureWhite/30">/</span>
          <span>{project.duration}</span>
        </div>
        {/*
          `whitespace-nowrap`: a caixa acompanha a largura do quadro vertical
          (~360px), e titulo como "EMAGRECIMENTO E ACOMPANHAMENTO" quebraria em
          tres linhas por cima dos indicadores. Transbordar para a direita e o
          comportamento certo aqui - ha vw sobrando dos dois lados.

          `pointer-events-auto` reativa o clique so no botao: o container dos
          metadados e `pointer-events-none` para nao cobrir o quadro.
        */}
        <div className="pointer-events-auto absolute -bottom-10 left-0 flex items-baseline gap-5 whitespace-nowrap">
          <span className="mono-text projected-text text-base font-light tracking-[0.3em]">
            {project.title}
          </span>

          {/*
            O botao fica FORA do quadro, ao lado do titulo, nao sobreposto ao
            video como na galeria. Aqui o quadro ocupa 72vw no centro da tela:
            uma area clicavel desse tamanho no meio do caminho do scroll seria
            acionada por acidente em qualquer arrasto de toque.
          */}
          {project.youtubeId && (
            <button
              type="button"
              onClick={() => onOpenProject(project)}
              aria-label={"Assistir " + project.title}
              // Alvo de clique independente da herança de `pointer-events`.
              style={{ pointerEvents: active ? "auto" : "none", cursor: "none" }}
              className="mono-text cursor-none border-b border-pureWhite/30 pb-0.5 text-[0.5rem] tracking-[0.35em] text-neonGray transition-colors duration-500 ease-out hover:border-pureWhite hover:text-pureWhite focus:outline-none focus-visible:border-pureWhite focus-visible:text-pureWhite"
            >
              ASSISTIR
            </button>
          )}
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
