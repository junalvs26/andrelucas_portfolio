"use client"

import { useEffect, useRef, useState } from "react"
import { asset } from "@/lib/asset"

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

  // Espelho de `active` legivel de dentro de um callback assincrono, que de
  // outra forma veria o valor capturado no momento em que foi criado.
  const activeRef = useRef(active)
  activeRef.current = active

  // Promessa de `play()` ainda pendente. Pausar um video enquanto ela nao
  // resolveu faz o navegador rejeitar com AbortError, e e por isso que ela
  // precisa ser esperada antes de qualquer `pause()`.
  const pendingPlay = useRef<Promise<void> | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || unavailable) return

    /*
      UM efeito para tocar e pausar, nao dois.

      O bug: `play()` devolve uma promessa que so resolve quando a decodificacao
      comeca de fato - dezenas de ms depois, porque com `preload="none"` o
      arquivo ainda vai ser buscado. Havia um segundo efeito que chamava
      `pause()` assim que `active` virava falso, e na galeria `active` inclui
      `Math.abs(focused - i) <= 1`: ele alterna varias vezes por segundo durante
      a rolagem. Entao o `pause()` chegava no meio da promessa pendente, o
      navegador rejeitava com AbortError, e o `catch` antigo tratava isso como
      "arquivo nao existe" e removia o <video> do DOM PARA SEMPRE
      (`setUnavailable(true)`).

      Resultado: na primeira travessia da cena todos os quadros perdiam o video
      e a pagina ficava so com os posters - imagem estatica, nenhum movimento.

      Com um unico efeito, `pause()` e encadeado na promessa pendente em vez de
      competir com ela, e `unavailable` passou a ser decidido so pelo evento
      `error` do elemento, que e o unico sinal de midia realmente invalida.
    */
    if (!active) {
      const stop = () => {
        // Reconferir: `active` pode ter voltado a ser verdadeiro enquanto a
        // promessa resolvia, e pausar aqui mataria o video que acabou de entrar.
        if (videoRef.current && !activeRef.current) videoRef.current.pause()
      }
      const pending = pendingPlay.current
      if (pending) pending.then(stop, stop)
      else stop()
      return
    }

    const attempt = video.play()
    if (attempt && typeof attempt.then === "function") {
      pendingPlay.current = attempt
      attempt.then(
        () => {
          pendingPlay.current = null
        },
        (err: unknown) => {
          pendingPlay.current = null
          const name = err instanceof Error ? err.name : String(err)
          // NotSupportedError e o unico permanente: o navegador nao sabe
          // decodificar nenhum dos <source>. AbortError e NotAllowedError sao
          // transitorios e a proxima entrada em cena tenta de novo.
          if (name === "NotSupportedError") setUnavailable(true)
          if (process.env.NODE_ENV !== "production") {
            console.warn("[ProjectMedia] play() rejeitou em " + videoSrc + ": " + name)
          }
        }
      )
    }
  }, [active, unavailable, videoSrc])

  return (
    <div className={"relative overflow-hidden " + className}>
      <img
        src={asset(poster)}
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
          poster={asset(poster)}
          aria-label={title}
          onPlaying={() => setPlaying(true)}
          onError={(e) => {
            // O `error` do elemento e o sinal confiavel de midia invalida: o
            // navegador ja tentou todos os <source> antes de emitir.
            const el = e.currentTarget
            if (process.env.NODE_ENV !== "production") {
              console.warn(
                "[ProjectMedia] erro de midia em " +
                  videoSrc +
                  " — code " +
                  (el.error?.code ?? "?") +
                  ": " +
                  (el.error?.message || "sem mensagem")
              )
            }
            setUnavailable(true)
          }}
        >
          <source src={asset(videoSrc)} type="video/webm" />
          <source src={asset(videoSrc.replace(".webm", ".mp4"))} type="video/mp4" />
        </video>
      )}
    </div>
  )
}
