/**
 * `next dev` e `next build` escrevem no MESMO `.next/` por padrao. Rodar um
 * build com o servidor de dev ligado faz o build sobrescrever os chunks de
 * desenvolvimento, e o dev server continua com um manifest em memoria apontando
 * para arquivos que deixaram de existir. O sintoma e
 * `Error: Cannot find module './819.js'`, e a unica saida e apagar o `.next`.
 *
 * `npm run build:verify` define NEXT_DIST_DIR e compila num diretorio separado,
 * entao dá para validar um build a qualquer momento sem derrubar o dev.
 * O `npm run build` de verdade continua usando `.next`.
 *
 * @type {import('next').NextConfig}
 */
/*
 * Subcaminho de publicacao.
 *
 * Vazio por padrao: `npm run dev` e qualquer host que sirva na raiz nao mudam.
 * No GitHub Pages de PROJETO o site fica em `usuario.github.io/repositorio`, e
 * ai `NEXT_PUBLIC_BASE_PATH=/repositorio` faz o Next emitir os chunks em
 * `/repositorio/_next/*`.
 *
 * `basePath` cobre SO o que o Next emite. Os assets escritos a mao - fundos,
 * frames do personagem, videos - passam pelo helper `src/lib/asset.ts`, que le
 * a mesma variavel. Os dois precisam andar juntos.
 */
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '')

const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  output: 'export',
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(webm|mp4)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[hash][ext]',
      },
    })
    return config
  },
}

module.exports = nextConfig