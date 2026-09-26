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
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  output: 'export',
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