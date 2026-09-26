/**
 * FONTE UNICA DOS PROJETOS.
 *
 * Antes esta lista estava duplicada dentro de `SceneProjection.tsx` e
 * `SceneGallery.tsx`, com nomes de arquivo divergentes entre as duas (foi assim
 * que dois posters passaram a apontar para arquivos inexistentes). Agora e um
 * lugar so.
 *
 * ---------------------------------------------------------------------------
 * COMO ADICIONAR OS VIDEOS
 * ---------------------------------------------------------------------------
 * 1. Coloque os arquivos em `app/public/projects/<pasta>/`.
 * 2. Ajuste `video` e `poster` abaixo para o nome exato do arquivo.
 * 3. Pronto - nao precisa mexer em nenhum componente.
 *
 * Formato recomendado: `.webm` (VP9) com um `.mp4` (H.264) do mesmo nome ao
 * lado, para Safari. O componente `ProjectMedia` tenta o `.webm` e cai
 * automaticamente no `.mp4` de mesmo nome; se nenhum dos dois existir, ele fica
 * no poster sem quebrar o layout.
 *
 * O poster e obrigatorio e aparece sempre: e ele que compoe o quadro enquanto o
 * video carrega, e e o estado final se o video nao existir.
 */

export interface Project {
  id: string
  title: string
  category: string
  /** Duracao exibida no rotulo. Texto livre. */
  duration?: string
  /** Proporcao do quadro na galeria. */
  aspect: "16:9" | "9:16" | "1:1" | "4:3"
  /** Caminho a partir de `public/`. O `.mp4` irmao e tentado automaticamente. */
  video: string
  /** Caminho a partir de `public/`. Sempre visivel. */
  poster: string
}

/** Cena 03 - projecao em tela cheia. Trabalhos comerciais. */
export const COMMERCIAL_PROJECTS: Project[] = [
  {
    id: "comercial-01",
    title: "COMERCIAL 01",
    category: "TV / DIGITAL",
    duration: "0:30",
    aspect: "16:9",
    video: "/projects/comerciais/proj_comercial_01.webm",
    poster: "/projects/comerciais/thumb_comercial_01.webp",
  },
  {
    id: "comercial-02",
    title: "COMERCIAL 02",
    category: "BRAND FILM",
    duration: "1:15",
    aspect: "16:9",
    video: "/projects/comerciais/proj_comercial_02.webm",
    poster: "/projects/comerciais/thumb_comercial_02.webp",
  },
  {
    id: "comercial-03",
    title: "COMERCIAL 03",
    category: "PRODUCT LAUNCH",
    duration: "0:45",
    aspect: "16:9",
    video: "/projects/comerciais/proj_comercial_03.webm",
    poster: "/projects/comerciais/thumb_comercial_03.webp",
  },
  {
    id: "comercial-04",
    title: "COMERCIAL 04",
    category: "CAMPANHA INSTITUCIONAL",
    duration: "1:00",
    aspect: "16:9",
    video: "/projects/comerciais/proj_comercial_04.webm",
    poster: "/projects/comerciais/thumb_comercial_04.webp",
  },
]

/** Cena 04 - galeria lateral. Redes sociais, eventos, corporativo. */
export const GALLERY_PROJECTS: Project[] = [
  {
    id: "social-01",
    title: "REDES SOCIAIS 01",
    category: "REELS / TIKTOK",
    aspect: "9:16",
    video: "/projects/social/proj_social_01.webm",
    poster: "/projects/social/thumb_social_01.webp",
  },
  {
    id: "social-02",
    title: "REDES SOCIAIS 02",
    category: "STORIES / ADS",
    aspect: "9:16",
    video: "/projects/social/proj_social_02.webm",
    poster: "/projects/social/thumb_social_02.webp",
  },
  {
    id: "social-03",
    title: "REDES SOCIAIS 03",
    category: "CARROSSEL VIDEO",
    aspect: "1:1",
    video: "/projects/social/proj_social_03.webm",
    poster: "/projects/social/thumb_social_03.webp",
  },
  {
    id: "event-01",
    title: "EVENTO 01",
    category: "AFTERMOVIE",
    aspect: "16:9",
    video: "/projects/eventos/proj_event_01.webm",
    poster: "/projects/eventos/thumb_event_01.webp",
  },
  {
    id: "event-02",
    title: "EVENTO 02",
    category: "COBERTURA AO VIVO",
    aspect: "16:9",
    video: "/projects/eventos/proj_event_02.webm",
    poster: "/projects/eventos/thumb_event_02.webp",
  },
  {
    id: "corp-01",
    title: "CORPORATIVO 01",
    category: "INSTITUCIONAL",
    aspect: "16:9",
    video: "/projects/corporativo/proj_corp_01.webm",
    poster: "/projects/corporativo/thumb_corp_01.webp",
  },
]

export const ASPECT_CLASSES: Record<Project["aspect"], string> = {
  "16:9": "aspect-video",
  "9:16": "aspect-[9/16]",
  "1:1": "aspect-square",
  "4:3": "aspect-[4/3]",
}
