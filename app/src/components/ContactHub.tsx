"use client"

import { useEffect, useRef, useState } from "react"
import RevealText from "@/components/RevealText"
import { clamp01, lerp, smootherstep } from "@/config/scenes"
import { subscribeMotion } from "@/lib/motion"
import { useSceneLayer } from "@/hooks/useSceneLayer"
import { asset } from "@/lib/asset"

const CONTACTS = [
  {
    icon: "MAIL",
    label: "EMAIL",
    value: "andreluck001@gmail.com",
    action: "mailto:andreluck001@gmail.com",
  },
  {
    icon: "IG",
    label: "INSTAGRAM",
    value: "@_oded.edits",
    action: "https://instagram.com/_oded.edits",
  },
  {
    icon: "WA",
    label: "WHATSAPP",
    value: "+55 98 98536-1399",
    // `wa.me` exige o numero so com digitos e COM o codigo do pais (55).
    // Sem o 55 o link abre uma conversa com um numero de outro pais ou falha.
    action: "https://wa.me/5598985361399",
  },
]

/**
 * Cena 06 - renascimento e contato.
 *
 * O que mudou:
 *
 * - A onda usava `opacity: waveProg * (1 - waveProg)` com `scale: 1 + prog*4`
 *   num unico elemento. O pico de opacidade desse produto e 0.25, entao a onda
 *   quase nao aparecia; e um unico anel escalando 5x nao le como propagacao.
 *   Agora sao tres aneis com defasagem, cada um com o proprio ciclo.
 *
 * - Os botoes usavam `gsap.fromTo` com `toggleActions: "play none none
 *   reverse"`. Isso e uma animacao com duracao propria disparada por um limiar
 *   de scroll: se o usuario cruzasse o limiar de volta no meio do stagger, a
 *   animacao invertia a partir de um estado parcial e os botoes ficavam presos
 *   com opacidade intermediaria. Agora a entrada e dirigida pelo scroll, entao
 *   e reversivel por construcao.
 *
 * - `handleCopy` e `handleClick` eram chamados juntos no mesmo clique, ou seja,
 *   todo clique copiava E abria uma aba. Agora copiar e abrir sao acoes
 *   distintas.
 */
export default function ContactHub() {
  const layerRef = useSceneLayer<HTMLDivElement>("rebirth", {
    scaleFrom: 0.94,
    yFrom: 24,
    blurFrom: 10,
    interactive: true,
  })

  const ringsRef = useRef<HTMLDivElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    const rings = ringsRef.current
    const buttons = buttonsRef.current
    if (!rings || !buttons) return

    const ringEls = Array.from(rings.querySelectorAll<HTMLElement>("[data-ring]"))
    const btnEls = Array.from(buttons.querySelectorAll<HTMLElement>("[data-contact-btn]"))
    const lastBtn = new Array(btnEls.length).fill("")

    return subscribeMotion((state) => {
      const w = state.weight.rebirth
      if (w <= 0.0015) return

      const p = state.progress.rebirth

      // Tres aneis defasados: cada um percorre a expansao num offset diferente,
      // o que le como uma onda se propagando em vez de um circulo crescendo.
      ringEls.forEach((ring, i) => {
        const offset = i * 0.16
        const t = clamp01((p - offset) / 0.62)
        const scale = lerp(0.2, 3.4, smootherstep(t))
        // Envelope com pico deslocado do centro: sobe rapido, decai devagar.
        const envelope = t <= 0 || t >= 1 ? 0 : Math.pow(Math.sin(Math.PI * t), 1.6)
        ring.style.transform = "translate3d(-50%,-50%,0) scale(" + scale.toFixed(4) + ")"
        ring.style.opacity = (envelope * 0.55).toFixed(4)
      })

      // Entrada escalonada dos botoes, dirigida pelo scroll.
      btnEls.forEach((el, i) => {
        const start = 0.34 + i * 0.07
        const t = smootherstep(clamp01((p - start) / 0.22))
        const key = t.toFixed(3)
        if (key === lastBtn[i]) return
        lastBtn[i] = key
        el.style.opacity = t.toFixed(4)
        el.style.transform = "translate3d(0," + lerp(22, 0, t).toFixed(2) + "px,0)"
      })
    })
  }, [])

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(value)
      window.setTimeout(() => setCopied(null), 1800)
    } catch {
      // Area de transferencia negada (contexto nao seguro ou permissao
      // recusada). O link continua clicavel, entao nao ha nada a recuperar.
    }
  }

  return (
    <div ref={layerRef} className="absolute inset-0">
      {/*
        Onda de renascimento.

        Eram tres aneis desenhados com `border` em CSS porque eu nao sabia que
        existia arte pronta - `public/ui/rebirth_wave.webp` estava no disco sem
        nenhuma referencia no codigo desde o inicio do projeto. Um anel de borda
        de 1px le como forma geometrica; o asset tem queda de intensidade e
        textura, que e o que faz ler como onda de luz.
      */}
      <div
        ref={ringsRef}
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            data-ring
            className="absolute left-1/2 top-1/2"
            style={{
              width: "62vmin",
              height: "62vmin",
              opacity: 0,
              transform: "translate3d(-50%,-50%,0) scale(0.2)",
              willChange: "transform, opacity",
              // Aditivo sobre o preto: as ondas se somam onde se cruzam, em vez
              // de uma tapar a outra.
              mixBlendMode: "screen",
            }}
          >
            <img
              src={asset("/ui/rebirth_wave.webp")}
              alt=""
              decoding="async"
              draggable={false}
              className="h-full w-full object-contain"
            />
          </div>
        ))}
      </div>

      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
        role="region"
        aria-label="Informacoes de contato"
      >
        <RevealText
          text="VAMOS CRIAR ALGO JUNTOS?"
          sceneId="rebirth"
          from={0.14}
          to={0.42}
          rise={14}
          blur={6}
          stagger={0.7}
          className="projected-text mono-text text-[0.6rem] tracking-[0.4em] text-neonGray"
        />
        <RevealText
          as="h2"
          text="CONTATO"
          sceneId="rebirth"
          from={0.2}
          to={0.5}
          rise={28}
          blur={12}
          className="projected-text mt-3 text-3xl font-light tracking-[0.3em] md:text-5xl lg:text-6xl"
        />

        <div ref={buttonsRef} className="mx-auto mt-10 flex max-w-xs flex-col gap-4">
          {CONTACTS.map((contact) => (
            <div
              key={contact.label}
              data-contact-btn
              className="flex items-center gap-4 rounded-[3px] border border-pureWhite/20 bg-void/60 p-4 text-left backdrop-blur-sm transition-colors duration-300 hover:border-pureWhite/60 hover:bg-void/85"
              style={{ opacity: 0, willChange: "opacity, transform" }}
            >
              <a
                href={contact.action}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-1 items-center gap-4"
                aria-label={contact.label + ": " + contact.value}
              >
                <span className="font-mono text-xl transition-transform duration-300 group-hover:translate-x-0.5 md:text-2xl">
                  {contact.icon}
                </span>
                <span className="block">
                  <span className="mono-text block text-[0.55rem] tracking-[0.35em] text-neonGray">
                    {contact.label}
                  </span>
                  <span className="mono-text block max-w-[190px] truncate text-xs font-light tracking-[0.2em]">
                    {contact.value}
                  </span>
                </span>
              </a>

              {/* Copiar e uma acao separada de abrir o link: antes o mesmo
                  clique fazia as duas coisas. */}
              <button
                type="button"
                onClick={() => handleCopy(contact.value)}
                className="mono-text shrink-0 rounded-[2px] border border-pureWhite/20 px-2 py-1 text-[0.5rem] tracking-[0.2em] text-neonGray transition-colors duration-200 hover:border-pureWhite/60 hover:text-pureWhite"
                aria-label={"Copiar " + contact.label}
              >
                {copied === contact.value ? "OK" : "COPIAR"}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-pureWhite/10 pt-6">
          <p className="mono-text text-[0.55rem] tracking-[0.35em] text-pureWhite/30">
            PROJETANDO VISAO DESDE 2024
          </p>
        </div>
      </div>
    </div>
  )
}
