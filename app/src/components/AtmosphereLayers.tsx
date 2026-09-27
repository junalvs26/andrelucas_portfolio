"use client"

import { useEffect, useRef } from "react"
import { SceneId, clamp01, lerp } from "@/config/scenes"
import { subscribeMotion } from "@/lib/motion"
import { asset } from "@/lib/asset"

/**
 * Camadas de atmosfera: nevoa em parallax e plano de chao.
 *
 * Estes assets ja existiam em `public/ui/` desde o inicio do projeto e nenhuma
 * linha de codigo os referenciava - `env_fog_01/02/03.webp` e `env_floor.webp`
 * estavam parados no disco.
 *
 * O que eles resolvem: o personagem era um recorte colado sobre uma foto, sem
 * nada entre ele e o fundo e sem nada sob os pes. Com nevoa em velocidades
 * diferentes surge profundidade real, e como a nevoa passa POR CIMA do
 * background, ela tambem suaviza a ampliacao daquele bitmap de 1920px - o
 * mesmo problema de nitidez, resolvido por direcao de arte em vez de por
 * resolucao.
 */

interface FogLayer {
  src: string
  /** Quanto a camada se desloca ao longo da pagina inteira, em vh. */
  parallax: number
  /** Amplitude da deriva horizontal, em vw. */
  drift: number
  /** Periodo da deriva, em ms. */
  period: number
  /** Opacidade base. */
  opacity: number
  /** Escala fixa - acima de 1 para a deriva nunca revelar a borda da imagem. */
  scale: number
}

/**
 * Tres camadas com velocidades deliberadamente distintas. Parallax so le como
 * profundidade quando as taxas sao bem separadas; valores proximos parecem
 * apenas um borrao tremendo.
 */
const FOG_LAYERS: FogLayer[] = [
  // Fundo: quase parada, larga e difusa.
  { src: "/ui/env_fog_01.webp", parallax: 14, drift: 2.2, period: 41000, opacity: 0.3, scale: 1.25 },
  // Meio: a camada que mais vende a profundidade.
  { src: "/ui/env_fog_02.webp", parallax: 38, drift: 3.6, period: 29000, opacity: 0.22, scale: 1.3 },
  // Frente: rapida e sutil, passa na frente do personagem.
  { src: "/ui/env_fog_03.webp", parallax: 72, drift: 5.0, period: 23000, opacity: 0.16, scale: 1.4 },
]

/**
 * Densidade de nevoa por cena.
 *
 * Nao e decoracao uniforme: o vazio e o renascimento pedem atmosfera densa, a
 * galeria e o processo pedem ar limpo porque ali o conteudo precisa de leitura.
 */
const FOG_BY_SCENE: Record<SceneId, number> = {
  void: 1.35,
  reveal: 1.0,
  projection: 0.75,
  gallery: 0.4,
  process: 0.35,
  rebirth: 1.15,
}

const EPS = 0.002

export default function AtmosphereLayers() {
  const fogRefs = useRef<(HTMLDivElement | null)[]>([])
  const floorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const layers = fogRefs.current.filter(Boolean) as HTMLDivElement[]
    const floor = floorRef.current
    if (layers.length === 0) return

    const lastTransform = new Array(layers.length).fill("")
    const lastOpacity = new Array(layers.length).fill(-1)
    let lastFloor = -1
    let density = 1

    return subscribeMotion((state) => {
      // A densidade e a media ponderada pelos pesos de cena, entao ela varia
      // continuamente na travessia em vez de saltar na troca.
      let target = 0
      let totalWeight = 0
      for (const id of Object.keys(FOG_BY_SCENE) as SceneId[]) {
        const w = state.weight[id]
        if (w <= 0) continue
        target += FOG_BY_SCENE[id] * w
        totalWeight += w
      }
      if (totalWeight > 0) target /= totalWeight

      density = lerp(density, target, state.prefersReducedMotion ? 1 : 0.06)

      for (let i = 0; i < layers.length; i++) {
        const cfg = FOG_LAYERS[i]
        const el = layers[i]

        // Deslocamento vertical pelo scroll global: e o parallax propriamente
        // dito. Multiplicado pelo fator da camada.
        const y = -state.scroll * cfg.parallax

        // Deriva horizontal por tempo, nao por scroll. Nevoa parada quando a
        // pagina esta parada denuncia que e uma imagem; com a deriva ela
        // continua viva mesmo sem interacao.
        const x = state.prefersReducedMotion
          ? 0
          : Math.sin(state.time / cfg.period) * cfg.drift

        const transform =
          "translate3d(" + x.toFixed(3) + "vw," + y.toFixed(3) + "vh,0) scale(" +
          cfg.scale.toFixed(3) + ")"

        if (transform !== lastTransform[i]) {
          el.style.transform = transform
          lastTransform[i] = transform
        }

        const opacity = clamp01(cfg.opacity * density)
        if (Math.abs(opacity - lastOpacity[i]) > EPS) {
          el.style.opacity = opacity.toFixed(4)
          lastOpacity[i] = opacity
        }
      }

      // O chao some quando o personagem recolhe no fim - sem isso ele "voa"
      // sobre um piso que continua la.
      if (floor) {
        const value = clamp01(1 - state.weight.rebirth * 0.9) * clamp01(density * 0.8)
        if (Math.abs(value - lastFloor) > EPS) {
          floor.style.opacity = (value * 0.5).toFixed(4)
          lastFloor = value
        }
      }
    })
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Plano de chao, ancorado na base. Fica atras da nevoa e do personagem. */}
      <div
        ref={floorRef}
        className="absolute inset-x-0 bottom-0 h-[38vh]"
        style={{ opacity: 0, willChange: "opacity" }}
      >
        <img
          src={asset("/ui/env_floor.webp")}
          alt=""
          decoding="async"
          draggable={false}
          className="h-full w-full object-cover object-bottom"
          style={{ mixBlendMode: "screen" }}
        />
      </div>

      {FOG_LAYERS.map((layer, i) => (
        <div
          key={layer.src}
          ref={(el) => {
            fogRefs.current[i] = el
          }}
          className="absolute inset-0"
          style={{
            opacity: 0,
            willChange: "transform, opacity",
            // `screen` sobre preto mantem a nevoa clara sem criar borda escura
            // onde o alfa e parcial, que e o que aconteceria com blend normal.
            mixBlendMode: "screen",
          }}
        >
          <img
            src={asset(layer.src)}
            alt=""
            decoding="async"
            loading={i === 0 ? "eager" : "lazy"}
            draggable={false}
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  )
}
