# PROMPTS - ASSETS UI / EFEITOS VISUAIS

Para geração via **Gemini** (imagens estáticas) ou **NVIDIA** (vídeos).
Formato: **PNG/WebP com alpha** para imagens, **WebM alpha** para vídeos.

---

## 1. MOLDURA DE PROJEÇÃO (`fx_projection_frame`)

**Ferramenta:** Gemini (imagem vetorial/SVG ideal)  
**Uso:** Envolver todos os vídeos de projetos exibidos

> **Minimal neon white rectangular frame, pure #FFFFFF stroke 2px, subtle outer glow 4px #FFFFFF40, rounded corners 4px. Transparent center. Aspect ratios needed: 16:9 (1280x720), 9:16 (720x1280), 1:1 (720x720), 4:3 (960x720). Vector/SVG preferred for infinite scaling. Style: technical, precise, editorial. No gradients, no fills, only stroke + glow.**

**Variações:**
- `frame_16x9.svg` / `.png`
- `frame_9x16.svg` / `.png`
- `frame_1x1.svg` / `.png`
- `frame_4x3.svg` / `.png`

**Versão "ativa" (hover/seleção):**
> **Same frame, stroke 3px, glow 8px, subtle scanline texture inside stroke.**

---

## 2. GLOW DOS ÓCULOS - SPRITE (`fx_glasses_glow`)

**Ferramenta:** Gemini  
**Uso:** Runtime overlay no Canvas/WebGL sobre os óculos do personagem

> **Soft radial gradient sprite, 512x512px, transparent PNG/WebP. Center: pure white #FFFFFF 100% opacity. Radius 128px: 0% opacity. Falloff: smooth exponential. No hard edges. For multiplicative/additive blending on glasses lenses. Provides the "emissive pulse" at runtime.**

---

## 3. CURSOR PERSONALIZADO (`ui_cursor_custom`)

**Ferramenta:** Código/SVG (não precisa IA)  
**Uso:** Substituir cursor padrão em toda experiência

> **Custom cursor: Two perpendicular white lines #FFFFFF (crosshair), 1px stroke, 24px diameter. Center gap 4px. Subtle pulsing scale 1.0 → 1.15 → 1.0 (2s loop). On hover interactive: expands to 32px, stroke 2px. SVG + CSS animation preferred.**

**Estados:**
- `default`: crosshair 24px
- `hover`: circle 32px + crosshair
- `projecting`: crosshair + expanding ring (sync com projeção)
- `text`: I-beam monospace style

---

## 4. LINHAS TÉCNICAS DE FUNDO (`ui_grid_lines`)

**Ferramenta:** Código/SVG/Shader  
**Uso:** Camada sutil de fundo em todas cenas (parallax leve)

> **Subtle technical grid: Dark gray #1A1A1A lines, 1px, 80px spacing. Major lines every 5th: #2A2A2A. Perspective distortion: slight convergence to horizon (fake 3D). Opacity: 15-20%. Animated: very slow drift (0.5px/s) matching scroll parallax. Shader-based ideal.**

---

## 5. SCANLINE / CRT TEXTURE (`fx_scanline_texture`)

**Ferramenta:** Código/Shader  
**Uso:** Overlay em textos projetados, molduras, elementos UI

> **Horizontal scanlines: 1px white #FFFFFF at 3% opacity, 3px spacing. Subtle vignette at edges. Animated: slow vertical drift (simulating CRT). CSS/Canvas shader - not image.**

---

## 6. INDICADOR DE SCROLL (`ui_scroll_indicator`)

**Ferramenta:** Código/SVG  
**Uso:** Canto inferior - indica que há mais conteúdo

> **Minimal scroll hint: White #FFFFFF text "SCROLL" in micro monospace (10px), letter-spacing 0.2em. Below: thin line 40px wide, animated growing 0→100%→0 (2s loop). Or: simple down chevron ⟱ with same pulse. Disappears after first scroll interaction.**

---

## 7. HUB DE CONTATO FINAL (`ui_contact_hub`)

**Ferramenta:** Gemini (layout base) + Código (interativo)  
**Uso:** CENA 06 - estado final

> **Clean centered layout in void. Three contact lines, monospace, white #FFFFFF, generous line-height (2.5). Each line: icon (minimal SVG) + label + value. Icons: mail, instagram logo, phone. Hover/tap: line glows, copies to clipboard with micro-toast "Copiado". Subtle entrance: each line fades up with 0.1s stagger. Pulse animation on entire hub: 4s subtle scale 1.0 → 1.005 → 1.0.**

**Conteúdo:**
```
✉  email@dominio.com
◉  @instagram
☎  WhatsApp
```

---

## 8. THUMBNAILS PROJETOS (Placeholders para Gemini)

**Ferramenta:** Gemini (ou frames extraídos dos vídeos)  
**Uso:** Estados de carregamento / fallback / grid

> **For each project: 16:9 frame capture representing the work. Apply: desaturate → tint gray #888899 → add 1px neon white border → subtle scanline overlay. Resolution: 640x360 (thumb) + 1280x720 (preview). Format: WebP.**

**Nomenclatura:**
```
thumb_comercial_01.webp
thumb_comercial_02.webp
...
thumb_social_01.webp
thumb_event_01.webp
thumb_corp_01.webp
```

---

## 9. FAVICON / TOUCH ICONS

**Ferramenta:** Código/Gemini  
**Uso:** Identidade do site

> **Simplified glasses silhouette: white organic glasses shape on transparent background. Sizes: 16x16, 32x32, 48x48, 180x180 (apple-touch), 512x512 (PWA). Single SVG source.**

---

## 10. LOADING / SPLASH (`ui_loading`)

**Ferramenta:** Código (preferencial)  
**Uso:** Carregamento inicial (CENA 01)

> **Minimal: Two white glasses lenses (organic shape) pulsing in sync (anim_glasses_pulse logic). Below: "CARREGANDO EXPERIÊNCIA" micro monospace. Progress: thin line growing. No spinners, no generic loaders. Brand-consistent.**

---

## ESPECIFICAÇÕES TÉCNICAS

| Asset | Formato | Resolução | Alpha | Localização |
|-------|---------|-----------|-------|-------------|
| projection_frame | SVG + PNG | Múltiplas | Sim | `assets/ui/` |
| glasses_glow | PNG/WebP | 512x512 | Sim | `assets/ui/` |
| cursor_custom | SVG + CSS | Vetorial | Sim | `assets/ui/` |
| grid_lines | Shader/JS | - | - | `app/shaders/` |
| scanline | Shader/CSS | - | - | `app/shaders/` |
| scroll_indicator | SVG + CSS | Vetorial | - | `assets/ui/` |
| contact_hub | HTML/CSS | Responsivo | - | `app/components/` |
| thumbnails | WebP | 640x360 | Não | `assets/projects/` |
| favicon | SVG + PNG | Múltiplas | Sim | `public/` |
| loading | HTML/CSS | - | - | `app/components/` |

---

## PRIORIDADE

1. **Alta:** projection_frame, glasses_glow, cursor_custom, favicon
2. **Média:** scroll_indicator, contact_hub, thumbnails
3. **Baixa:** grid_lines, scanline, loading (podem ser code-only)

---

## NOTA: SHADERS VS IMAGENS

Onde possível, **preferir shaders/Canvas/CSS** sobre assets de imagem:
- scanline, grid, pulse, particles → **Shader** (performance, resolução infinita, controle preciso)
- frames complexos orgânicos (glasses_glow, projection_frame) → **Imagem/SVG**
- Estados interativos (cursor, hover) → **CSS/JS**