# PROTOCOLO DE GERAÇÃO (para o agente do Antigravity)

Você é o EXECUTOR de geração de imagens. Outro agente (Claude) audita os resultados.
Não invente, não improvise prompts, não pule itens.

## Arquivos (todos em `workflow/`)
- `queue.json`    → fila de itens (LEIA). Não edite.
- `status.json`   → seu diário (ESCREVA). Uma entrada por item gerado.
- `feedback.json` → correções do auditor (LEIA na rodada de refação).
- `inbox/`        → onde você salva as imagens geradas.

## Rodada normal
Para cada item de `queue.json` cujo `id` NÃO esteja em `status.json` como `done`:
1. Monte o prompt final = `base_prompt` + " " + `prompt` do item.
2. ANEXE como imagem de referência TODOS os arquivos listados em `refs` do item
   (caminhos relativos à raiz do projeto). Sem referência anexada = item inválido.
3. Gere UMA imagem na proporção `aspect` do item, fundo conforme `background`.
4. Salve em `workflow/inbox/{id}.png` (sem renomear, sem subpastas).
5. Acrescente em `status.json`: {"id": "...", "state": "done", "file": "inbox/{id}.png", "note": "<problemas que VOCÊ notou, ou vazio>"}.
6. Se falhar/bloquear: {"id": "...", "state": "failed", "note": "<motivo exato>"} e siga para o próximo.

## Rodada de refação
Leia `feedback.json`. Para cada item com `verdict: "redo"`:
gere de novo usando SOMENTE o campo `fixed_prompt` como prompt completo (ignore `base_prompt` e o `prompt` da fila), as refs do campo `refs` do feedback (se existir; senão as da fila),
sobrescreva `inbox/{id}.png` e atualize `status.json` (state "done", note "redo N").
Itens `approved` NÃO devem ser tocados.

## Regras
- Lote: faça no máximo os itens de `batch` que o usuário indicar; pare ao terminar.
- Uma imagem por item. Não gere variações extras.
- Nunca altere `queue.json`, `feedback.json` nem arquivos fora de `inbox/` e `status.json`.
