/**
 * Prefixo dos assets estaticos.
 *
 * Por que isto existe: o `basePath` do `next.config.js` so reescreve o que o
 * proprio Next emite - os chunks em `/_next/*`, `next/image`, `next/link`. Ele
 * NAO toca em `<img src="/backgrounds/...">`, em `new Image().src`, num
 * `<source src>` nem num `<link rel="preload" href>`. Este projeto usa as
 * quatro coisas, porque o personagem e desenhado em canvas e os videos sao
 * `<video>` cru.
 *
 * Sem este prefixo, publicar num subcaminho (o caso do GitHub Pages de
 * projeto, `usuario.github.io/repositorio`) carrega a pagina e o JavaScript,
 * mas todo asset da 404: o personagem some, os fundos somem e a galeria fica
 * so com quadros pretos.
 *
 * `NEXT_PUBLIC_BASE_PATH` vazio (o padrao) devolve o caminho intacto, entao o
 * `npm run dev` e qualquer host que sirva na raiz continuam iguais.
 */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "")

/** Recebe um caminho comecando com "/" e devolve ele ja prefixado. */
export function asset(path: string): string {
  if (!BASE_PATH) return path
  return path.startsWith("/") ? BASE_PATH + path : path
}
