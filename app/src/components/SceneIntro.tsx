"use client"

import { useEffect, useRef } from "react"
import { clamp01, lerp, smootherstep } from "@/config/scenes"
import { subscribeMotion } from "@/lib/motion"

/**
 * Texto de abertura. Trocar aqui muda a primeira coisa que o visitante le.
 */
const EYEBROW = "PORTFÓLIO"
const HEADLINE = "VOCÊ ESTÁ PRONTO?"
const SUBLINE = "ROLE PARA CONHECER O TRABALHO"

/** Quando a abertura termina de sair, em progresso de scroll global. */
const EXIT_AT = 0.085

/**
 * Abertura da pagina.
 *
 * Por que precisa existir separada das outras cenas: tudo nesta pagina e
 * dirigido por scroll, e em `scroll = 0` todo progresso de cena e 0 - entao
 * qualquer texto com `RevealText` comeca invisivel. Resultado: quem abria o site
 * via uma tela preta e nao tinha nenhuma indicacao de que era preciso rolar.
 *
 * A abertura e o unico momento da pagina que NAO pode depender do scroll, pela
 * razao obvia de que ela e o que convence a rolar. Entao a entrada aqui roda por
 * TEMPO (uma animacao de uma vez so, ao carregar) e so a SAIDA e dirigida pelo
 * scroll. Os dois se multiplicam, e por isso a abertura pode ser interrompida a
 * qualquer momento: se a pessoa rolar durante a entrada, o texto sai de onde
 * estiver, sem esperar a animacao terminar.
 */
export default function SceneIntro() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const chars = Array.from(root.querySelectorAll<HTMLElement>("[data-char]"))
    const cue = root.querySelector<HTMLElement>("[data-cue]")
    if (chars.length === 0) return

    // Atraso de cada caractere, lido do DOM uma vez.
    const delays = chars.map((el) => Number(el.dataset.delay ?? 0))
    const durations = chars.map((el) => Number(el.dataset.duration ?? 0.9))
    const rises = chars.map((el) => Number(el.dataset.rise ?? 24))

    const last = new Array(chars.length).fill(-1)
    let elapsed = 0
    let visible = true

    return subscribeMotion((state) => {
      // Saida por scroll. `EXIT_AT` e bem antes do fim da cena "void" para a
      // abertura nao competir com o titulo que entra na cena seguinte.
      const exit = smootherstep(1 - clamp01(state.scroll / EXIT_AT))

      const shouldBeVisible = exit > 0.002
      if (shouldBeVisible !== visible) {
        visible = shouldBeVisible
        root.style.visibility = visible ? "visible" : "hidden"
        root.style.willChange = visible ? "opacity" : "auto"
      }
      if (!visible) return

      // A entrada avanca por tempo. Nao usa `state.time` direto porque esse e o
      // relogio da pagina, nao o tempo desde a montagem deste componente.
      if (elapsed < 4) elapsed += state.dt

      for (let i = 0; i < chars.length; i++) {
        const t = state.prefersReducedMotion
          ? 1
          : smootherstep(clamp01((elapsed - delays[i]) / durations[i]))

        const value = t * exit
        if (Math.abs(value - last[i]) < 0.002) continue
        last[i] = value

        const el = chars[i]
        el.style.opacity = value.toFixed(4)

        // Na entrada o caractere sobe; na saida ele e empurrado para cima junto
        // com o resto da camada. Os dois deslocamentos se somam, entao a saida
        // continua de onde a entrada parou.
        const y = lerp(rises[i], 0, t) - (1 - exit) * 18
        const blur = lerp(10, 0, t) + (1 - exit) * 6

        el.style.transform = "translate3d(0," + y.toFixed(2) + "px,0)"
        el.style.filter =
          blur > 0.1 && !state.prefersReducedMotion ? "blur(" + blur.toFixed(2) + "px)" : "none"
      }

      // Seta pulsando abaixo da chamada, por tempo. Só comeca depois da frase
      // estar lida - antes disso ela competiria com o texto pela atencao.
      if (cue) {
        const cueIn = smootherstep(clamp01((elapsed - 2.1) / 0.8))
        const pulse = 0.55 + Math.sin(state.time / 700) * 0.45
        cue.style.opacity = (cueIn * exit * pulse).toFixed(4)
        cue.style.transform =
          "translate3d(0," + (Math.sin(state.time / 700) * 4).toFixed(2) + "px,0)"
      }
    })
  }, [])

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0 z-40 flex flex-col items-center justify-center text-center"
      aria-label={HEADLINE + " " + SUBLINE}
    >
      <p className="projected-text mono-text mb-7 text-[0.58rem] tracking-[0.55em] text-neonGray">
        {chars(EYEBROW, { start: 0.15, step: 0.022, duration: 0.7, rise: 10 })}
      </p>

      <h1 className="projected-text text-[2rem] font-light leading-[1.05] tracking-[0.14em] sm:text-5xl md:text-6xl lg:text-7xl">
        {chars(HEADLINE, { start: 0.55, step: 0.045, duration: 1.0, rise: 34 })}
      </h1>

      <p className="projected-text mono-text mt-8 text-[0.6rem] tracking-[0.42em] text-pureWhite/60 md:text-xs">
        {chars(SUBLINE, { start: 1.5, step: 0.016, duration: 0.7, rise: 14 })}
      </p>

      <span
        data-cue
        aria-hidden="true"
        className="mono-text mt-10 block text-base text-pureWhite/70"
        style={{ opacity: 0, willChange: "opacity, transform" }}
      >
        &#8595;
      </span>
    </div>
  )
}

interface CharOptions {
  /** Segundos antes do primeiro caractere comecar. */
  start: number
  /** Segundos de atraso entre caracteres consecutivos. */
  step: number
  /** Segundos que cada caractere leva para entrar. */
  duration: number
  /** Deslocamento vertical inicial, em px. */
  rise: number
}

/**
 * Quebra o texto em caracteres com o atraso de cada um gravado no DOM.
 *
 * Os atrasos vao para `data-*` em vez de serem calculados no efeito porque a
 * ordem visual e a ordem do DOM: assim o escalonamento continua correto mesmo
 * que o texto mude de tamanho, sem o efeito precisar saber nada sobre o layout.
 */
function chars(text: string, options: CharOptions) {
  return Array.from(text).map((ch, i) => (
    <span
      key={i}
      data-char
      aria-hidden="true"
      data-delay={options.start + i * options.step}
      data-duration={options.duration}
      data-rise={options.rise}
      style={{
        display: "inline-block",
        opacity: 0,
        // `inline-block` colapsa espacos; `pre` preserva a largura da palavra.
        whiteSpace: ch === " " ? "pre" : undefined,
        willChange: "opacity, transform, filter",
      }}
    >
      {ch}
    </span>
  ))
}
