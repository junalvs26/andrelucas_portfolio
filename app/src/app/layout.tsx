import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ReducedMotionProvider } from '@/hooks/useReducedMotion'
import { asset } from "@/lib/asset"

/**
 * Fontes auto-hospedadas.
 *
 * Antes o `globals.css` tinha `@import url(fonts.googleapis.com/...)`. Um
 * `@import` dentro de uma folha render-blocking torna a requisicao externa
 * render-blocking TAMBEM, e em serie: o navegador busca o layout.css, parseia,
 * descobre o @import, busca o fonts.googleapis.com, e so entao pinta o primeiro
 * frame. Em conexao lenta - ou com o dominio do Google lento - isso e uma tela
 * branca pelo tempo inteiro da ida e volta.
 *
 * `next/font` baixa as fontes no momento do BUILD e as serve do proprio
 * dominio. Resultado: zero requisicao externa no caminho critico, e zero
 * troca de fonte depois do primeiro paint.
 *
 * Apenas UMA familia, de proposito. Havia tambem Space Mono, mas nada no design
 * a chamava - ela existia so como fallback atras da JetBrains Mono, que ja
 * cobre todos os pesos usados. Cada familia a mais e mais arquivos servidos e
 * mais uma chance de o build falhar por rede (o download do Space Mono falhou
 * numa das execucoes e caiu em fonte de sistema).
 */
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ANDRÉ LUCAS // EDITOR',
  description: 'Portfólio cinematográfico interativo. Projetando visão através da lente.',
  keywords: ['andré lucas', 'editor de video', 'reels', 'social media', 'portfolio', 'cinematic'],
  authors: [{ name: 'André Lucas' }],
  openGraph: {
    title: 'ANDRÉ LUCAS // EDITOR',
    description: 'Portfólio cinematográfico interativo.',
    type: 'website',
  },
  /*
    Icone da aba: a cabeca do personagem, recortada de `character/frames`.
    Antes nao havia `icons` nenhum, entao o navegador pedia `/favicon.ico`, que
    nao existe - era um 404 em toda visita.

    Os caminhos passam por `asset()` pelo mesmo motivo do resto: publicado num
    subcaminho, um `/icons/...` cru aponta para fora do site.

    Os PNG sao compostos sobre PRETO de proposito. Em 32px o alfa vira franja
    cinza, e numa aba de tema claro a cabeca ficaria recortada com halo sujo.
  */
  icons: {
    icon: [
      { url: asset('/icons/favicon-32.png'), sizes: '32x32', type: 'image/png' },
      { url: asset('/icons/icon-512.png'), sizes: '512x512', type: 'image/png' },
    ],
    apple: asset('/icons/apple-touch-icon.png'),
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  // `maximumScale: 1` e `userScalable: false` bloqueavam o zoom da pagina, o que
  // impede quem precisa ampliar de ler o site. O scroll da pagina e controlado
  // pelo Lenis e nao depende disso.
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="pt-BR"
      className={'scrollbar-hide ' + jetbrainsMono.variable}
      /*
       * Fundo preto inline no proprio <html>.
       *
       * Este e o unico estilo da pagina que nao depende de NENHUM arquivo
       * externo: ele chega no mesmo byte stream do HTML. Mesmo que o CSS
       * demore, o primeiro paint ja e preto em vez de branco. `color-scheme`
       * garante que a barra de rolagem e o fundo padrao do proprio navegador
       * tambem venham escuros.
       */
      style={{ backgroundColor: '#000000', colorScheme: 'dark' }}
    >
      <head>
        {/* Somente os assets da primeira cena. Pre-carregar as seis cenas fazia
            o navegador competir por banda com o CSS e com os frames do
            personagem, que sao o que aparece primeiro. */}
        <link rel="preload" as="image" href={asset("/backgrounds/scene_01_void.webp")} />
        <link rel="preload" as="image" href={asset("/character/frames/idle_01.webp")} />
        <link rel="preload" as="image" href={asset("/ui/glasses_glow.webp")} />
      </head>
      <body className="min-h-screen bg-void text-pureWhite antialiased">
        <ReducedMotionProvider>{children}</ReducedMotionProvider>
      </body>
    </html>
  )
}
