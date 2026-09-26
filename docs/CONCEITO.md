# CONCEITO - Portfolio Interativo Cinematográfico

## Ideia Central
**"PROJECTING VISION"** - Uma jornada visual imersiva onde o autor é o protagonista e o próprio projetor/diretor da realidade. O visitante acompanha o personagem através de um universo escuro onde os óculos brancos fluidos funcionam como lentes criativas que emitem feixes de luz e projetam os trabalhos diretamente na arquitetura do ambiente.

## Identidade Visual Core
**CORPO CINZA + CAMISA OVERSIZE CINZA + ÓCULOS BRANCOS FLUIDOS**

---

# PERSONAGEM

## Características Físicas (Baseadas na Foto Real)
- **Cabelo:** Tranças nagô/box braids com anéis/adereços metálicos prateados
- **Acessórios:** Alargador metálico no lóbulo da orelha, pulseira de corrente
- **Tatuagens:** Visíveis no antebraço e pulso (renderizadas em grafite/cinza escuro)
- **Rosto:** Estrutura facial arredondada, sem barba
- **Postura:** Leveza, atitude e presença marcante

## Visual Final do Personagem
- **Pele/Corpo:** Tons de cinza fotográfico (#68686E a #9E9EA4) com sombreamento e reflexos refinados - estética escultura contemporânea/editorial
- **Cabelo:** Tranças estilizadas com anéis prateados/brancos brilhantes
- **Detalhes Preservados:** Tatuagens em grafite, alargador metálico
- **Traje:** Camisa oversize cinza escuro/médio (#2A2A2E a #4A4A50), caimento amplo, tecido com textura acetinada/matte premium
- **Óculos (ASSINATURA):** Branco de alta luminosidade (#FFFFFF), formato orgânico/fluido (mercúrio líquido solidificado), contraste máximo com rosto e fundo

---

# CHARACTER BIBLE - Regras Inegociáveis

1. **Silhueta Identificável:** Tranças + contorno dos óculos brancos devem ser reconhecíveis mesmo em silhueta total
2. **Paleta Fixa:**
   - Óculos: `#FFFFFF` com brilho neon branco
   - Camisa: `#2A2A2E` a `#4A4A50`
   - Pele: `#68686E` a `#9E9EA4`
3. **Câmera:** Sempre nível dos olhos ou levemente contra-plongée
4. **Iluminação:** Rim light branca vinda de trás/cima, destacando ombros, tranças e silhueta da camisa
5. **Consistência:** O personagem NÃO pode parecer pessoa diferente em cada cena

---

# DIREÇÃO DE ARTE

## Paleta
- **Fundo:** Preto absoluto `#000000` com névoa/volumetria cinza sutil
- **Accents:** Neon Cinza `#888899` e Branco Puro `#FFFFFF`
- **Sem outras cores**

## Tipografia
- Monospace técnica: `JetBrains Mono` / `Space Mono` / `Geist Mono`
- Efeitos de varredura/scanline ao ser "projetada"

## Layout
- Sem grids tradicionais
- Texto e vídeos ancorados na luz projetada pelo personagem
- Composição assimétrica, cinematográfica

## Textura do Espaço
- Concreto escuro reflexivo ou chão espelhado sutil
- Reflexos de neon branco e vídeos projetados

---

# STORYBOARD - 6 Cenas

## CENA 01 — A Origem (Hero) | Scroll 0-20%
Ambiente escuro → Óculos brancos se acendem no centro → Luz revela personagem de costas/perfil → Ele se vira para câmera

## CENA 02 — A Visão (Apresentação) | Scroll 20-45%
Personagem dá 2 passos à frente → Texto monospace projetado no chão/ar: Nome + "VIDEO EDITOR // VISUAL STORYTELLER"

## CENA 03 — A Galeria Projetada (Comerciais - Destaques) | Scroll 45-70%
Pose muda (mão levantada em direção aos óculos/espaço) → Feixe de luz branco sai dos óculos → Abre tela flutuante com melhores comerciais em loop

## CENA 04 — Portfólio Completo (Redes Sociais, Eventos, Corporativo) | Scroll 70-88%
Personagem caminha lateralmente + muda pose → Mídias navegam em esteira 3D/parallax projetada ao redor

## CENA 05 — O Processo / Genialidade | Scroll 88-95%
Personagem senta/apoia em bloco de luz cinza → Observa timeline de edição desconstruída flutuando em luz branca

## CENA 06 — O Renascimento (Final & Contato) | Scroll 95-100%
Personagem diminui em direção ao centro → Óculos emitem onda de luz branca/cinza → "Reinicia" atmosfera → Contatos projetados no centro (E-mail, Instagram, WhatsApp)

---

# TIMELINE DE SCROLL

```
SCROLL 0%    ──────► CENA 01: Escuridão → Ativação Óculos → Revelação Personagem
SCROLL 20%   ──────► CENA 02: Caminhada → Projeção Nome/Manifesto
SCROLL 45%   ──────► CENA 03: Pose Projeção → Exibição Comerciais Mestre
SCROLL 70%   ──────► CENA 04: Transição Pose → Carrossel Projetado Outros Projetos
SCROLL 88%   ──────► CENA 05: Pose Análise → Exibição Processo Criativo
SCROLL 100%  ──────► CENA 06: Encolhe → Explosão Luz Sutil → Hub Contato
```

---

# ANIMAÇÕES NECESSÁRIAS (Sprite Sheets / Sequência Frames)

1. `idle_intro` - Parado com óculos brilhando (loop sutil)
2. `walk_forward` - Caminhada frontal (12-24 frames)
3. `turn_to_camera` - Giro de costas/perfil para frente
4. `pose_projecting` - Virar tronco, apontar olhar para área de projeção
5. `pose_observing` - Perfil analisando vídeos projetados
6. `walk_lateral` - Caminhada lateral para transição
7. `sit_lean` - Sentar/apoiar em bloco de luz
8. `scale_down_exit` - Recuar/diminuir no espaço

---

# ESTADOS DO PERSONAGEM

- `idle` - Parado, respiração sutil, óculos pulsando
- `walking` - Caminhada com peso, tecido se movendo
- `looking` - Olhar direcionado (câmera, projeto, ambiente)
- `projecting` - Pose ativa de projeção (mão/óculos emitindo)
- `observing` - Análise contemplativa
- `interacting` - Toque/manipulação de elementos projetados
- `leaving` - Saída/encolhimento final

---

# PROJETOS A EXIBIR (10 Total)

**Prioridade Alta (Cenas Dedicadas): Comerciais**
**Prioridade Média (Carrossel Projetado): Redes Sociais, Eventos, Corporativos**

Distribuição exata a definir na fase de assets.