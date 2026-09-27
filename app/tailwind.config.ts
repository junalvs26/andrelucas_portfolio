import type { Config } from 'tailwindcss'

const config: Config = {
  /*
    `src/config` PRECISA estar aqui.

    O Tailwind gera CSS varrendo estes arquivos atras de strings que pareçam
    classes - ele nao entende o codigo, so procura texto. E `ASPECT_CLASSES`,
    o mapa que da a proporcao de cada projeto, mora em `src/config/projects.ts`,
    que ficou de fora desta lista.

    Resultado: `aspect-[9/16]` e `aspect-square` nunca eram geradas. As classes
    iam para o HTML e nao existiam no CSS, entao os elementos ficavam sem
    `aspect-ratio` - e como cada um deles tira UMA das duas dimensoes dela, todos
    colapsavam:

      - cards da galeria: largura 260px, altura 0
      - quadro da projecao: altura 64vh, largura 0
      - player do lightbox: largura do shell, altura 0
        (dai o sintoma "toca o audio e nao aparece imagem")

    Qualquer arquivo fora de `components`/`app` que monte nome de classe precisa
    entrar nesta lista, senao o sintoma reaparece - e ele nao quebra o build nem
    o type-check, so some da tela.
  */
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/config/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#000000',
        neonGray: '#888899',
        pureWhite: '#FFFFFF',
        charcoal: {
          50: '#3A3A3E',
          100: '#2A2A2E',
          200: '#1A1A1E',
        },
        skinGray: {
          dark: '#68686E',
          mid: '#85858B',
          light: '#9E9EA4',
        },
      },
      fontFamily: {
        // As duas primeiras sao as variaveis que o `next/font` define no <html>
        // (fontes auto-hospedadas). Os nomes literais ficam so como fallback.
        mono: ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
        'drift': 'drift 20s linear infinite',
        'spring': 'spring 0.4s ease-out',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        },
        drift: {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(50px, 50px)' },
        },
        spring: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config