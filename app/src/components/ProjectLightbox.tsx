"use client"

import { useEffect, useRef } from "react"
import { ASPECT_CLASSES, type Project } from "@/config/projects"
import { useLenis } from "@/hooks/useLenisScroll"

interface ProjectLightboxProps {
  /** Projeto aberto, ou `null` com o lightbox fechado. */
  project: Project | null
  onClose: () => void
}

/**
 * Player do trabalho completo, por cima da cena.
 *
 * Por que YouTube e nao um arquivo local maior: os videos de `public/projects`
 * sao loops mudos de capa, com ~500 KB cada. Hospedar o corte completo com
 * audio aqui somaria centenas de MB a um site que e `output: 'export'`, sem
 * qualidade adaptativa - num 4G ruim o visitante veria um buffer eterno em vez
 * do trabalho. O YouTube resolve entrega, transcodificacao e qualidade por
 * banda de graca.
 *
 * O custo do embed e pago SO no clique:
 *
 * - O <iframe> nao existe no DOM enquanto `project` e `null`. Um iframe de
 *   YouTube montado junto da pagina traz algumas centenas de KB de JS de
 *   terceiro e bloqueia a main thread - com dez quadros na galeria, seriam dez.
 *   Este e o padrao "fachada": o poster + o loop local SAO a fachada, e o
 *   player real entra depois.
 * - O dominio e `youtube-nocookie.com`, que nao grava cookie de rastreamento
 *   antes de a pessoa dar play.
 * - O `key={project.id}` forca um iframe novo por projeto, entao fechar o
 *   lightbox destroi o player e para o download. Sem isso o audio continuaria
 *   tocando atras da cena.
 *
 * O Lenis tem de ser parado enquanto isso: ele escuta `wheel` no window e
 * traduz em scroll da pagina, entao sem `lenis.stop()` a roda do mouse sobre o
 * player faria a cena de tras andar por baixo do modal.
 */
export default function ProjectLightbox({ project, onClose }: ProjectLightboxProps) {
  const lenis = useLenis()
  const closeRef = useRef<HTMLButtonElement>(null)
  const open = project !== null

  useEffect(() => {
    if (!open) return

    // Parar a inercia, nao so o scroll: o Lenis pode estar no meio de uma
    // animacao de 1.45s quando o clique acontece.
    lenis?.stop()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)

    // O foco vai para o botao de fechar: quem abriu pelo teclado precisa de um
    // alvo dentro do modal, e Esc ja funciona a partir dele.
    closeRef.current?.focus()

    return () => {
      window.removeEventListener("keydown", onKey)
      lenis?.start()
    }
  }, [open, onClose, lenis])

  if (!project || !project.youtubeId) return null

  // `rel=0` mantem as sugestoes do fim dentro do mesmo canal, `modestbranding`
  // reduz a marca sobre o quadro, `playsinline` evita o player nativo em tela
  // cheia no iOS, que jogaria a pessoa fora da pagina.
  const src =
    "https://www.youtube-nocookie.com/embed/" +
    project.youtubeId +
    "?autoplay=1&rel=0&modestbranding=1&playsinline=1&color=white"

  /*
    O player acompanha a proporcao do projeto.

    O acervo e 9:16, e um Short dentro de uma caixa `aspect-video` viraria uma
    tira central com duas tarjas preta ocupando 3/4 da largura - exatamente o
    que o YouTube faz e que a gente pode evitar. Para o vertical a largura e
    derivada da ALTURA disponivel (`78vh * 9/16`), limitada a 92vw para nao
    estourar no celular, onde a janela ja e vertical.
  */
  const vertical = project.aspect === "9:16"
  const shellWidth = vertical
    ? "min(92vw, calc(78vh * 9 / 16))"
    : "min(92vw, 1100px)"

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      /*
        z-[200], nao z-[80].

        O palco em `page.tsx` e `fixed inset-0` SEM z-index, entao ele nao cria
        contexto de empilhamento: os z-index dos filhos dele sobem e competem no
        mesmo contexto que este lightbox. E dentro do palco existem
        `Vignette` (z-99) e `ScanlineOverlay` (z-100) em tela cheia. Com z-80 o
        player abria ATRAS das duas camadas de granulado e vinheta - visivel,
        mas lavado, como se nada tivesse acontecido.

        200 fica acima delas e abaixo do cursor customizado (z-9999), que deve
        continuar por cima.
      */
      className="fixed inset-0 z-[200] flex items-center justify-center bg-void/95 backdrop-blur-sm"
      style={{ animation: "lightboxIn 320ms cubic-bezier(0.22, 1, 0.36, 1) both" }}
      onClick={(e) => {
        // Só o fundo fecha. Sem esta checagem, um clique no proprio player
        // (que e um iframe, mas o wrapper recebe o evento nas bordas) fecharia.
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative" style={{ width: shellWidth }}>
        <div className="mb-3 flex items-end justify-between gap-6">
          <div className="mono-text">
            <p className="text-[0.55rem] tracking-[0.35em] text-neonGray">{project.category}</p>
            <p className="mt-1 text-sm font-light tracking-[0.25em] text-pureWhite">
              {project.title}
            </p>
          </div>

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="mono-text shrink-0 border border-pureWhite/25 px-3 py-1.5 text-[0.55rem] tracking-[0.3em] text-neonGray transition-colors duration-300 hover:border-pureWhite/60 hover:text-pureWhite focus:outline-none focus-visible:border-pureWhite"
          >
            FECHAR · ESC
          </button>
        </div>

        <div
          className={
            "relative w-full overflow-hidden rounded-[3px] border border-pureWhite/20 bg-void " +
            (ASPECT_CLASSES[project.aspect] ?? "aspect-video")
          }
        >
          <iframe
            key={project.id}
            src={src}
            title={project.title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </div>
    </div>
  )
}
