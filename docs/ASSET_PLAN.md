# PLANO DE ASSETS - Portfolio Interativo Cinematográfico

## Visão Geral
Todos os assets necessários para construir a experiência. Organizados por categoria, com ferramenta responsável, formato, resolução e status.

---

## 1. PERSONAGEM (CRÍTICO)

| Asset | Finalidade | Ferramenta | Formato | Resolução | Localização | Status |
|-------|------------|------------|---------|-----------|-------------|--------|
| `master_character_front` | Referência mestre frontal | Gemini/NVIDIA | PNG/WebP | 2048x2048 | `assets/character/base/` | Pendente |
| `master_character_profile` | Referência perfil | Gemini/NVIDIA | PNG/WebP | 2048x2048 | `assets/character/base/` | Pendente |
| `master_character_3q` | Referência 3/4 | Gemini/NVIDIA | PNG/WebP | 2048x2048 | `assets/character/base/` | Pendente |
| `master_character_back` | Referência costas | Gemini/NVIDIA | PNG/WebP | 2048x2048 | `assets/character/base/` | Pendente |

### Poses Estáticas (Keyframes para Sprite Sheets)

| Asset | Finalidade | Ferramenta | Formato | Resolução | Localização | Status |
|-------|------------|------------|---------|-----------|-------------|--------|
| `pose_idle_01` | Idle - respiração | Gemini/NVIDIA | PNG seq | 1024x1536 | `assets/character/poses/` | Pendente |
| `pose_idle_02` | Idle - variação | Gemini/NVIDIA | PNG seq | 1024x1536 | `assets/character/poses/` | Pendente |
| `pose_walk_01` a `pose_walk_12` | Caminhada frontal (12 frames) | Gemini/NVIDIA | PNG seq | 1024x1536 | `assets/character/poses/` | Pendente |
| `pose_turn_01` a `pose_turn_08` | Giro para câmera (8 frames) | Gemini/NVIDIA | PNG seq | 1024x1536 | `assets/character/poses/` | Pendente |
| `pose_projecting_01` a `pose_projecting_06` | Pose projeção (6 frames) | Gemini/NVIDIA | PNG seq | 1024x1536 | `assets/character/poses/` | Pendente |
| `pose_observing_01` a `pose_observing_04` | Observando (4 frames) | Gemini/NVIDIA | PNG seq | 1024x1536 | `assets/character/poses/` | Pendente |
| `pose_walk_lateral_01` a `pose_walk_lateral_08` | Caminhada lateral (8 frames) | Gemini/NVIDIA | PNG seq | 1024x1536 | `assets/character/poses/` | Pendente |
| `pose_sit_01` a `pose_sit_06` | Sentar/apoiar (6 frames) | Gemini/NVIDIA | PNG seq | 1024x1536 | `assets/character/poses/` | Pendente |
| `pose_scale_01` a `pose_scale_10` | Encolher/sair (10 frames) | Gemini/NVIDIA | PNG seq | 1024x1536 | `assets/character/poses/` | Pendente |

### Expressões Faciais (Variações dos Óculos/Rosto)

| Asset | Finalidade | Ferramenta | Formato | Resolução | Localização | Status |
|-------|------------|------------|---------|-----------|-------------|--------|
| `expr_neutral` | Neutro/calmo | Gemini/NVIDIA | PNG | 1024x1024 | `assets/character/expressions/` | Pendente |
| `expr_focused` | Focado/analítico | Gemini/NVIDIA | PNG | 1024x1024 | `assets/character/expressions/` | Pendente |
| `expr_creative` | Criativo/inspirado | Gemini/NVIDIA | PNG | 1024x1024 | `assets/character/expressions/` | Pendente |
| `expr_subtle_smile` | Leve sorriso confiante | Gemini/NVIDIA | PNG | 1024x1024 | `assets/character/expressions/` | Pendente |

### Animações Pré-renderizadas (Opcional - se necessário para transições complexas)

| Asset | Finalidade | Ferramenta | Formato | Duração | Localização | Status |
|-------|------------|------------|---------|---------|-------------|--------|
| `anim_glasses_activation` | Óculos acendendo | NVIDIA | WebM/MP4 | 2s | `assets/character/animations/` | Pendente |
| `anim_glasses_pulse` | Pulso sutil dos óculos (loop) | NVIDIA | WebM/MP4 | 3s | `assets/character/animations/` | Pendente |
| `anim_projection_beam` | Feixe de luz saindo dos óculos | NVIDIA | WebM/MP4 | 1.5s | `assets/character/animations/` | Pendente |

---

## 2. AMBIENTOS / CENAS

| Asset | Finalidade | Ferramenta | Formato | Resolução | Localização | Status |
|-------|------------|------------|---------|-----------|-------------|--------|
| `scene_01_void` | CENA 01 - Vazio escuro com névoa | Gemini/NVIDIA | PNG/WebP | 1920x1080 | `assets/backgrounds/` | Pendente |
| `scene_02_reveal` | CENA 02 - Espaço revelado | Gemini/NVIDIA | PNG/WebP | 1920x1080 | `assets/backgrounds/` | Pendente |
| `scene_03_projection_room` | CENA 03 - Sala de projeção | Gemini/NVIDIA | PNG/WebP | 1920x1080 | `assets/backgrounds/` | Pendente |
| `scene_04_gallery` | CENA 04 - Galeria projetada | Gemini/NVIDIA | PNG/WebP | 1920x1080 | `assets/backgrounds/` | Pendente |
| `scene_05_process` | CENA 05 - Espaço do processo | Gemini/NVIDIA | PNG/WebP | 1920x1080 | `assets/backgrounds/` | Pendente |
| `scene_06_rebirth` | CENA 06 - Renascimento final | Gemini/NVIDIA | PNG/WebP | 1920x1080 | `assets/backgrounds/` | Pendente |

### Elementos de Ambiente Separados (Para Parallax/Profundidade)

| Asset | Finalidade | Ferramenta | Formato | Resolução | Localização | Status |
|-------|------------|------------|---------|-----------|-------------|--------|
| `env_floor_reflective` | Chão espelhado/reflexivo | Gemini/NVIDIA | PNG/WebP | 1920x500 | `assets/backgrounds/` | Pendente |
| `env_fog_layers_01` a `env_fog_layers_03` | Camadas de névoa/volumetria | Gemini/NVIDIA | PNG (alpha) | 1920x1080 | `assets/backgrounds/` | Pendente |
| `env_particles_dust` | Partículas de poeira/luz | NVIDIA | WebM (alpha) | 1920x1080 | `assets/backgrounds/` | Pendente |

---

## 3. PROJETOS / CONTEÚDO DO PORTFÓLIO

### Comerciais (Destaque - Cena 03)

| Asset | Finalidade | Formato | Resolução | Localização | Status |
|-------|------------|---------|-----------|-------------|--------|
| `proj_comercial_01` a `proj_comercial_04` | 4 melhores comerciais | WebM/MP4 | 1280x720 | `assets/projects/comerciais/` | Pendente |
| `thumb_comercial_01` a `thumb_comercial_04` | Thumbnails estáticos | WebP | 640x360 | `assets/projects/comerciais/` | Pendente |

### Redes Sociais, Eventos, Corporativos (Carrossel - Cena 04)

| Asset | Finalidade | Formato | Resolução | Localização | Status |
|-------|------------|---------|-----------|-------------|--------|
| `proj_social_01` a `proj_social_03` | Projetos redes sociais | WebM/MP4 | 1080x1080 | `assets/projects/social/` | Pendente |
| `proj_event_01` a `proj_event_02` | Projetos eventos | WebM/MP4 | 1280x720 | `assets/projects/eventos/` | Pendente |
| `proj_corp_01` a `proj_corp_01` | Projetos corporativos | WebM/MP4 | 1280x720 | `assets/projects/corporativo/` | Pendente |

---

## 4. EFEITOS VISUAIS / UI / PROJEÇÕES

| Asset | Finalidade | Ferramenta | Formato | Resolução | Localização | Status |
|-------|------------|------------|---------|-----------|-------------|--------|
| `fx_projection_frame` | Moldura neon branca para vídeos | Gemini/NVIDIA | PNG (alpha) | 1280x720 | `assets/ui/` | Pendente |
| `fx_projection_beam` | Feixe de luz volumétrico | NVIDIA | PNG seq / WebM | 1920x1080 | `assets/ui/` | Pendente |
| `fx_scanline_text` | Textura scanline para texto | Código/Shader | - | - | `app/shaders/` | Pendente |
| `fx_glasses_glow` | Glow dos óculos (sprite) | Gemini/NVIDIA | PNG (alpha) | 512x512 | `assets/ui/` | Pendente |
| `fx_wave_rebirth` | Onda final de renascimento | NVIDIA | WebM (alpha) | 1920x1080 | `assets/ui/` | Pendente |
| `ui_cursor_custom` | Cursor personalizado linha | Código/SVG | SVG | 32x32 | `assets/ui/` | Pendente |
| `ui_grid_lines` | Linhas técnicas de fundo | Código/SVG | SVG | - | `assets/ui/` | Pendente |

---

## 5. TEXTOS / COPY (Para Geração de Imagens com Texto Projetado)

| Texto | Cena | Formato de Exibição |
|-------|------|---------------------|
| `[SEU NOME]` | 02 | Projetado no chão/ar - monospace grande |
| `VIDEO EDITOR // VISUAL STORYTELLER` | 02 | Projetado - monospace médio |
| `TRABALHOS COMERCIAIS` | 03 | Título da seção - projetado |
| `REDES SOCIAIS` | 04 | Categoria no carrossel |
| `EVENTOS` | 04 | Categoria no carrossel |
| `CORPORATIVO` | 04 | Categoria no carrossel |
| `PROCESSO CRIATIVO` | 05 | Título seção processo |
| `TIMELINE // CORTES // RITMO // NARRATIVA` | 05 | Palavras-chave flutuando |
| `VAMOS CRIAR ALGO JUNTOS?` | 06 | Final - projetado central |
| `email@dominio.com` | 06 | Contato |
| `@instagram` | 06 | Contato |
| `WhatsApp` | 06 | Contato |

---

## 6. PROMPTS A CRIAR (Em `prompts/`)

### Personagem
- [ ] `prompts/character/master_character.md` - Prompt mestre com todas as características
- [ ] `prompts/character/pose_idle.md`
- [ ] `prompts/character/pose_walk.md`
- [ ] `prompts/character/pose_projecting.md`
- [ ] `prompts/character/pose_observing.md`
- [ ] `prompts/character/pose_sit.md`
- [ ] `prompts/character/pose_exit.md`
- [ ] `prompts/character/expressions.md`

### Cenas
- [ ] `prompts/scenes/scene_01_void.md`
- [ ] `prompts/scenes/scene_02_reveal.md`
- [ ] `prompts/scenes/scene_03_projection.md`
- [ ] `prompts/scenes/scene_04_gallery.md`
- [ ] `prompts/scenes/scene_05_process.md`
- [ ] `prompts/scenes/scene_06_rebirth.md`

### Animações/Efeitos
- [ ] `prompts/animations/glasses_activation.md`
- [ ] `prompts/animations/projection_beam.md`
- [ ] `prompts/animations/rebirth_wave.md`

### Assets UI
- [ ] `prompts/assets/projection_frame.md`
- [ ] `prompts/assets/glasses_glow.md`

---

## PRIORIDADE DE EXECUÇÃO

### Fase 1 - Fundação (Esta semana)
1. Master Character (4 ângulos)
2. Scene 01 + 02 backgrounds
3. Prompt mestre do personagem documentado

### Fase 2 - Animação Core
4. Pose sequences: idle, walk, turn, projecting
5. Scene 03 background
6. Projection beam effect

### Fase 3 - Portfólio
7. Scene 04 background
8. Project video assets (compressão/otimização)
9. Scene 05 background + process elements

### Fase 4 - Finalização
10. Scene 06 background + rebirth effect
11. Expressions faciais
12. UI elements (cursor, grid, frames)

---

## NOTAS TÉCNICAS

- **Nomenclatura:** `categoria_nome_variante.ext` (ex: `character_pose_walk_01.png`)
- **Otimização:** Todos PNGs → WebP lossless; Vídeos → WebM VP9 + MP4 H.264 fallback
- **Alpha:** Assets com transparência em PNG WebP ou WebM com canal alpha
- **Responsivo:** Versões @1x (1920w) e @0.5x (960w) para mobile