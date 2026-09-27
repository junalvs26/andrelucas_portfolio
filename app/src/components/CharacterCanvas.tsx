"use client"

import { useEffect, useRef } from "react"
import { clamp01, damp, lerp, smootherstep } from "@/config/scenes"
import { subscribeMotion } from "@/lib/motion"
import { useResizeObserver } from "@/hooks/useRenderLoop"

type SequenceName =
  | "idle"
  | "walk"
  | "turn"
  | "projecting"
  | "observing"
  | "lateral"
  | "sit"
  | "scale"

const FRAME_COUNTS: Record<SequenceName, number> = {
  idle: 2,
  walk: 12,
  turn: 8,
  projecting: 6,
  observing: 4,
  lateral: 8,
  sit: 6,
  scale: 10,
}

interface StateConfig {
  sequence: SequenceName
  loop: boolean
  /** Frames por segundo da sequencia. */
  fps: number
  /** Duracao do crossfade ao entrar neste estado, em segundos. */
  blend: number
}

const STATE_MAP: Record<string, StateConfig> = {
  glasses_activating: { sequence: "idle", loop: true, fps: 2, blend: 0.55 },
  turning_to_camera: { sequence: "turn", loop: false, fps: 10, blend: 0.6 },
  idle: { sequence: "idle", loop: true, fps: 2.5, blend: 0.6 },
  walking_forward: { sequence: "walk", loop: true, fps: 14, blend: 0.45 },
  posing_projecting: { sequence: "projecting", loop: false, fps: 9, blend: 0.6 },
  projecting_active: { sequence: "projecting", loop: true, fps: 5, blend: 0.5 },
  observing_projection: { sequence: "observing", loop: true, fps: 4, blend: 0.6 },
  walking_lateral: { sequence: "lateral", loop: true, fps: 12, blend: 0.45 },
  observing_gallery: { sequence: "observing", loop: true, fps: 3.5, blend: 0.6 },
  sitting_leaning: { sequence: "sit", loop: false, fps: 7, blend: 0.7 },
  receding: { sequence: "scale", loop: false, fps: 8, blend: 0.7 },
  rebirth_pulse: { sequence: "idle", loop: true, fps: 1.6, blend: 0.7 },
}

const FRONT_SEQUENCES: SequenceName[] = ["idle", "walk", "projecting", "observing"]

/**
 * Ampliacao maxima do sprite em relacao aos pixels reais da imagem.
 *
 * Os frames tem 720x1280. Enquadrar pela altura da viewport num painel 2x pede
 * cerca de 2000px fisicos de altura, ou seja, 1.55x de ampliacao - e ampliacao
 * de bitmap acima de ~1.35x fica visivelmente mole. Com este teto o personagem
 * aparece um pouco menor em telas de alta densidade em vez de aparecer borrado,
 * que e a troca certa: ninguem percebe 8% de tamanho, todo mundo percebe
 * interpolacao.
 *
 * Substituir isso por frames maiores remove o teto sozinho, sem mudar o codigo.
 */
const MAX_SPRITE_UPSCALE = 1.35

interface Sequences {
  frames: Record<SequenceName, (HTMLImageElement | null)[]>
  glow: HTMLImageElement | null
}

/**
 * Carrega as sequencias de sprite.
 *
 * A versao anterior fazia `frames[seq].push(img)` dentro do `onload`, entao a
 * ordem do array era a ordem de RESPOSTA DA REDE, nao a ordem dos frames. Na
 * pratica toda animacao com mais de dois frames rodava embaralhada, o que
 * sozinho explica boa parte da aparencia de animacao quebrada. Aqui cada
 * imagem e escrita no proprio indice.
 */
async function loadSequences(): Promise<Sequences> {
  const frames = {} as Record<SequenceName, (HTMLImageElement | null)[]>
  const jobs: Promise<void>[] = []

  const load = (src: string) =>
    new Promise<HTMLImageElement | null>((resolve) => {
      const img = new Image()
      img.decoding = "async"
      img.onload = () => resolve(img)
      img.onerror = () => resolve(null)
      img.src = src
    })

  for (const name of Object.keys(FRAME_COUNTS) as SequenceName[]) {
    const count = FRAME_COUNTS[name]
    frames[name] = new Array(count).fill(null)
    for (let i = 0; i < count; i++) {
      const src =
        "/character/frames/" + name + "_" + String(i + 1).padStart(2, "0") + ".webp"
      jobs.push(
        load(src).then((img) => {
          frames[name][i] = img
        })
      )
    }
  }

  let glow: HTMLImageElement | null = null
  jobs.push(
    load("/ui/glasses_glow.webp").then((img) => {
      glow = img
    })
  )

  await Promise.all(jobs)
  return { frames, glow }
}

interface DrawFrame {
  img: HTMLImageElement
  /** Posicao fracionaria dentro da sequencia, para crossfade entre frames. */
  cursor: number
}

interface Pose {
  x: number
  y: number
  scale: number
  lean: number
}

export default function CharacterCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const seqRef = useRef<Sequences | null>(null)
  const dimsRef = useRef({ width: 0, height: 0, dpr: 1 })

  useEffect(() => {
    let alive = true
    loadSequences().then((s) => {
      if (alive) seqRef.current = s
    })
    return () => {
      alive = false
    }
  }, [])

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
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    // Estado de animacao vive aqui, fora do React, e avanca por tempo
    // decorrido - nunca por indice derivado do scroll. Assim o ciclo de
    // caminhada tem cadencia propria e nao acelera nem congela com a roda.
    let currentState = ""
    let sequenceTime = 0

    let prevState = ""
    let prevSequenceTime = 0
    let blend = 1
    let blendDuration = 0.5

    // Amortecedores de pose: mesmo com o scroll suavizado, deixar a pose
    // perseguir o alvo com constante propria remove o ultimo residuo de
    // degrau e cria o atraso inercial que le como peso.
    let px = 0
    let py = 0
    let pscale = 0.72
    let palpha = 0
    let pblur = 14
    let plean = 0
    let initialised = false
    let lastFilter = ""


    const pickFrame = (
      seq: Sequences,
      stateName: string,
      elapsed: number
    ): DrawFrame | null => {
      const cfg = STATE_MAP[stateName] || STATE_MAP.idle
      const list = seq.frames[cfg.sequence]
      if (!list || list.length === 0) return null

      const raw = elapsed * cfg.fps
      const cursor = cfg.loop ? raw % list.length : Math.min(raw, list.length - 1)

      const index = Math.floor(cursor)
      const img = list[index] || list.find((f) => f) || null
      if (!img) return null
      return { img, cursor }
    }

    const drawSprite = (
      frame: DrawFrame,
      seq: Sequences,
      stateName: string,
      alpha: number,
      w: number,
      h: number,
      pose: Pose,
      glowAmount: number,
      time: number
    ) => {
      const cfg = STATE_MAP[stateName] || STATE_MAP.idle
      const list = seq.frames[cfg.sequence]

      const base = Math.min(w / frame.img.width, h / frame.img.height)

      // O teto e calculado em pixels FISICOS: o que borra e a razao entre
      // pixels da textura e pixels do painel, nao a medida em CSS.
      const dpr = dimsRef.current.dpr
      const maxScale = MAX_SPRITE_UPSCALE / dpr
      const scale = Math.min(base * pose.scale, maxScale)

      const drawW = frame.img.width * scale
      const drawH = frame.img.height * scale
      const x = (w - drawW) / 2 + pose.x * w
      const y = h - drawH - h * 0.06 + pose.y * h

      ctx.save()

      // ---- Sombra de contato -------------------------------------------
      // Desenhada ANTES do sprite e dentro do mesmo canvas, entao ela nunca
      // perde o alinhamento com os pes - um elemento DOM separado teria que
      // perseguir a posicao do sprite a cada frame e chegaria sempre atrasado.
      //
      // Sem isso o personagem flutua: nao havia nada indicando contato com o
      // chao, e e o que mais faz uma figura parecer adesivo colado no fundo.
      if (alpha > 0.01) {
        const footY = y + drawH
        // Mais perto (escala maior) = sombra mais estreita e mais densa.
        const tightness = clamp01((pose.scale - 0.2) / 0.8)
        const shadowW = drawW * lerp(0.62, 0.38, tightness)
        const shadowH = shadowW * 0.17

        const grad = ctx.createRadialGradient(
          x + drawW / 2, footY, 0,
          x + drawW / 2, footY, shadowW / 2
        )
        const density = lerp(0.3, 0.62, tightness) * alpha
        grad.addColorStop(0, "rgba(0,0,0," + density.toFixed(3) + ")")
        grad.addColorStop(0.55, "rgba(0,0,0," + (density * 0.45).toFixed(3) + ")")
        grad.addColorStop(1, "rgba(0,0,0,0)")

        ctx.save()
        ctx.translate(x + drawW / 2, footY)
        ctx.scale(1, shadowH / (shadowW / 2) / 2)
        ctx.translate(-(x + drawW / 2), -footY)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(x + drawW / 2, footY, shadowW / 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // Inclinacao proporcional a velocidade do scroll. E sutil (menos de dois
      // graus) mas e o que faz o personagem parecer reagir ao movimento em vez
      // de ser uma figura recortada deslizando.
      if (Math.abs(pose.lean) > 0.001) {
        ctx.translate(x + drawW / 2, y + drawH)
        ctx.rotate(pose.lean)
        ctx.translate(-(x + drawW / 2), -(y + drawH))
      }

      // Crossfade entre frames consecutivos da MESMA sequencia. Sem isso a
      // sequencia idle (dois frames) pisca entre duas imagens; com isso ela
      // respira. Custa um drawImage extra apenas na fracao de transicao.
      const frac = frame.cursor - Math.floor(frame.cursor)
      const nextIndex = cfg.loop
        ? (Math.floor(frame.cursor) + 1) % list.length
        : Math.min(Math.floor(frame.cursor) + 1, list.length - 1)
      const nextImg = list[nextIndex]

      if (nextImg && nextImg !== frame.img && frac > 0.01) {
        const t = smootherstep(frac)
        ctx.globalAlpha = alpha * (1 - t)
        ctx.drawImage(frame.img, x, y, drawW, drawH)
        ctx.globalAlpha = alpha * t
        ctx.drawImage(nextImg, x, y, drawW, drawH)
      } else {
        ctx.globalAlpha = alpha
        ctx.drawImage(frame.img, x, y, drawW, drawH)
      }

      // Brilho dos oculos por composicao aditiva, com respiracao lenta.
      if (seq.glow && glowAmount > 0.01 && FRONT_SEQUENCES.includes(cfg.sequence)) {
        const glowW = drawW * 0.36
        const glowH = drawH * 0.1
        const glowX = x + drawW * 0.51 - glowW / 2
        const glowY = y + drawH * 0.175 - glowH / 2

        const breathe = 0.82 + Math.sin(time / 1400) * 0.18
        ctx.globalCompositeOperation = "lighter"
        ctx.globalAlpha = alpha * glowAmount * breathe * 0.55
        ctx.drawImage(seq.glow, glowX, glowY, glowW, glowH)
        ctx.globalCompositeOperation = "source-over"

        /*
          O feixe NAO e desenhado por codigo.

          Ele ja vem pintado nos sprites de `observing` e `projecting_05/06`,
          na perspectiva certa e preso aos oculos. Desenhar um segundo por
          cima dava dois cones em angulos diferentes. O que o codigo fazia de
          util - impedir o corte reto na borda do arquivo - foi resolvido nos
          proprios .webp, cuja nevoa agora termina em degrade.
        */
      }

      ctx.globalAlpha = 1
      ctx.restore()
    }

    return subscribeMotion((state) => {
      const seq = seqRef.current
      const { width: w, height: h } = dimsRef.current
      if (w === 0 || h === 0) return

      const dt = state.dt
      const target = state.pose

      if (!initialised) {
        px = target.x
        py = target.y
        pscale = target.scale
        palpha = target.alpha
        pblur = target.blur
        initialised = true
      }

      const k = state.prefersReducedMotion ? 1 : damp(9, dt)
      px = lerp(px, target.x, k)
      py = lerp(py, target.y, k)
      pscale = lerp(pscale, target.scale, k)
      palpha = lerp(palpha, target.alpha, k)
      pblur = lerp(pblur, target.blur, k)

      const leanTarget = state.prefersReducedMotion
        ? 0
        : clamp01(state.speed) * 0.028 * state.direction
      plean = lerp(plean, leanTarget, damp(6, dt))

      // Troca de estado de sprite: a sequencia antiga continua avancando
      // durante o crossfade em vez de congelar no frame 0, que era o que
      // produzia o solavanco a cada troca de estado na versao anterior.
      if (state.characterState !== currentState) {
        const cfg = STATE_MAP[state.characterState] || STATE_MAP.idle
        if (currentState) {
          prevState = currentState
          prevSequenceTime = sequenceTime
          blend = 0
          blendDuration = state.prefersReducedMotion ? 0.01 : cfg.blend
        }
        currentState = state.characterState
        sequenceTime = 0
      }

      sequenceTime += dt
      if (blend < 1) {
        prevSequenceTime += dt
        blend = clamp01(blend + dt / blendDuration)
      }

      // O desfoque roda como filtro CSS no elemento, nao como `ctx.filter`.
      // `ctx.filter` reprocessa o bitmap a cada frame; o filtro CSS e
      // resolvido pelo compositor.
      const blurPx = state.prefersReducedMotion || state.lowPower ? 0 : pblur
      const filter = blurPx > 0.08 ? "blur(" + blurPx.toFixed(2) + "px)" : "none"
      if (filter !== lastFilter) {
        canvas.style.filter = filter
        lastFilter = filter
      }

      ctx.clearRect(0, 0, w, h)
      if (!seq || palpha <= 0.002) return

      const pose: Pose = { x: px, y: py, scale: pscale, lean: plean }
      const glowAmount = target.glow

      if (blend < 1 && prevState) {
        const outFrame = pickFrame(seq, prevState, prevSequenceTime)
        if (outFrame) {
          const t = smootherstep(blend)
          drawSprite(
            outFrame,
            seq,
            prevState,
            palpha * (1 - t),
            w,
            h,
            pose,
            glowAmount,
            state.time
          )
        }
      }

      const inFrame = pickFrame(seq, currentState, sequenceTime)
      if (inFrame) {
        const t = blend < 1 ? smootherstep(blend) : 1
        drawSprite(
          inFrame,
          seq,
          currentState,
          palpha * t,
          w,
          h,
          pose,
          glowAmount,
          state.time
        )
      }

    })
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
      style={{ willChange: "filter" }}
    />
  )
}
