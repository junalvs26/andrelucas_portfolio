"use client"

import RevealText from "@/components/RevealText"
import { useSceneLayer } from "@/hooks/useSceneLayer"

/**
 * Cena 02 - titulo principal.
 *
 * Antes isso vivia inline em `page.tsx`, montado e desmontado por
 * `sceneProgress.reveal > 0.3`, com `opacity` calculada no render e uma
 * `transition-opacity` de 1s por cima. Agora e uma camada estavel cuja
 * revelacao e dirigida pelo scroll.
 */
export default function SceneReveal() {
  const layerRef = useSceneLayer<HTMLDivElement>("reveal", {
    scaleFrom: 1.06,
    yFrom: 34,
    blurFrom: 10,
    parallax: -70,
  })

  return (
    <div ref={layerRef} className="absolute inset-0" aria-hidden="true">
      <div className="absolute bottom-[12vh] left-[6vw] max-w-[85vw]">
        <RevealText
          as="h1"
          text="ANDRÉ LUCAS"
          sceneId="reveal"
          from={0.06}
          to={0.52}
          rise={40}
          blur={12}
          className="projected-text text-4xl font-light leading-none tracking-[0.18em] md:text-6xl lg:text-8xl"
        />
        <RevealText
          text="EDITOR"
          sceneId="reveal"
          from={0.3}
          to={0.72}
          rise={22}
          blur={8}
          className="projected-text mt-5 text-lg font-light tracking-[0.34em] text-neonGray md:text-2xl lg:text-3xl"
        />

        {/* Regua que cresce com a cena: ancora visual para o titulo e marca o
            avanco da rolagem sem precisar de indicador numerico. */}
        <div className="mt-8 h-px w-[min(38vw,420px)] origin-left bg-gradient-to-r from-pureWhite/70 via-pureWhite/20 to-transparent" />
      </div>

      <div className="absolute right-[6vw] top-[10vh] max-w-[38vw] text-right">
        <RevealText
          text="COMERCIAIS · REDES SOCIAIS · EVENTOS · CORPORATIVO"
          sceneId="reveal"
          from={0.52}
          to={0.88}
          rise={14}
          blur={6}
          stagger={0.7}
          className="projected-text mono-text text-[0.62rem] font-light tracking-[0.3em] text-neonGray md:text-xs lg:text-sm"
        />
      </div>
    </div>
  )
}
