'use client'

import { useCallback, useState } from 'react'
import AtmosphereLayers from '@/components/AtmosphereLayers'
import CharacterCanvas from '@/components/CharacterCanvas'
import SceneBackdrop from '@/components/SceneBackdrop'
import SceneIntro from '@/components/SceneIntro'
import SceneReveal from '@/components/SceneReveal'
import SceneProjection from '@/components/SceneProjection'
import SceneGallery from '@/components/SceneGallery'
import SceneProcess from '@/components/SceneProcess'
import ContactHub from '@/components/ContactHub'
import CustomCursor from '@/components/CustomCursor'
import ScanlineOverlay from '@/components/ScanlineOverlay'
import Vignette from '@/components/Vignette'
import ScrollHint from '@/components/ScrollHint'
import SceneChrome from '@/components/SceneChrome'
import ProjectLightbox from '@/components/ProjectLightbox'
import type { Project } from '@/config/projects'
import { useLenisScroll } from '@/hooks/useLenisScroll'

export default function PortfolioPage() {
  // Unico valor vindo do React: o id da cena dominante, que muda cinco vezes
  // na pagina inteira. Todo o resto do movimento passa pelo store em
  // `lib/motion` e escreve direto no DOM.
  const { currentSceneId } = useLenisScroll()

  /*
    Projeto aberto no lightbox.

    Este estado pode viver no React, ao contrario de tudo o que e movimento:
    ele muda por clique - algumas vezes na visita inteira -, nao por frame. A
    regra do store em `lib/motion` e sobre o que muda a 120 Hz, e um modal que
    abre e fecha nao e isso.
  */
  const [openProject, setOpenProject] = useState<Project | null>(null)

  // Identidade estavel: `SceneGallery` e `SceneProjection` recebem esta funcao
  // como prop, e uma nova referencia a cada render invalidaria memoizacao de
  // graca no caminho mais sensivel da pagina.
  const closeProject = useCallback(() => setOpenProject(null), [])

  const lightboxOpen = openProject !== null

  return (
    <div className="relative w-full">
      {/*
        Altura de rolagem: 700vh.
        Antes eram 300vh para seis cenas, ou seja, cerca de 1/3 de viewport por
        cena - curto demais para qualquer transicao respirar, e o motivo de
        tudo parecer atropelado. Com 700vh nenhuma cena recebe menos de
        ~0.8 viewport de rolagem.
      */}
      <div className="h-[700vh] w-full" aria-hidden="true" />

      {/* Palco fixo. Todas as cenas ficam montadas o tempo todo e sao
          compostas por opacidade/transform - nunca montadas e desmontadas,
          que era o que fazia os elementos piscarem na troca de cena. */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <SceneBackdrop />

        {/* Atmosfera entre o fundo e o personagem: e o que cria profundidade e,
            de quebra, suaviza a ampliacao do background. */}
        <AtmosphereLayers />

        <div className="absolute inset-0 z-0">
          <CharacterCanvas />
        </div>

        <div className="absolute inset-0 z-20">
          {/* Abertura: entra por tempo ao carregar, sai por scroll. E a unica
              camada que nao pode depender do scroll, porque e ela que convence
              a rolar. */}
          <SceneIntro />
          <SceneReveal />
          <SceneProjection
            activeSceneId={currentSceneId}
            onOpenProject={setOpenProject}
            lightboxOpen={lightboxOpen}
          />
          <SceneGallery
            activeSceneId={currentSceneId}
            onOpenProject={setOpenProject}
            lightboxOpen={lightboxOpen}
          />
          <SceneProcess />
          <ContactHub />
        </div>

        <SceneChrome />
        <ScrollHint />
        <Vignette />
        <ScanlineOverlay />
      </div>

      {/* Fora do palco `pointer-events-none` e depois dele no DOM: o lightbox
          precisa receber cliques e cobrir todas as camadas de cena. */}
      <ProjectLightbox project={openProject} onClose={closeProject} />

      <CustomCursor />
    </div>
  )
}
