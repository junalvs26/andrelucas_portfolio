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
 * 1. Rode `./scripts/import-videos.ps1 -Id <id> -Source <master.mp4>`. Ele le
 *    os caminhos daqui de baixo e escreve o loop e o poster no lugar certo.
 * 2. Pronto - nao precisa mexer em nenhum componente nem editar caminho.
 *
 * Formato recomendado: `.webm` (VP9) com um `.mp4` (H.264) do mesmo nome ao
 * lado, para Safari. O componente `ProjectMedia` tenta o `.webm` e cai
 * automaticamente no `.mp4` de mesmo nome; se nenhum dos dois existir, ele fica
 * no poster sem quebrar o layout.
 *
 * O poster e obrigatorio e aparece sempre: e ele que compoe o quadro enquanto o
 * video carrega, e e o estado final se o video nao existir.
 *
 * ---------------------------------------------------------------------------
 * O VIDEO LOCAL NAO E O TRABALHO - E A CAPA DELE
 * ---------------------------------------------------------------------------
 * `ProjectMedia` monta o <video> com `loop muted playsInline` e sem controles:
 * o arquivo local existe para dar movimento ao quadro enquanto a pessoa rola.
 * Por isso ele deve ser um trecho curto (6-10s), sem audio, 720p - algo em
 * torno de 500 KB. Subir o master aqui nao melhora nada visivelmente e custa
 * dezenas de MB no bundle estatico.
 *
 * Para o visitante ASSISTIR o trabalho de verdade, com audio e em qualidade
 * cheia, preencha `youtubeId`. O quadro passa a ser clicavel e abre o
 * `ProjectLightbox`, que cria o <iframe> apenas no clique - antes disso a
 * pagina nao baixa um byte do YouTube.
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
  /**
   * ID do video no YouTube (o que vem depois de `v=`), nao a URL inteira.
   * Preenchido: o quadro fica clicavel e abre o player no lightbox.
   * Vazio: o quadro segue sendo so o loop, sem afordancia de clique.
   * Videos "nao listados" funcionam aqui - eles nao aparecem em busca, mas
   * tocam por embed.
   */
  youtubeId?: string
}

/**
 * TODO O ACERVO E VERTICAL.
 *
 * Os 17 masters entregues sao 9:16 (a maioria em 2160x3840), porque o trabalho
 * e social: Reels, Shorts, TikTok. A lista anterior descrevia quatro
 * "comerciais 16:9", dois "eventos" e um "corporativo" - era andaime de
 * desenvolvimento, nao o acervo. Por isso `aspect` e "9:16" em todos os itens
 * abaixo, e a cena de projecao passou a dimensionar o quadro pela ALTURA.
 *
 * Os `youtubeId` sao Shorts. Um Short toca no embed normal do YouTube, que e o
 * que o `ProjectLightbox` usa - nao existe (e nao e preciso) embed especifico
 * de Short.
 */

/** Cena 03 - projecao em tela cheia. Os quatro destaques. */
export const COMMERCIAL_PROJECTS: Project[] = [
  {
    id: "mara-selfit",
    title: "MARA SELFIT",
    category: "REELS / FITNESS",
    duration: "0:52",
    aspect: "9:16",
    video: "/projects/mara-selfit.webm",
    poster: "/projects/mara-selfit.webp",
    youtubeId: "4wq5yJQY7nU",
  },
  {
    id: "taping",
    title: "TAPING",
    category: "REELS / SAUDE",
    duration: "1:06",
    aspect: "9:16",
    video: "/projects/taping.webm",
    poster: "/projects/taping.webp",
    youtubeId: "hd9i8m7ny1Y",
  },
  {
    id: "emagrecimento",
    title: "EMAGRECIMENTO E ACOMPANHAMENTO",
    category: "REELS / SAUDE",
    duration: "0:52",
    aspect: "9:16",
    video: "/projects/emagrecimento.webm",
    poster: "/projects/emagrecimento.webp",
    youtubeId: "vdpAHltu0GA",
  },
  {
    id: "experiencia-zed",
    title: "EXPERIENCIA ZED",
    category: "REELS / MARCA",
    duration: "0:31",
    aspect: "9:16",
    video: "/projects/experiencia-zed.webm",
    poster: "/projects/experiencia-zed.webp",
    youtubeId: "UXmMHGHrLPA",
  },
]

/** Cena 04 - galeria lateral. O resto do acervo publicado. */
export const GALLERY_PROJECTS: Project[] = [
  {
    id: "qball",
    title: "QBALL CERVEJA",
    category: "REELS / BEBIDAS",
    duration: "0:25",
    aspect: "9:16",
    video: "/projects/qball.webm",
    poster: "/projects/qball.webp",
    youtubeId: "gfbs688FZmM",
  },
  {
    id: "quarta-em-dobro",
    title: "QUARTA EM DOBRO",
    category: "REELS / PROMOCAO",
    duration: "0:24",
    aspect: "9:16",
    video: "/projects/quarta-em-dobro.webm",
    poster: "/projects/quarta-em-dobro.webp",
    youtubeId: "XKy2R6gAlUE",
  },
  {
    id: "trend-zed",
    title: "TREND ZED",
    category: "REELS / TREND",
    duration: "0:21",
    aspect: "9:16",
    video: "/projects/trend-zed.webm",
    poster: "/projects/trend-zed.webp",
    youtubeId: "wAFNGlF-XC4",
  },
  {
    id: "petitfour",
    title: "PETITFOUR",
    category: "REELS / GASTRONOMIA",
    duration: "0:32",
    aspect: "9:16",
    video: "/projects/petitfour.webm",
    poster: "/projects/petitfour.webp",
    youtubeId: "AosG6_kr3Do",
  },
  {
    id: "salao-v3",
    title: "SALAO V3",
    category: "REELS / BELEZA",
    duration: "0:43",
    aspect: "9:16",
    video: "/projects/salao-v3.webm",
    poster: "/projects/salao-v3.webp",
    youtubeId: "8MFN7YzK4Xo",
  },
  {
    id: "volta-as-aulas",
    title: "VOLTA AS AULAS",
    category: "REELS / OTICA",
    duration: "0:17",
    aspect: "9:16",
    video: "/projects/volta-as-aulas.webm",
    poster: "/projects/volta-as-aulas.webp",
    youtubeId: "98zbDXzBv2A",
  },
  {
    id: "corte-live",
    title: "CORTE LIVE",
    category: "CORTE / LIVE",
    duration: "0:30",
    aspect: "9:16",
    video: "/projects/corte-live.webm",
    poster: "/projects/corte-live.webp",
    youtubeId: "3_3gYjehSv4",
  },
]

export const ASPECT_CLASSES: Record<Project["aspect"], string> = {
  "16:9": "aspect-video",
  "9:16": "aspect-[9/16]",
  "1:1": "aspect-square",
  "4:3": "aspect-[4/3]",
}
