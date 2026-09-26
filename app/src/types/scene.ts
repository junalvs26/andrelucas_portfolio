export interface SceneConfig {
  id: string
  start: number
  end: number
  label: string
}

export type SceneProgress = Record<string, number>

/** Pose continua do personagem, interpolada pelo scroll. */
export interface CharacterPose {
  /** Deslocamento horizontal em fracao da largura da viewport. */
  x: number
  /** Deslocamento vertical em fracao da altura da viewport. */
  y: number
  /** Escala relativa ao enquadramento base. */
  scale: number
  alpha: number
  /** Desfoque em px, usado nas entradas/saidas. */
  blur: number
  /** Intensidade do brilho dos oculos, 0..1. */
  glow: number
}

export type CharacterState =
  | "glasses_activating"
  | "turning_to_camera"
  | "idle"
  | "walking_forward"
  | "posing_projecting"
  | "projecting_active"
  | "observing_projection"
  | "walking_lateral"
  | "observing_gallery"
  | "sitting_leaning"
  | "receding"
  | "rebirth_pulse"

export interface ScrollCallbacks {
  onScrollProgress: (progress: number) => void
  onSceneChange: (sceneId: string, sceneProgress: number) => void
}

export interface LenisScrollReturn {
  /** Id da cena dominante. Unico valor que passa por estado do React. */
  currentSceneId: string
  lenis: any
}
