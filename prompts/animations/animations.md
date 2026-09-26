# PROMPTS - ANIMAÇÕES / EFEITOS DE VÍDEO

Para geração via **NVIDIA** (Omniverse, Cosmos, ou modelos de vídeo).
Formato saída: **WebM com alpha** (VP9) + **MP4 fallback** (H.264).
Duração: Conforme especificado. Loop suave quando indicado.

---

## 1. ATIVAÇÃO DOS ÓCULOS (`anim_glasses_activation`)

**Duração:** 2 segundos | **Loop:** Não | **Uso:** CENA 01 (scroll 0-5%)

> **Extreme close-up on the sculptural organic white glasses floating in pure darkness. Initially completely inert, dark/off. Then: subtle energy buildup at bridge - white particles converging. Sudden clean activation: entire lens surfaces illuminate with pure white #FFFFFF luminosity. Emissive glow expands 3px beyond frame edges. Soft pulse stabilization. Cinematic macro lighting, 8k, photorealistic materials. Transparent background (alpha).**

**Keyframes:**
- 0.00s: Óculos escuros/inertes
- 0.80s: Partículas convergindo na ponte nasal
- 1.00s: Flash ativação - branco total
- 1.20s: Glow expandindo
- 2.00s: Estabilizado, pulso sutil contínuo

---

## 2. PULSO DOS ÓCULOS - LOOP (`anim_glasses_pulse`)

**Duração:** 3 segundos | **Loop:** Sim (perfeito) | **Uso:** Runtime constante no personagem

> **Extreme close-up on active white organic glasses. Subtle breathing pulse: luminosity oscillates 100% → 108% → 100%. Glow halo expands 2px → 5px → 2px in sync. Zero flicker. Organic, calm, technological heartbeat. Perfect seamless loop. Transparent background (alpha).**

**Parâmetros loop:**
- Frequência: ~0.33 Hz (1 ciclo / 3s)
- Curva: Ease-in-out senoidal
- Amplitude: +8% brilho, +3px glow

---

## 3. FEIXE DE PROJEÇÃO (`anim_projection_beam`)

**Duração:** 1.5 segundos | **Loop:** Não (trigger sob demanda) | **Uso:** CENA 03 - transição pose_projecting_03→04

> **Volumetric light beam emitting from glasses lenses toward camera-right. Starts as tight cone from lens, expands to rectangular screen shape at ~3m distance. Beam: white core #FFFFFF, volumetric scattering in gray fog #888899, microscopic dust particles illuminated inside beam. Screen rectangle forms at end with neon white frame. Clean physics-based light transport. Transparent background (alpha).**

**Keyframes:**
- 0.00s: Início emissão das lentes
- 0.40s: Cone volumétrico visível
- 0.80s: Alcança distância, retângulo formando
- 1.20s: Moldura neon completa
- 1.50s: Estável, pronto para conteúdo de vídeo

---

## 4. ONDA RENASCIMENTO (`anim_rebirth_wave`)

**Duração:** 3 segundos | **Loop:** Não | **Uso:** CENA 06 (scroll 98-100%)

> **Center frame: organic circular wave expanding from single point in pure black. Wave: liquid mercury texture, white #FFFFFF center fading to gray #888899 edges. Not geometric ring - organic rippling like sound wave in water or liquid light. As expands: contact text emerges riding wave crest in monospace - email, @instagram, WhatsApp - then dissolves. Wave reaches 4x viewport width and evaporates into particles. Transparent background (alpha).**

**Keyframes:**
- 0.00s: Ponto único (óculos fundidos)
- 0.50s: Primeira onda orgânica
- 1.00s: Onda média, texto emergindo
- 2.00s: Onda grande, texto legível no centro
- 3.00s: Dissolução completa, partículas finas

---

## 5. PARTÍCULAS AMBIENTE - LOOP (`anim_ambient_particles`)

**Duração:** 10 segundos | **Loop:** Sim | **Uso:** Background constante (todas cenas)

> **Slow drifting microscopic particles in volumetric fog. Size: 0.5-2px. Color: white #FFFFFF at 3-8% opacity. Movement: Brownian drift + subtle upward thermal current. Density: sparse, elegant. Catch rim light when passing character. Perfect seamless 10s loop. WebM alpha.**

---

## 6. TIMELINE FLUTUANTE - LOOP (`anim_floating_timeline`)

**Duração:** 8 segundos | **Loop:** Sim | **Uso:** CENA 05 (processo)

> **Deconstructed video timeline floating in 3D space. White luminous lines: tracks, clips, cuts, keyframes, audio waveforms. Animated: playhead scrubbing left→right→left ping-pong. Clip thumbnails as micro glowing rectangles. Labels: RITMO, CORTE, NARRATIVA, COR, SOM pulsing subtly in sync. Organic floating drift (not rigid). Transparent background (alpha).**

---

## 7. TEXTO SENDO PROJETADO (`anim_text_projection`)

**Duração:** 1.5s por linha | **Loop:** Não | **Uso:** CENA 02, 06 - runtime via shader preferencial

> **Monospace text appearing character-by-character with scanline sweep effect. Each character: white #FFFFFF, materializes with horizontal scanline passing top→bottom. Subtle CRT phosphor glow trail. Cursor block blinking at end. Shader-based preferred over video.**

> **Se vídeo necessário:** Render de "VIDEO EDITOR // VISUAL STORYTELLER" aparecendo linha por linha, 1.5s cada.

---

## 8. TRANSIÇÃO DE TELA (CARROSSEL) (`anim_screen_transition`)

**Duração:** 0.8s | **Loop:** Não | **Uso:** CENA 04 - troca de projetos no carrossel

> **Neon white framed screen: current video compresses horizontally into thin line → expands into new video content. Frame remains stable. Glitch-free, optical. Motion blur on compress/expand. Transparent background (alpha for frame overlay).**

---

## ESPECIFICAÇÕES TÉCNICAS DE SAÍDA

| Parâmetro | Valor |
|-----------|-------|
| Codec Principal | WebM VP9 com canal alpha |
| Codec Fallback | MP4 H.264 High Profile (sem alpha) |
| Resolução | 1920x1080 (16:9) |
| Frame Rate | 30 fps (ou 60 fps para pulse/particles) |
| Bitrate | VBR, qualidade alta (crf 18-22) |
| Color Space | sRGB / Rec.709 |
| Alpha | Straight (unmatted) para WebM |

---

## NOMENCLATURA ARQUIVOS

```
anim_glasses_activation.webm
anim_glasses_activation.mp4
anim_glasses_pulse.webm
anim_glasses_pulse.mp4
anim_projection_beam.webm
anim_projection_beam.mp4
anim_rebirth_wave.webm
anim_rebirth_wave.mp4
anim_ambient_particles.webm
anim_ambient_particles.mp4
anim_floating_timeline.webm
anim_floating_timeline.mp4
anim_screen_transition.webm
anim_screen_transition.mp4
```

Local: `assets/character/animations/` e `assets/ui/`

---

## NOTAS PARA NVIDIA

- Usar **Cosmos** ou **Omniverse** para simulação de luz volumétrica fisicamente correta
- Para pulse/particles: considerar geração procedural via shader no runtime (mais leve)
- Priorizar **WebM alpha** para composição flexível no Canvas/WebGL
- Testar loop seamlessness: frame final = frame inicial (pixel-perfect)