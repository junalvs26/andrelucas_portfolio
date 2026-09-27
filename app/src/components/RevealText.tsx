"use client"

import { CSSProperties, createElement, useEffect, useRef } from "react"
import { SceneId, clamp01, lerp, smootherstep } from "@/config/scenes"
import { subscribeMotion } from "@/lib/motion"

interface RevealTextProps {
  text: string
  /** Cena que dirige a revelacao. */
  sceneId: SceneId
  /** Progresso local da cena em que a revelacao comeca. */
  from?: number
  /** Progresso local em que o ultimo caractere termina. */
  to?: number
  /** Fracao da janela consumida pelo escalonamento entre caracteres. */
  stagger?: number
  /** Distancia vertical de entrada de cada caractere, em px. */
  rise?: number
  /** Desfoque inicial por caractere, em px. */
  blur?: number
  className?: string
  /** Mantem a revelacao ligada a saida da cena tambem (fade out simetrico). */
  holdUntilExit?: boolean
  as?: "p" | "h1" | "h2" | "span" | "div"
}

const EPS = 0.002

/**
 * Texto revelado caractere por caractere conforme o scroll.
 *
 * A pagina antes fazia isso com montagem condicional mais
 * `transition-opacity duration-1000` e um `style={{ opacity }}` calculado no
 * render. Os dois brigavam: o React trocava a opacidade a cada frame e a
 * transicao CSS tentava interpolar cada troca, o que produz um fade que nunca
 * chega ao destino e reinicia sem parar. Aqui nao existe transicao CSS - o
 * valor de cada frame ja e o valor final daquele frame.
 */
export default function RevealText({
  text,
  sceneId,
  from = 0.1,
  to = 0.6,
  stagger = 0.55,
  rise = 26,
  blur = 8,
  className = "",
  holdUntilExit = true,
  as = "p",
}: RevealTextProps) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return

    const chars = Array.from(root.querySelectorAll<HTMLElement>("[data-char]"))
    if (chars.length === 0) return

    const n = chars.length
    const span = Math.max(to - from, 0.0001)
    // Janela de cada caractere: elas se sobrepoem, entao a frase se revela como
    // uma onda continua e nao como letras aparecendo uma a uma em degraus.
    const charWindow = span * (1 - stagger)
    const step = n > 1 ? (span * stagger) / (n - 1) : 0

    const last = new Array(n).fill(-1)

    return subscribeMotion((state) => {
      const w = state.weight[sceneId]
      if (w <= EPS) {
        if (root.style.visibility !== "hidden") {
          root.style.visibility = "hidden"
          root.style.willChange = "auto"
        }
        return
      }
      if (root.style.visibility !== "visible") {
        root.style.visibility = "visible"
        root.style.willChange = "opacity, transform"
      }

      const p = state.progress[sceneId]
      // Fade de saida amarrado ao peso da cena, para o texto sumir junto com o
      // resto da camada em vez de cortar.
      const exit = holdUntilExit ? smootherstep(w) : 1

      for (let i = 0; i < n; i++) {
        const charStart = from + step * i
        const t = smootherstep(clamp01((p - charStart) / charWindow))
        const value = t * exit

        if (Math.abs(value - last[i]) < EPS) continue
        last[i] = value

        const el = chars[i]
        el.style.opacity = value.toFixed(4)
        const y = lerp(rise, 0, t)
        el.style.transform = "translate3d(0," + y.toFixed(2) + "px,0)"

        // Um `filter: blur()` POR CARACTERE: num titulo de 18 letras sao 18
        // camadas desfocadas por frame. E o custo se multiplica pelo numero de
        // textos em cena. Em aparelho fraco fica so a opacidade e o rise.
        if (blur > 0 && !state.prefersReducedMotion && !state.lowPower) {
          const b = lerp(blur, 0, t)
          el.style.filter = b > 0.1 ? "blur(" + b.toFixed(2) + "px)" : "none"
        } else if (el.style.filter !== "none" && el.style.filter !== "") {
          el.style.filter = "none"
        }
      }
    })
  }, [text, sceneId, from, to, stagger, rise, blur, holdUntilExit])

  const chars = Array.from(text).map((ch, i) =>
    createElement(
      "span",
      {
        key: i,
        "data-char": true,
        "aria-hidden": "true",
        style: {
          display: "inline-block",
          opacity: 0,
          // Espaco em branco vira largura fixa: `inline-block` colapsaria o
          // espaco e a frase sairia sem separacao entre palavras.
          whiteSpace: ch === " " ? "pre" : undefined,
          willChange: "opacity, transform",
        } as CSSProperties,
      },
      ch
    )
  )

  // `createElement` em vez de uma tag JSX dinamica: `<Tag />` com `as` tipado
  // como uniao de tags faz o TS montar a uniao de todas as props possiveis, o
  // que estoura o limite de complexidade de tipo (TS2590).
  return createElement(
    as,
    {
      ref,
      className,
      style: { visibility: "hidden" } as CSSProperties,
      "aria-label": text,
    },
    chars
  )
}
