"use client"

import { useEffect, useRef } from "react"
import { lerp } from "@/config/scenes"
import { subscribeMotion } from "@/lib/motion"
import { useReducedMotion } from "@/hooks/useReducedMotion"

/**
 * Vinheta.
 *
 * Era um canvas redesenhado a cada resize. Um gradiente radial estatico nao
 * precisa de canvas nenhum - isso e um `radial-gradient` em CSS, que o
 * compositor resolve sem alocar um bitmap do tamanho da tela nem gastar um
 * `createRadialGradient` por resize.
 *
 * O que o canvas nao dava e o que ganhamos aqui: a vinheta fecha um pouco
 * conforme a rolagem acelera, como uma lente abrindo. E o mesmo truque de
 * linguagem de camera que faz uma transicao rapida parecer intencional em vez
 * de brusca.
 */
export default function Vignette() {
  const prefersReducedMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefersReducedMotion) return
    const el = ref.current
    if (!el) return

    let current = 0
    let last = -1

    return subscribeMotion((state) => {
      current = lerp(current, state.speed, 0.08)
      if (Math.abs(current - last) < 0.004) return
      last = current

      // Mais velocidade, vinheta mais fechada e escura.
      const inner = lerp(48, 32, current)
      const alpha = lerp(0.62, 0.8, current)
      el.style.background =
        "radial-gradient(ellipse at center, rgba(0,0,0,0) " +
        inner.toFixed(1) +
        "%, rgba(0,0,0," +
        (alpha * 0.35).toFixed(3) +
        ") 74%, rgba(0,0,0," +
        alpha.toFixed(3) +
        ") 100%)"
    })
  }, [prefersReducedMotion])

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 z-[99]"
      aria-hidden="true"
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(0,0,0,0) 48%, rgba(0,0,0,0.217) 74%, rgba(0,0,0,0.62) 100%)",
      }}
    />
  )
}
