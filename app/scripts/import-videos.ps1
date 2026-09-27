<#
.SYNOPSIS
  Converte um video original em preview leve para um slot de `src/config/projects.ts`.

.DESCRIPTION
  Os videos da galeria e da projecao sao LOOPS DECORATIVOS MUDOS: `ProjectMedia`
  monta o <video> com `loop muted playsInline` e nunca mostra controles. Entao
  subir o master de 1080p com audio e desperdicio puro de banda - o visitante
  nunca ouve o audio nem assiste ate o fim.

  Este script produz, a partir do original:
    - <slot>.webm  (VP9, sem audio, o que o navegador tenta primeiro)
    - <slot>.mp4   (H.264, sem audio, fallback do Safari)
    - <poster>     (webp extraido do proprio trecho, primeiro quadro visivel)

  Os nomes de saida vem de `projects.ts`, entao nao ha como errar o caminho:
  passe o `id` do projeto e o script escreve exatamente onde o site procura.

.EXAMPLE
  ./scripts/import-videos.ps1 -Id comercial-01 -Source "D:\videos\campanha.mp4" -Start 00:00:12 -Duration 8

.EXAMPLE
  # Ver os slots disponiveis e quais ja tem arquivo
  ./scripts/import-videos.ps1 -List
#>
param(
  [string]$Id,
  [string]$Source,
  [string]$Start = "00:00:00",
  [int]$Duration = 8,
  # Altura do preview. 720 e o teto util: o quadro nunca ocupa a tela toda.
  [int]$Height = 720,
  # Qualidade VP9. Maior = menor arquivo. 36-40 e a faixa boa para loop curto.
  [int]$Crf = 38,
  [switch]$List,
  [switch]$Force
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$public = Join-Path $root 'public'
$configPath = Join-Path $root 'src/config/projects.ts'

# Le os slots do proprio projects.ts para nao duplicar a lista de caminhos.
$config = Get-Content $configPath -Raw
$slots = [ordered]@{}
$re = [regex]'id:\s*"(?<id>[^"]+)"[\s\S]*?aspect:\s*"(?<aspect>[^"]+)"[\s\S]*?video:\s*"(?<video>[^"]+)"[\s\S]*?poster:\s*"(?<poster>[^"]+)"'
foreach ($m in $re.Matches($config)) {
  $slots[$m.Groups['id'].Value] = @{
    aspect = $m.Groups['aspect'].Value
    video  = $m.Groups['video'].Value
    poster = $m.Groups['poster'].Value
  }
}

if ($List -or -not $Id) {
  "{0,-14} {1,-6} {2,-46} {3}" -f 'ID','ASPECT','VIDEO','STATUS'
  foreach ($k in $slots.Keys) {
    $s = $slots[$k]
    $webm = Join-Path $public $s.video.TrimStart('/')
    $mp4 = [IO.Path]::ChangeExtension($webm, 'mp4')
    $has = @()
    if (Test-Path $webm) { $has += 'webm' }
    if (Test-Path $mp4) { $has += 'mp4' }
    if (Test-Path (Join-Path $public $s.poster.TrimStart('/'))) { $has += 'poster' }
    $status = if ($has) { $has -join '+' } else { '--- vazio' }
    "{0,-14} {1,-6} {2,-46} {3}" -f $k, $s.aspect, $s.video, $status
  }
  if (-not $Id) { return }
  return
}

if (-not $slots.Contains($Id)) {
  throw "Id '$Id' nao existe em src/config/projects.ts. Rode com -List para ver os slots."
}
if (-not $Source -or -not (Test-Path $Source)) {
  throw "Passe -Source com o caminho do video original."
}
if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
  throw "ffmpeg nao encontrado no PATH."
}

$slot = $slots[$Id]
$webmOut = Join-Path $public $slot.video.TrimStart('/')
$mp4Out = [IO.Path]::ChangeExtension($webmOut, 'mp4')
$posterOut = Join-Path $public $slot.poster.TrimStart('/')
New-Item -ItemType Directory -Force (Split-Path $webmOut) | Out-Null

if ((Test-Path $webmOut) -and -not $Force) {
  throw "$webmOut ja existe. Use -Force para sobrescrever."
}

# `scale` com -2 mantem a proporcao original e garante largura par (exigencia do H.264).
$scale = "scale=-2:$Height"
$trim = @('-ss', $Start, '-t', "$Duration")

Write-Host "[1/3] webm (VP9 crf $Crf)" -ForegroundColor Cyan
& ffmpeg -y @trim -i $Source -an -vf $scale -c:v libvpx-vp9 -crf $Crf -b:v 0 -row-mt 1 -deadline good -cpu-used 2 $webmOut
if ($LASTEXITCODE -ne 0) { throw 'ffmpeg falhou no webm' }

Write-Host "[2/3] mp4 (H.264 fallback)" -ForegroundColor Cyan
& ffmpeg -y @trim -i $Source -an -vf $scale -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart $mp4Out
if ($LASTEXITCODE -ne 0) { throw 'ffmpeg falhou no mp4' }

Write-Host "[3/3] poster webp" -ForegroundColor Cyan
& ffmpeg -y -ss $Start -i $Source -frames:v 1 -vf $scale -q:v 80 $posterOut
if ($LASTEXITCODE -ne 0) { throw 'ffmpeg falhou no poster' }

Write-Host ''
foreach ($f in @($webmOut, $mp4Out, $posterOut)) {
  $kb = [math]::Round((Get-Item $f).Length / 1KB)
  Write-Host ("  {0,7} KB  {1}" -f $kb, $f.Replace($public, 'public'))
}
Write-Host "`nOK - $Id pronto. Nada para mexer em projects.ts." -ForegroundColor Green
