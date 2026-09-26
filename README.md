# Portfolio Interativo Cinematográfico

Experiência web imersiva onde o autor é o protagonista da narrativa visual.

---

## Visão Geral

Este projeto implementa um portfólio cinematográfico interativo baseado no conceito **"PROJECTING VISION"**:

- **Personagem principal**: Versão artística do autor (corpo cinza, camisa oversize cinza, óculos brancos fluidos)
- **Navegação**: Scroll vertical como timeline cinematográfica
- **Estética**: Preto absoluto + Neon Cinza (`#888899`) + Branco Puro (`#FFFFFF`)
- **Tecnologia**: Next.js 14 + GSAP ScrollTrigger + Lenis Smooth Scroll + Canvas 2D

---

## Estrutura do Projeto

```
Portfolio_Interativo/
├── app/                    # Aplicação Next.js
│   ├── public/             # Assets estáticos servidos diretamente
│   │   ├── character/frames/   # Sprite sheets do personagem (58 frames)
│   │   ├── ui/                 # Assets de interface
│   │   └── projects/           # Thumbnails e vídeos dos projetos
│   ├── src/
│   │   ├── app/                # App Router (layout, page, globals.css)
│   │   ├── components/         # Componentes React
│   │   │   ├── CharacterCanvas.tsx    # Renderização do personagem via Canvas
│   │   │   ├── CustomCursor.tsx       # Cursor personalizado
│   │   │   ├── ScanlineOverlay.tsx    # Efeito scanline CRT
│   │   │   ├── Vignette.tsx           # Vignette radial
│   │   │   ├── SceneProjection.tsx    # CENA 03 - Projetos comerciais
│   │   │   ├── SceneGallery.tsx       # CENA 04 - Galeria lateral
│   │   │   ├── SceneProcess.tsx       # CENA 05 - Timeline processo
│   │   │   └── ContactHub.tsx         # CENA 06 - Contato final
│   │   ├── hooks/              # Custom hooks
│   │   ├── lib/                # Utilitários
│   │   └── styles/             # Estilos adicionais
│   ├── scripts/                # Scripts de build/geração
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   └── next.config.js
├── assets/                   # Assets fonte (originais, alta resolução)
├── generated/                # Resultados Gemini/NVIDIA
├── prompts/                  # Prompts documentados
├── storyboard/               # Storyboards
├── references/               # Referências visuais
├── docs/                     # Documentação do projeto
│   ├── CONCEITO.md           # Conceito completo, character bible, storyboard
│   └── ASSET_PLAN.md         # Plano detalhado de todos os assets
└── README.md
```

---

## Cenas da Experiência

| Cena | Scroll | Descrição |
|------|--------|-----------|
| **01 - ORIGEM** | 0-20% | Escuridão → Óculos acendem → Personagem revelado de costas → Vira para câmera |
| **02 - REVELAÇÃO** | 20-45% | Personagem caminha → Nome + "VIDEO EDITOR // VISUAL STORYTELLER" projetados |
| **03 - PROJEÇÃO** | 45-70% | Pose de projeção → Feixe dos óculos → 4 Comerciais em loop (destaque) |
| **04 - GALERIA** | 70-88% | Caminhada lateral → Carrossel 3D: Redes Sociais, Eventos, Corporativo |
| **05 - PROCESSO** | 88-95% | Sentado em bloco de luz → Timeline 3D desconstruída flutuando |
| **06 - RENASCIMENTO** | 95-100% | Personagem encolhe → Onda de luz → Hub de contato centralizado |

---

## Estados do Personagem

O personagem transiciona entre estados baseados no progresso do scroll:

```typescript
glasses_activating → turning_to_camera → idle → walking_forward 
  → posing_projecting → projecting_active → observing_projection
  → walking_lateral → observing_gallery → sitting_leaning 
  → receding → rebirth_pulse
```

---

## Instalação e Execução

### Pré-requisitos
- Node.js 18+
- npm ou pnpm

### Instalação

```bash
cd Portfolio_Interativo/app
npm install
```

### Desenvolvimento

```bash
npm run dev
```
Acesse `http://localhost:3000`

### Build de Produção

```bash
npm run build
npm run start
```

### Verificação de Tipos

```bash
npm run type-check
```

### Lint

```bash
npm run lint
```

---

## Geração de Assets (Gemini / NVIDIA)

### 1. Character Bible (Referência Mestra)
Use `prompts/character/master_character.md` para gerar as 4 views base:
- `master_character_front` (frontal)
- `master_character_profile` (perfil esquerdo)
- `master_character_3q` (3/4 frente)
- `master_character_back` (costas)

### 2. Sprite Sheets (58 frames)
Gere cada sequência em `prompts/character/poses.md`:

| Sequência | Frames | Uso |
|-----------|--------|-----|
| `idle` | 2 | Respiração sutil (loop) |
| `walk` | 12 | Caminhada frontal (ciclo completo) |
| `turn` | 8 | Giro costas→frente (CENA 01) |
| `projecting` | 6 | Ativação projeção (CENA 03) |
| `observing` | 4 | Análise/contemplação (CENA 04-05) |
| `lateral` | 8 | Caminhada lateral (transição) |
| `sit` | 6 | Sentar/apoiar (CENA 05) |
| `scale` | 10 | Encolher/sair (CENA 06) |

**Formato**: PNG transparente ou WebP, 1024x1536px
**Nomenclatura**: `{sequence}_{01-12}.webp` em `public/character/frames/`

### 3. Expressões Faciais
- `expr_neutral`, `expr_focused`, `expr_creative`, `expr_subtle_smile`
- Aplicadas via máscara no Canvas (óculos cobrem olhos)

### 4. Animações de Vídeo (NVIDIA)
| Asset | Duração | Loop | Uso |
|-------|---------|------|-----|
| `anim_glasses_activation` | 2s | Não | CENA 01 |
| `anim_glasses_pulse` | 3s | Sim | Runtime constante |
| `anim_projection_beam` | 1.5s | Não | CENA 03 transição |
| `anim_rebirth_wave` | 3s | Não | CENA 06 final |

**Formato**: WebM VP9 com alpha + MP4 H.264 fallback

### 5. Assets de UI
- Molduras de projeção (SVG: 16:9, 9:16, 1:1, 4:3)
- Glow dos óculos (512x512 PNG/WebP)
- Cursor personalizado (SVG)
- Favicon (SVG)

### 6. Projetos do Portfólio (10 total)

**Comerciais (4 - CENA 03 - Destaque)**
- `proj_comercial_01` a `proj_comercial_04` (WebM/MP4, 1280x720)
- Thumbnails: `thumb_comercial_01` a `thumb_comercial_04` (640x360 WebP)

**Redes Sociais (3 - CENA 04)**
- `proj_social_01` a `proj_social_03` (1080x1080 ou 1280x720)

**Eventos (2 - CENA 04)**
- `proj_event_01`, `proj_event_02` (1280x720)

**Corporativo (1 - CENA 04)**
- `proj_corp_01` (1280x720)

---

## Prompts Documentados

Todos os prompts estão em `prompts/`:

```
prompts/
├── character/
│   ├── master_character.md      # Prompt mestre com todas características
│   └── poses.md                 # 58 poses com modificadores específicos
├── scenes/
│   └── scenes.md                # 6 cenários + elementos reutilizáveis
├── animations/
│   └── animations.md            # 8 animações de vídeo
└── assets/
    └── assets.md                # UI, molduras, cursor, favicon
```

---

## Características Técnicas

### CharacterCanvas (Renderização)
- Canvas 2D otimizado desenhando frame exato baseado no % do scroll
- 60fps garantido sem modelos 3D pesados no navegador
- Fallback procedural se frames não carregarem
- Glow dos óculos renderizado em tempo real (pulso senoidal)

### Scroll System
- **Lenis**: Smooth scroll nativo (desktop), nativo no mobile
- **GSAP ScrollTrigger**: Mapeamento preciso scroll → estados
- Timeline de 300vh (3x viewport) para duração cinematográfica

### Performance
- Lazy loading de assets por cena
- Imagens WebP/AVIF otimizadas
- Vídeos com `preload="none"`, autoplay silencioso
- `will-change` e `transform3d` para GPU acceleration
- Respeita `prefers-reduced-motion`

### Responsividade
- Breakpoints: 640px, 768px, 1024px, 1280px
- Mobile: touch scroll nativo, cursor desabilitado
- Escala do personagem adaptativa
- Carrossel horizontal nativo no mobile

---

## Checklist de Validação do Personagem

Antes de aprovar assets gerados:

- [ ] Tranças com anéis prateados visíveis e fiéis à foto
- [ ] Alargador metálico na orelha esquerda
- [ ] Tatuagens no antebraço/pulso em grafite
- [ ] Pulseira corrente no pulso direito
- [ ] Pele 100% cinza (zero tons de pele humana)
- [ ] Camisa oversize cinza escuro, caimento premium
- [ ] Óculos branco fluido orgânico, GLOW sutil
- [ ] Óculos reconhecível em silhueta
- [ ] Rim light branca contornando silhueta
- [ ] Fundo preto absoluto
- [ ] Parece VOCÊ (reconhecimento imediato)
- [ ] Estética: editorial/sofisticada (NÃO zumbi/alien/robô)

---

## Deploy

### Vercel (Recomendado)
```bash
npm run build
# Conectar repositório no Vercel
# Configurar: Output Directory = out (next.config.js: output: 'export')
```

### Build Estático
O projeto usa `output: 'export'` para gerar site estático em `out/`.

---

## Próximos Passos

1. **Substituir placeholders** por assets reais gerados via Gemini/NVIDIA
2. **Testar performance** em dispositivos reais (mobile/desktop)
3. **Ajustar timing** das transições de estado se necessário
4. **Adicionar sound design** (opcional - ver docs/CONCEITO.md)
5. **Otimizar vídeos** (compressão AV1/WebM)
6. **Deploy em produção**

---

## Notas Importantes

- **Não modifique** `CharacterCanvas.tsx` sem entender o mapeamento scroll→frame
- **Mantenha** a paleta estrita: `#000000`, `#888899`, `#FFFFFF`
- **Preserve** a identidade do personagem (Character Bible em `docs/CONCEITO.md`)
- **Teste** com `prefers-reduced-motion` ativado
- **Verifique** se vídeos têm fallback MP4 para Safari

---

## Licença

Projeto pessoal - Todos os direitos reservados.