# Portfolio Interativo - Next.js App

## Quick Start

```bash
cd app
npm install
npm run dev
```

Acesse `http://localhost:3000`

## Estrutura de Assets (public/)

```
public/
├── character/frames/           # 58 frames do personagem (.webp/.png)
│   ├── idle_01.webp, idle_02.webp
│   ├── walk_01.webp ... walk_12.webp
│   ├── turn_01.webp ... turn_08.webp
│   ├── projecting_01.webp ... projecting_06.webp
│   ├── observing_01.webp ... observing_04.webp
│   ├── lateral_01.webp ... lateral_08.webp
│   ├── sit_01.webp ... sit_06.webp
│   ├── scale_01.webp ... scale_10.webp
│   └── glasses_glow.webp
├── ui/
│   ├── projection_frame_16x9.svg
│   ├── projection_frame_9x16.svg
│   ├── projection_frame_1x1.svg
│   ├── glasses_glow.webp
│   └── favicon.svg
└── projects/
    ├── comerciais/
    │   ├── proj_comercial_01.webm/.mp4
    │   ├── thumb_comercial_01.webp
    │   └── ... (01-04)
    ├── social/
    ├── eventos/
    └── corporativo/
```

## Scripts Úteis

```bash
npm run dev          # Desenvolvimento com hot reload
npm run build        # Build de produção (static export)
npm run start        # Preview do build
npm run type-check   # Verificação TypeScript
npm run lint         # ESLint
npm run generate:assets  # Gera placeholders SVG
```

## Mapeamento Scroll → Estado do Personagem

Controlado em `src/app/page.tsx` na função `getCharacterState()`:

| Scroll Range | Estado | Cena |
|--------------|--------|------|
| 0-5% | `glasses_activating` | 01 |
| 5-15% | `turning_to_camera` | 01 |
| 15-25% | `idle` | 01→02 |
| 25-35% | `walking_forward` | 02 |
| 35-45% | `posing_projecting` | 02→03 |
| 45-55% | `projecting_active` | 03 |
| 55-70% | `observing_projection` | 03 |
| 70-78% | `walking_lateral` | 03→04 |
| 78-88% | `observing_gallery` | 04 |
| 88-92% | `sitting_leaning` | 05 |
| 92-98% | `receding` | 06 |
| 98-100% | `rebirth_pulse` | 06 |

## Personalização

### Alterar Duração das Cenas
Edite array `SCENES` em `src/app/page.tsx`:

```typescript
const SCENES = [
  { id: 'void', start: 0, end: 0.2, label: 'CENA 01' },
  { id: 'reveal', start: 0.2, end: 0.45, label: 'CENA 02' },
  // ...
]
```

### Adicionar Novos Projetos
1. Adicione vídeos em `public/projects/{categoria}/`
2. Atualize arrays em `SceneProjection.tsx` e `SceneGallery.tsx`
3. Adicione thumbnails correspondentes

### Ajustar Cores
Edite `tailwind.config.ts` e `src/app/globals.css` (variáveis CSS `:root`)

## Troubleshooting

### Personagem não aparece
- Verifique se frames existem em `public/character/frames/`
- Console do navegador mostrará warnings se frames falharem
- Fallback procedural será renderizado automaticamente

### Scroll não suave
- Verifique se Lenis está inicializado (console: "Lenis initialized")
- Conflitos com `overflow` no body - usar `scrollbar-hide` utility

### Vídeos não reproduzem
- Formatos: WebM (VP9) + MP4 (H.264) obrigatórios
- Atributos: `autoPlay loop muted playsInline`
- `preload="none"` para performance

### Build falha no Vercel
- `next.config.js`: `output: 'export'` configurado
- `images.unoptimized: true` para export estático
- Verifique se não há imports de `fs` ou Node.js APIs no client code

## Performance Tips

1. **Frames do personagem**: WebP lossless, 1024x1536px max
2. **Vídeos**: WebM VP9 CRF 28-32, MP4 H.264 CRF 23-26
3. **Lazy load**: Componentes de cena só montam quando ativos
4. **Canvas**: `willReadFrequently: false`, `alpha: true`
5. **GPU**: `transform3d` nas animações GSAP

## Acessibilidade

- `prefers-reduced-motion`: Desativa todas animações
- `pointer: coarse`: Cursor personalizado desabilitado no touch
- ARIA labels em todos elementos interativos
- Contraste: Branco puro sobre preto (21:1)