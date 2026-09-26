"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { damp, lerp } from "@/config/scenes"

/**
 * Cursor customizado.
 *
 * Tres problemas na versao anterior:
 *
 * 1. `setCursor(...)` era chamado em TODO `mousemove`. Como o cursor e filho da
 *    pagina, cada movimento de mouse re-renderizava a arvore inteira. Mover o
 *    mouse durante a rolagem duplicava o custo de cada frame.
 *
 * 2. O `style.transform` inline usava `cursor.x`, que nunca saia de zero, ao
 *    mesmo tempo que `gsap.quickTo` escrevia `x`/`y` no mesmo elemento. O React
 *    reescrevia a transform do GSAP em cada render.
 *
 * 3. O CSS tinha `transition: transform 0.1s ease-out` na mesma propriedade que
 *    o GSAP interpolava. Duas suavizacoes empilhadas sobre o mesmo valor e o que
 *    produz aquela sensacao de cursor "molhado", sempre atrasado.
 *
 * Agora nao ha estado React nenhum: o componente escreve direto no DOM, com um
 * unico amortecedor.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.matchMedia("(pointer: coarse)").matches) return

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    let ringX = pointer.x
    let ringY = pointer.y
    let hover = 0
    let hoverTarget = 0
    let opacity = 0
    let opacityTarget = 0
    let magnet: { x: number; y: number; radius: number } | null = null

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
      opacityTarget = 1
    }

    const onLeaveWindow = () => {
      opacityTarget = 0
      magnet = null
      hoverTarget = 0
    }

    // Um unico listener delegado em vez de dois listeners de captura para
    // mouseenter/mouseleave, que disparavam para todo elemento atravessado.
    const onOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null
      const interactive = target?.closest?.("a, button, [data-magnetic], [data-interactive]")
      if (interactive) {
        const rect = interactive.getBoundingClientRect()
        magnet = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          radius: Math.max(rect.width, rect.height) * 0.9,
        }
        hoverTarget = 1
      } else {
        magnet = null
        hoverTarget = 0
      }
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("pointerover", onOver, { passive: true })
    document.addEventListener("pointerleave", onLeaveWindow)

    const tick = (_time: number, deltaMs: number) => {
      const dt = Math.min(deltaMs / 1000, 1 / 20)

      let targetX = pointer.x
      let targetY = pointer.y

      // Atracao magnetica: o anel e puxado para o centro do alvo conforme se
      // aproxima, o que faz elementos clicaveis parecerem "capturar" o cursor.
      if (magnet) {
        const dx = magnet.x - pointer.x
        const dy = magnet.y - pointer.y
        const dist = Math.hypot(dx, dy)
        if (dist < magnet.radius) {
          const strength = (1 - dist / magnet.radius) * 0.45
          targetX += dx * strength
          targetY += dy * strength
        } else {
          magnet = null
          hoverTarget = 0
        }
      }

      // O ponto acompanha o ponteiro sem atraso (precisao), o anel segue com
      // inercia (leitura de movimento). A diferenca entre os dois e o que da a
      // sensacao de mecanismo em vez de sprite.
      const kRing = reduced ? 1 : damp(22, dt)
      ringX = lerp(ringX, targetX, kRing)
      ringY = lerp(ringY, targetY, kRing)

      hover = lerp(hover, hoverTarget, reduced ? 1 : damp(12, dt))
      opacity = lerp(opacity, opacityTarget, damp(14, dt))

      const ringScale = lerp(1, 1.85, hover)
      const dotScale = lerp(1, 0.4, hover)

      dot.style.transform =
        "translate3d(" +
        (pointer.x - 3).toFixed(1) +
        "px," +
        (pointer.y - 3).toFixed(1) +
        "px,0) scale(" +
        dotScale.toFixed(3) +
        ")"
      dot.style.opacity = opacity.toFixed(3)

      ring.style.transform =
        "translate3d(" +
        (ringX - 16).toFixed(1) +
        "px," +
        (ringY - 16).toFixed(1) +
        "px,0) scale(" +
        ringScale.toFixed(3) +
        ")"
      ring.style.opacity = (opacity * lerp(0.45, 0.9, hover)).toFixed(3)
    }

    // Mesmo relogio do resto da pagina, para o cursor nunca ficar meio frame
    // atras do conteudo durante a rolagem.
    gsap.ticker.add(tick)

    return () => {
      gsap.ticker.remove(tick)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerover", onOver)
      document.removeEventListener("pointerleave", onLeaveWindow)
    }
  }, [])

  return (
    <div aria-hidden="true">
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-8 w-8 rounded-full border border-pureWhite"
        style={{ opacity: 0, willChange: "transform, opacity" }}
      />
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-1.5 w-1.5 rounded-full bg-pureWhite"
        style={{ opacity: 0, willChange: "transform, opacity" }}
      />
    </div>
  )
}
