import { SceneConfig, CharacterState, CharacterPose } from "@/types/scene"

/**
 * Janelas de cena em progresso de scroll global (0..1).
 * Reequilibradas: antes "process" tinha 7% e "rebirth" 5% do scroll, o que
 * comprimia duas cenas inteiras em menos de uma viewport e fazia tudo parecer
 * atropelado. Agora nenhuma cena recebe menos de 12%.
 */
export const SCENES: SceneConfig[] = [
  { id: "void", start: 0.0, end: 0.14, label: "CENA 01 - ORIGEM" },
  { id: "reveal", start: 0.14, end: 0.32, label: "CENA 02 - REVELACAO" },
  { id: "projection", start: 0.32, end: 0.55, label: "CENA 03 - PROJECAO" },
  { id: "gallery", start: 0.55, end: 0.75, label: "CENA 04 - GALERIA" },
  { id: "process", start: 0.75, end: 0.88, label: "CENA 05 - PROCESSO" },
  { id: "rebirth", start: 0.88, end: 1.0, label: "CENA 06 - RENASCIMENTO" },
]

export type SceneId = "void" | "reveal" | "projection" | "gallery" | "process" | "rebirth"

export const SCENE_IDS = SCENES.map((s) => s.id) as SceneId[]

/** Largura da zona de crossfade entre cenas vizinhas, em progresso global. */
export const OVERLAP = 0.055

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Interpolacao com derivada zero nas pontas: nada "arranca" nem "bate". */
export const smoothstep = (t: number) => {
  const x = clamp01(t)
  return x * x * (3 - 2 * x)
}

/** Mais suave ainda (C2) - usada nas transicoes longas de cena. */
export const smootherstep = (t: number) => {
  const x = clamp01(t)
  return x * x * x * (x * (x * 6 - 15) + 10)
}

export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))

export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

/**
 * Coeficiente de damping independente de framerate.
 * `lerp(atual, alvo, damp(taxa, dt))` converge igual a 30fps e a 144fps.
 */
export const damp = (rate: number, dt: number) => 1 - Math.exp(-rate * Math.min(dt, 0.1))

export function getSceneConfig(id: SceneId): SceneConfig | undefined {
  return SCENES.find((s) => s.id === id)
}

/** Progresso local dentro da cena, 0..1, sem overlap. */
export function getSceneProgress(scrollProgress: number, scene: SceneConfig): number {
  return clamp01((scrollProgress - scene.start) / (scene.end - scene.start))
}

/**
 * Peso de composicao da cena, 0..1, COM overlap suavizado nas duas bordas.
 * Duas cenas vizinhas somam ~1 durante a travessia, entao o crossfade nunca
 * mostra buraco preto nem dois layouts em opacidade cheia.
 */
export function getSceneWeight(scrollProgress: number, scene: SceneConfig): number {
  const first = scene.start === 0
  const last = scene.end === 1

  const fadeInStart = scene.start - (first ? 0 : OVERLAP)
  const fadeOutEnd = scene.end + (last ? 0 : OVERLAP)

  if (scrollProgress <= fadeInStart || scrollProgress >= fadeOutEnd) return 0

  const rampIn = first ? 0 : OVERLAP * 2
  const rampOut = last ? 0 : OVERLAP * 2

  const fadeIn = rampIn > 0 ? smootherstep((scrollProgress - fadeInStart) / rampIn) : 1
  const fadeOut = rampOut > 0 ? smootherstep((fadeOutEnd - scrollProgress) / rampOut) : 1

  return clamp01(Math.min(fadeIn, fadeOut))
}

export function getCurrentScene(scrollProgress: number): SceneId {
  for (const scene of SCENES) {
    if (scrollProgress >= scene.start && scrollProgress < scene.end) {
      return scene.id as SceneId
    }
  }
  return SCENES[SCENES.length - 1].id as SceneId
}

/**
 * Estado de sprite do personagem. Os limites acompanham as novas janelas de
 * cena e cada estado ganhou duracao suficiente para o ciclo de frames rodar
 * pelo menos uma vez antes de trocar.
 */
export function getCharacterState(scrollProgress: number): CharacterState {
  const p = scrollProgress
  if (p < 0.05) return "glasses_activating"
  if (p < 0.14) return "turning_to_camera"
  if (p < 0.22) return "idle"
  if (p < 0.32) return "walking_forward"
  if (p < 0.4) return "posing_projecting"
  if (p < 0.48) return "projecting_active"
  if (p < 0.55) return "observing_projection"
  if (p < 0.64) return "walking_lateral"
  if (p < 0.75) return "observing_gallery"
  if (p < 0.88) return "sitting_leaning"
  if (p < 0.96) return "receding"
  return "rebirth_pulse"
}

/**
 * Pose continua do personagem. Este e o ponto central da fluidez: em vez de
 * ler a posicao do estado discreto (que salta a cada troca), interpolamos
 * keyframes com smootherstep, entao o personagem desliza pelo scroll inteiro.
 */
const POSE_KEYS: { at: number; pose: CharacterPose }[] = [
  { at: 0.0, pose: { x: 0.0, y: 0.06, scale: 0.72, alpha: 0.0, blur: 14, glow: 0.0 } },
  { at: 0.05, pose: { x: 0.0, y: 0.04, scale: 0.76, alpha: 1.0, blur: 5, glow: 0.35 } },
  { at: 0.14, pose: { x: 0.0, y: 0.02, scale: 0.8, alpha: 1.0, blur: 0, glow: 1.0 } },
  { at: 0.32, pose: { x: 0.0, y: 0.0, scale: 0.92, alpha: 1.0, blur: 0, glow: 1.0 } },
  { at: 0.42, pose: { x: -0.2, y: 0.0, scale: 0.88, alpha: 1.0, blur: 0, glow: 1.0 } },
  { at: 0.55, pose: { x: -0.3, y: 0.01, scale: 0.8, alpha: 0.92, blur: 1.5, glow: 0.8 } },
  { at: 0.64, pose: { x: 0.28, y: 0.01, scale: 0.78, alpha: 0.9, blur: 2, glow: 0.7 } },
  { at: 0.75, pose: { x: 0.32, y: 0.02, scale: 0.74, alpha: 0.85, blur: 2.5, glow: 0.6 } },
  { at: 0.88, pose: { x: 0.0, y: 0.03, scale: 0.68, alpha: 0.8, blur: 3, glow: 0.9 } },
  { at: 0.96, pose: { x: 0.0, y: 0.05, scale: 0.4, alpha: 0.45, blur: 8, glow: 1.0 } },
  { at: 1.0, pose: { x: 0.0, y: 0.06, scale: 0.16, alpha: 0.0, blur: 18, glow: 1.0 } },
]

export function getCharacterPose(scrollProgress: number): CharacterPose {
  const p = clamp01(scrollProgress)

  let i = 0
  while (i < POSE_KEYS.length - 2 && p > POSE_KEYS[i + 1].at) i++

  const a = POSE_KEYS[i]
  const b = POSE_KEYS[i + 1]
  const span = b.at - a.at
  const t = smootherstep(span > 0 ? (p - a.at) / span : 1)

  return {
    x: lerp(a.pose.x, b.pose.x, t),
    y: lerp(a.pose.y, b.pose.y, t),
    scale: lerp(a.pose.scale, b.pose.scale, t),
    alpha: lerp(a.pose.alpha, b.pose.alpha, t),
    blur: lerp(a.pose.blur, b.pose.blur, t),
    glow: lerp(a.pose.glow, b.pose.glow, t),
  }
}
