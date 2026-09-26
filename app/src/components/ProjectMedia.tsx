"use client"

import { useEffect, useRef, useState } from "react"

interface ProjectMediaProps {
  videoSrc: string
  poster: string
  title: string
  /** So carrega o video quando a cena esta ativa. */
  active: boolean
  className?: string
}

/**
 * Midia de um projeto: poster sempre presente, video revelado por cima apenas
 * quando comeca a tocar de verdade.
 *
 * Motivo: nenhum `/projects/**.webm` existe no `public/` deste projeto hoje.
 * A versao anterior montava o `<video>` direto, entao a galeria mostrava
 * spinners infinitos e a projecao mostrava um retangulo preto. Pior, um
 * `onError` no video trocava o layout inteiro por um aviso de texto no meio da
 * animacao. Com o poster como camada base o quadro esta sempre composto, e o
 * video, quando existir, entra por crossfade sem mexer no layout.
 */
export default function ProjectMedia({
  videoSrc,
  poster,
  title,
  active,
  className = "",
}: ProjectMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !active || unavailable) return

    // `play()` rejeita silenciosamente quando o arquivo nao existe ou quando a
    // politica de autoplay bloqueia. Em qualquer dos casos ficamos com o
    // poster, que e um estado visual valido.
    const attempt = video.play()
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(() => setUnavailable(true))
    }
  }, [active, unavailable])

  useEffect(() => {
    const video = videoRef.current
    if (!video || active) return
    // Pausar o que saiu de cena: cada video decodificando fora da tela rouba
    // tempo do mesmo frame que precisa desenhar a cena visivel.
    video.pause()
  }, [active])

  return (
    <div className={"relative overflow-hidden " + className}>
      <img
        src={poster}
        alt={title}
        decoding="async"
        loading="lazy"
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {!unavailable && (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            opacity: playing ? 1 : 0,
            transition: "opacity 700ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
          loop
          muted
          playsInline
          preload={active ? "metadata" : "none"}
          poster={poster}
          aria-label={title}
          onPlaying={() => setPlaying(true)}
          onError={() => setUnavailable(true)}
        >
          <source src={videoSrc} type="video/webm" />
          <source src={videoSrc.replace(".webm", ".mp4")} type="video/mp4" />
        </video>
      )}
    </div>
  )
}
