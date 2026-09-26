"use client"

import { useEffect, useRef } from "react"
import RevealText from "@/components/RevealText"
import { clamp01, lerp, smootherstep } from "@/config/scenes"
import { subscribeMotion } from "@/lib/motion"
import { useResizeObserver } from "@/hooks/useRenderLoop"
import { useSceneLayer } from "@/hooks/useSceneLayer"

const TRACKS = ["RITMO", "CORTE", "NARRATIVA", "COR", "SOM"]

/**
 * Cena 05 - timeline de edicao desconstruida.
 *
 * Correcao central: `dimensionsRef` guardava `window.innerWidth * dpr`, ou
 * seja, pixels fisicos, mas o contexto ja tinha `setTransform(dpr, ...)`
 * aplicado. Todo desenho era entao multiplicado por dpr duas vezes: numa tela
 * 2x, a timeline era composta ao dobro do tamanho e ficava quase toda fora do
 * quadro. Agora as dimensoes sao em pixels CSS, como o contexto espera.
 *
 * Alem disso, a animacao antes era puramente temporal (`Math.sin(time/1000)`),
 * o que a deixava indiferente ao scroll: a cena parecia um GIF em loop. Agora a
 * timeline se monta conforme a cena avanca - as trilhas entram uma a uma e o
 * playhead percorre o quadro com a rolagem.
 */
export default function SceneProcess() {
  const layerRef = useSceneLayer<HTMLDivElement>("process", {
    scaleFrom: 0.96,
    yFrom: 20,
    blurFrom: 6,
  })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dimsRef = useRef({ width: 0, height: 0, dpr: 1 })

  useResizeObserver((dims) => {
    dimsRef.current = dims
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return
    canvas.width = Math.round(dims.width * dims.dpr)
    canvas.height = Math.round(dims.height * dims.dpr)
    canvas.style.width = dims.width + "px"
    canvas.style.height = dims.height + "px"
    ctx.setTransform(dims.dpr, 0, 0, dims.dpr, 0, 0)
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    return subscribeMotion((state) => {
      const { width: w, height: h } = dimsRef.current
      if (w === 0 || h === 0) return

      const weight = state.weight.process
      if (weight <= 0.0015) {
        // Limpa uma vez ao sair, depois nao faz mais nada: um canvas de tela
        // cheia limpando a cada frame fora de cena e desperdicio puro de
        // fill rate.
        if (canvas.dataset.dirty === "1") {
          ctx.clearRect(0, 0, w, h)
          canvas.dataset.dirty = "0"
        }
        return
      }
      canvas.dataset.dirty = "1"

      const p = state.progress.process
      const time = state.time

      ctx.clearRect(0, 0, w, h)

      const centerX = w / 2
      const centerY = h * 0.42
      const timelineWidth = Math.min(w * 0.76, 900)
      const left = centerX - timelineWidth / 2
      const trackGap = Math.min(h * 0.052, 44)

      ctx.lineCap = "butt"

      for (let t = 0; t < TRACKS.length; t++) {
        // Entrada escalonada por trilha: a timeline se monta de dentro para
        // fora conforme a cena avanca.
        const trackIn = smootherstep(clamp01((p - t * 0.075) / 0.3))
        if (trackIn <= 0.001) continue

        const y = centerY + (t - (TRACKS.length - 1) / 2) * trackGap
        const halfWidth = (timelineWidth / 2) * trackIn

        ctx.strokeStyle = "rgba(255,255,255," + (0.14 * trackIn).toFixed(3) + ")"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(centerX - halfWidth, y)
        ctx.lineTo(centerX + halfWidth, y)
        ctx.stroke()

        // Clipes da trilha. A largura e determinista por indice (nao oscila no
        // tempo), entao a timeline parece um corte real; so o brilho respira.
        const clips = 7 + t * 2
        const slot = timelineWidth / clips
        for (let c = 0; c < clips; c++) {
          const seed = Math.sin((c + 1) * (t + 2) * 12.9898) * 0.5 + 0.5
          const clipWidth = slot * (0.42 + seed * 0.44)
          const x = left + slot * (c + 0.5)

          if (Math.abs(x - centerX) > halfWidth) continue

          const clipHeight = 3 + t * 1.6
          const shimmer = 0.24 + Math.sin(time / 1300 + c * 1.7 + t) * 0.1
          ctx.fillStyle = "rgba(255,255,255," + (shimmer * trackIn).toFixed(3) + ")"
          ctx.fillRect(x - clipWidth / 2, y - clipHeight / 2, clipWidth, clipHeight)
        }

        // Rotulo da trilha, revelado junto com ela.
        ctx.font = '500 9px "JetBrains Mono", ui-monospace, monospace'
        ctx.textAlign = "right"
        ctx.textBaseline = "middle"
        ctx.fillStyle = "rgba(136,136,153," + (0.7 * trackIn).toFixed(3) + ")"
        ctx.fillText(TRACKS[t], left - 22, y)
      }

      // Playhead dirigido pelo scroll: percorre a timeline conforme a cena
      // avanca, em vez de oscilar em loop proprio.
      const headProgress = smootherstep(clamp01((p - 0.1) / 0.82))
      const playheadX = lerp(left, left + timelineWidth, headProgress)
      const trackSpan = trackGap * (TRACKS.length - 1) / 2 + 26

      ctx.strokeStyle = "rgba(255,255,255,0.8)"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(playheadX, centerY - trackSpan)
      ctx.lineTo(playheadX, centerY + trackSpan)
      ctx.stroke()

      // Cabeca do playhead com halo.
      const glow = ctx.createRadialGradient(playheadX, centerY, 0, playheadX, centerY, 26)
      glow.addColorStop(0, "rgba(255,255,255,0.5)")
      glow.addColorStop(1, "rgba(255,255,255,0)")
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(playheadX, centerY, 26, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = "#ffffff"
      ctx.beginPath()
      ctx.arc(playheadX, centerY - trackSpan, 3, 0, Math.PI * 2)
      ctx.fill()

      // Timecode acompanhando o playhead.
      const totalFrames = Math.round(headProgress * 24 * 90)
      const seconds = Math.floor(totalFrames / 24)
      const timecode =
        "00:" +
        String(Math.floor(seconds / 60)).padStart(2, "0") +
        ":" +
        String(seconds % 60).padStart(2, "0") +
        ":" +
        String(totalFrames % 24).padStart(2, "0")

      ctx.font = '400 10px "JetBrains Mono", ui-monospace, monospace'
      ctx.textAlign = "center"
      ctx.fillStyle = "rgba(255,255,255,0.75)"
      ctx.fillText(timecode, playheadX, centerY - trackSpan - 16)
    })
  }, [])

  return (
    <div ref={layerRef} className="absolute inset-0" aria-hidden="true">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      <div className="absolute bottom-[16vh] left-1/2 -translate-x-1/2 text-center">
        <RevealText
          text="PROCESSO CRIATIVO"
          sceneId="process"
          from={0.3}
          to={0.6}
          rise={14}
          blur={6}
          className="projected-text mono-text text-[0.6rem] tracking-[0.4em] text-neonGray"
        />
        <RevealText
          text="TIMELINE DESCONSTRUIDA · SCRUBBING PRECISO · RITMO CIRURGICO"
          sceneId="process"
          from={0.42}
          to={0.8}
          rise={12}
          blur={5}
          stagger={0.78}
          className="projected-text mono-text mt-3 text-[0.62rem] tracking-[0.24em] text-pureWhite/70"
        />
      </div>

      <div className="absolute right-[6vw] top-[10vh] text-right">
        <RevealText
          text="ANALISE DE PROCESSO"
          sceneId="process"
          from={0.04}
          to={0.34}
          rise={10}
          blur={4}
          stagger={0.7}
          className="projected-text mono-text text-[0.62rem] tracking-[0.35em] text-neonGray"
        />
      </div>
    </div>
  )
}
