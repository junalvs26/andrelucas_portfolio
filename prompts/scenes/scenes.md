# PROMPTS - CENAS / AMBIENTES

Base: Fundo preto absoluto `#000000`, iluminação neon cinza `#888899` e branco `#FFFFFF`.
Estilo: Arquitetura brutalista minimalista, concreto escuro, volumetria, reflexos.
Câmera: Fixa por cena, personagem se move no espaço.

---

## CENA 01 - VOID / ORIGEM (`scene_01_void`)

**Scroll:** 0-20% | **Mood:** Mistério, antecipação, nascimento

> **Cinematic wide shot of infinite void space, pure black #000000. Subtle volumetric fog layers in dark gray #1A1A1A catching non-existent light. Floor: polished dark concrete reflecting nothing yet. Two faint white points (glasses) floating in center darkness at eye level. No visible character yet. Extreme minimalism. Octane render, 8k, masterpiece composition.**

**Variação para revelação progressiva:**
> **Same void, but faint white rim light beginning to outline a silhouette from behind - shoulders, braids, shirt drape emerging from darkness. Volumetric fog catching rim light. Cinematic revelation moment.**

---

## CENA 02 - REVELAÇÃO / ESPAÇO (`scene_02_reveal`)

**Scroll:** 20-45% | **Mood:** Presença, autoridade, apresentação

> **Architectural void space revealed by character's presence. Polished dark concrete floor stretching to infinity, mirror-like reflecting character and white rim light. Subtle vertical light shafts in gray #888899 descending from unseen ceiling, creating atmospheric columns. Character standing centered, grounded. Space feels massive, cathedral-like but minimal. Text projection area: empty geometric zone to right of character where monospace text will appear projected on air/floor. Cinematic, 8k.**

**Elementos-chave:**
- Chão espelhado reflexivo
- Eixos de luz verticais sutis (volumetric)
- Área negativa para projeção de texto
- Sensação de escala monumental

---

## CENA 03 - SALA DE PROJEÇÃO (`scene_03_projection_room`)

**Scroll:** 45-70% | **Mood:** Foco, criação, poder visual

> **Same architectural space transformed. Character in projection pose (see pose_projecting_04). From glasses: intense coherent white light beam creating a floating rectangular screen in mid-air at 45° angle. Screen displays: commercial video content (placeholder). Screen frame: thin neon white line #FFFFFF. Light beam volumetric, catching fog particles. Floor reflects screen and beam. Secondary screens hinted in darkness behind - upcoming projects. Dramatic lighting: only character, beam, and screen illuminated. Rest pure black.**

**Elementos-chave:**
- Feixe de luz volumétrico dos óculos → tela
- Tela flutuante com moldura neon branca
- Reflexo no chão
- Outros projetos sugeridos na escuridão

---

## CENA 04 - GALERIA PROJETADA (`scene_04_gallery`)

**Scroll:** 70-88% | **Mood:** Fluidez, variedade, navegação

> **Character walking lateral (profile) through projection gallery. Multiple floating screens at different depths/Z-positions, each showing different project: social media (vertical 9:16), events (16:9), corporate (16:9). Screens arranged in elliptical carousel path around character's walk path. Each screen: thin neon white frame, subtle parallax as character passes. Floor reflects entire gallery. Gray volumetric particles drifting. Character glances at screens as passing. Cinematic tracking shot feel.**

**Elementos-chave:**
- Carrossel elíptico de telas em profundidade
- Diferentes aspect ratios (9:16, 16:9, 1:1)
- Parallax natural
- Molduras neon brancas unificadas

---

## CENA 05 - PROCESSO CRIATIVO (`scene_05_process`)

**Scroll:** 88-95% | **Mood:** Inteligência, precisão, genialidade técnica

> **Character seated/leaning on low horizontal light block (glowing gray #3A3A3E). Above: deconstructed timeline floating in 3D space - white lines, cuts, keyframes, audio waveforms as luminous geometry. Timeline segments: RITMO, CORTE, NARRATIVA, COR, SOM - labeled in micro monospace. Character interacting: finger touching a cut point, scrubbing. Block emits subtle gray glow illuminating character from below. Background: pure black with distant memory of previous screens fading. Intellectual, surgical precision atmosphere.**

**Elementos-chave:**
- Bloco de luz cinza baixo (assento/mesa)
- Timeline 3D desconstruída flutuante
- Labels técnicos em monospace micro
- Interação precisa do dedo
- Iluminação from-below (underlighting)

---

## CENA 06 - RENASCIMENTO / CONTATO (`scene_06_rebirth`)

**Scroll:** 95-100% | **Mood:** Transcendência, convite, ciclo completo

> **Center of void. Character has receded to tiny silhouette then pure white glasses points. Single expanding wave of white/gray light geometry erupting from center - organic ripple, not shockwave. Wave carries: contact information emerging in monospace as it expands. email@domain.com | @instagram | WhatsApp. Wave reaches edge of viewport and dissolves. Remaining: clean centered contact hub floating in void, subtle pulse. New cycle ready to begin. Minimal, poetic, complete.**

**Elementos-chave:**
- Onda orgânica branca/cinza expandindo
- Informações de contato surgindo na onda
- Dissolução limpa nas bordas
- Hub final centrado pulsando sutil

---

## ELEMENTOS REUTILIZÁVEIS (Assets Separados)

### Chão Reflexivo (`env_floor_reflective`)
> **Infinite polished dark concrete plane, #0A0A0A base, mirror reflectivity 0.8, subtle roughness 0.1. Catches and reflects all white/cinza light sources. Seamless tileable.**

### Camadas Névoa (`env_fog_layers_01` a `03`)
> **Volumetric fog sheets, pure black with 2% white catch. Layer 01: low ground hugging. Layer 02: mid height atmospheric. Layer 03: high ceiling haze. All transparent PNG/WebP for parallax stacking.**

### Partículas Poeira/Luz (`env_particles_dust`)
> **Slow drifting microscopic particles, catching rim light, 3-5 second loop, WebM with alpha. Subtle, not snow.**

### Moldura Projeção (`fx_projection_frame`)
> **Thin neon white rectangle #FFFFFF, 2px stroke, subtle outer glow 4px, rounded corners 4px. Aspect ratios: 16:9, 9:16, 1:1, 4:3. Transparent center. SVG/PNG.**

### Feixe Projeção (`fx_projection_beam`)
> **Volumetric light cone from point source to rectangle. White core fading to transparent edges. Particle dust inside. 16:9 target. WebM alpha or PNG sequence.**

### Glow Óculos (`fx_glasses_glow`)
> **Soft white radial gradient, 512x512, transparent PNG. For runtime glow pulse on character glasses.**

### Onda Renascimento (`fx_wave_rebirth`)
> **Organic expanding ring/wave, white to gray gradient, 3 second duration, WebM alpha. Not geometric - organic like liquid sound wave.**

---

## NOTAS DE GERAÇÃO

1. **Consistência:** Todas cenas compartilham mesmo "espaço virtual" - chão, névoa, escala
2. **Iluminação:** Apenas fontes diegéticas (óculos, telas, bloco, onda)
3. **Cor:** Preto + Cinza #888899 + Branco #FFFFFF. **NENHUMA OUTRA COR**
4. **Profundidade:** Usar camadas separadas (chão, névoa 1, névoa 2, personagem, elementos flutuantes) para parallax no scroll
5. **Resolução Master:** 1920x1080 (16:9) - gerar também 3840x2160 para 4K se possível