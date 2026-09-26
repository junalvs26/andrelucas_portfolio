import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
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
        mono: [
          'var(--font-jetbrains-mono)',
          'var(--font-space-mono)',
          'JetBrains Mono',
          'ui-monospace',
          'monospace',
        ],
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