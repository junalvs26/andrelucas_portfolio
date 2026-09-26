# Plano Higgsfield — 100 créditos (trial MCP)

Custos reais (preflight `get_cost`, 26/09/2026):
| modelo | config | créditos |
|---|---|---|
| nano_banana_pro (imagem, aceita várias refs) | 1k/2k | 2 |
| gpt_image_2_5 | low / high 2k | 0.25 / 2.75 |
| seedance_2_0_mini (vídeo, start+end frame) | 480p 5s sem áudio | 2.5 |
| seedance_2_0_mini | 720p 5s sem áudio | 5 |
| kling3_0_turbo (só start frame) | 720p 5s | 7.5 |

## O que o app realmente usa (app/src)
- `CharacterCanvas`: 58 frames `character/frames/{seq}_{NN}.webp` + `ui/glasses_glow.webp`, desenhados sobre fundo preto.
- Cenas 03/04: vídeos de projeto `projects/.../proj_*.webm|mp4` + `thumb_*.webp` → **espaço reservado, o usuário insere depois**.
- `backgrounds/`, `env_*`, `character/animations/*` existem mas **não são usados pelo código** → ligar depois (edição de código, sem crédito).

## Fase A — Personagem (prioridade)  ~30 cr
Keyframes (nano_banana_pro, 9:16, refs = 4 fotos, fundo preto liso, SEM chão, corpo inteiro, mesma escala):
| id | pose | custo |
|---|---|---|
| K_back | costas, cabeça olhando por cima do ombro direito | 2 |
| K_front | frente, parado, braços relaxados | 2 |
| K_proj | projecting_04 (já aprovado, reaproveitado) | 0 |
| K_side | perfil andando para a direita | 2 |
| K_sit | sentado num bloco de luz baixo, perfil 3/4 | 2 |

Clipes (seedance_2_0_mini, 720p, 5s, sem áudio, câmera travada, fundo preto):
| clipe | start → end | frames extraídos | custo |
|---|---|---|---|
| C1 giro | K_back → K_front | turn 8 + idle 2 | 5 |
| C2 caminhada | K_front → K_front (loop, andar no lugar) | walk 12 | 5 |
| C3 projeção | K_front → K_proj | projecting 6 + observing 4 | 5 |
| C4 lateral+sentar | K_side → K_sit | lateral 8 + sit 6 | 5 |
| scale | ffmpeg sobre idle (sem IA) | 10 | 0 |

## Fase B — Cenários  ~17 cr
- 6 fundos vazios 16:9 (nano_banana_pro 2k), SEM personagem, paleta só preto/#888899/branco: 12
- 2 loops ambiente (névoa/partículas) seedance mini 480p: 5
- glasses_glow, molduras, onda, feixe: código (0)

## Reserva ~50 cr para refações. Parar e avisar se saldo < 10.

## Pós-processo (local, grátis)
ffmpeg extrai N frames por trecho → rembg/matte remove fundo → webp 896x1200 → `app/public/character/frames/` → `validate.ps1`.

## Registro
| geração | modelo | cr | saldo |
|---|---|---|---|
| 4 keyframes (K_back, K_front, K_side, K_sit) | nano_banana_pro 2k | 8 | 92 |
| 4 clipes C1–C4 | seedance_2_0_mini 720p | 20 | — |
| 6 cenários | nano_banana_pro 2k 16:9 | 12 | — |
| C5 caminhada lateral (loop) | seedance_2_0_mini 720p | 5 | 55 |
| K_back v2 (tranças curtas) + C1 refeito | nano_banana_pro + seedance mini | 7 | 48 |

## Resultado (26/09/2026)
- `app/public/character/frames/`: 56 frames novos (720x1280, alpha). O código soma 56, não 58. Backup dos antigos em `workflow/hf/old_frames/`.
- `app/public/backgrounds/` (+ cópia em `ui/`): 6 cenários 1920x1080.
- Código: `SceneBackdrop.tsx` (cenários com crossfade) e glow dos óculos reposicionado em `CharacterCanvas.tsx`.
- Fontes: `workflow/hf/{keys,clips,scenes}`; script de recorte `workflow/hf/matte.py`.
- Pendente (usuário): vídeos de projeto `proj_*.webm|mp4` em `app/public/projects/...`.
