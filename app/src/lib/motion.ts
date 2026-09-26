"use client"

import {
  SCENES,
  SceneId,
  clamp01,
  damp,
  getCharacterPose,
  getCharacterState,
  getCurrentScene,
  getSceneProgress,
  getSceneWeight,
  lerp,
} from "@/config/scenes"
import type { CharacterPose, CharacterState } from "@/types/scene"

/**
 * Estado de movimento compartilhado.
 *
 * Por que existe: antes cada componente lia o scroll por `useState`, e o hook
 * de scroll disparava seis `setState` por frame. Isso re-renderizava a arvore
 * inteira do React a cada pixel de scroll - a causa principal do travamento.
 * Agora o scroll vive num objeto mutavel e os componentes se inscrevem para
 * escrever direto no DOM/canvas. Zero re-render no caminho quente.
 */
export interface MotionState {
  /** Progresso bruto do scroll, 0..1. */
  raw: number
  /** Progresso amortecido - o que as animacoes devem usar. */
  scroll: number
  /** Velocidade em unidades de progresso por segundo (com sinal). */
  velocity: number
  /** Velocidade normalizada 0..1, para motion blur e estiramento. */
  speed: number
  direction: 1 | -1
  sceneId: SceneId
  /** Progresso local por cena, 0..1. */
  progress: Record<SceneId, number>
  /** Peso de composicao por cena, com crossfade sobreposto. */
  weight: Record<SceneId, number>
  characterState: CharacterState
  pose: CharacterPose
  /** Segundos desde o frame anterior, limitado. */
  dt: number
  /** performance.now() do frame atual. */
  time: number
  prefersReducedMotion: boolean
}

const zeroed = () =>
  SCENES.reduce((acc, s) => {
    acc[s.id as SceneId] = 0
    return acc
  }, {} as Record<SceneId, number>)

export const motion: MotionState = {
  raw: 0,
  scroll: 0,
  velocity: 0,
  speed: 0,
  direction: 1,
  sceneId: "void",
  progress: zeroed(),
  weight: zeroed(),
  characterState: "glasses_activating",
  pose: getCharacterPose(0),
  dt: 1 / 60,
  time: 0,
  prefersReducedMotion: false,
}

type Listener = (state: MotionState) => void

const listeners = new Set<Listener>()

/**
 * Inscreve um callback chamado uma vez por frame, depois do scroll ser
 * atualizado. Retorna a funcao de cancelamento. O callback e invocado
 * imediatamente com o estado atual para o primeiro paint nao piscar.
 */
export function subscribeMotion(listener: Listener): () => void {
  listeners.add(listener)
  listener(motion)
  return () => {
    listeners.delete(listener)
  }
}

/** Chamado por `useLenisScroll` a cada tick do gsap.ticker. */
export function commitMotion(rawProgress: number, time: number, deltaSeconds: number) {
  const dt = Math.min(Math.max(deltaSeconds, 1 / 240), 1 / 20)
  const prev = motion.scroll

  motion.time = time
  motion.dt = dt
  motion.raw = clamp01(rawProgress)

  // Amortecimento extra sobre o Lenis. O Lenis suaviza a posicao do scroll,
  // mas os saltos de roda ainda chegam em degraus; isso remove o degrau sem
  // adicionar latencia perceptivel (~90ms de constante de tempo).
  motion.scroll = motion.prefersReducedMotion
    ? motion.raw
    : lerp(prev, motion.raw, damp(11, dt))

  const instant = (motion.scroll - prev) / dt
  motion.velocity = lerp(motion.velocity, instant, damp(14, dt))
  motion.speed = clamp01(Math.abs(motion.velocity) / 0.45)
  if (Math.abs(motion.velocity) > 1e-4) {
    motion.direction = motion.velocity > 0 ? 1 : -1
  }

  const s = motion.scroll
  for (const scene of SCENES) {
    const id = scene.id as SceneId
    motion.progress[id] = getSceneProgress(s, scene)
    motion.weight[id] = getSceneWeight(s, scene)
  }

  motion.sceneId = getCurrentScene(s)
  motion.characterState = getCharacterState(s)
  motion.pose = getCharacterPose(s)

  listeners.forEach((listener) => listener(motion))
}

export function setReducedMotion(value: boolean) {
  motion.prefersReducedMotion = value
}
