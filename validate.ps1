Set-Location 'C:\Users\Jr\Desktop\Portfolio_Interativo'

$expected = @(
  "app/public/character/frames/idle_01.webp",
  "app/public/character/frames/idle_02.webp",
  "app/public/character/frames/walk_01.webp","app/public/character/frames/walk_02.webp","app/public/character/frames/walk_03.webp","app/public/character/frames/walk_04.webp","app/public/character/frames/walk_05.webp","app/public/character/frames/walk_06.webp","app/public/character/frames/walk_07.webp","app/public/character/frames/walk_08.webp","app/public/character/frames/walk_09.webp","app/public/character/frames/walk_10.webp","app/public/character/frames/walk_11.webp","app/public/character/frames/walk_12.webp",
  "app/public/character/frames/turn_01.webp","app/public/character/frames/turn_02.webp","app/public/character/frames/turn_03.webp","app/public/character/frames/turn_04.webp","app/public/character/frames/turn_05.webp","app/public/character/frames/turn_06.webp","app/public/character/frames/turn_07.webp","app/public/character/frames/turn_08.webp",
  "app/public/character/frames/projecting_01.webp","app/public/character/frames/projecting_02.webp","app/public/character/frames/projecting_03.webp","app/public/character/frames/projecting_04.webp","app/public/character/frames/projecting_05.webp","app/public/character/frames/projecting_06.webp",
  "app/public/character/frames/observing_01.webp","app/public/character/frames/observing_02.webp","app/public/character/frames/observing_03.webp","app/public/character/frames/observing_04.webp",
  "app/public/character/frames/lateral_01.webp","app/public/character/frames/lateral_02.webp","app/public/character/frames/lateral_03.webp","app/public/character/frames/lateral_04.webp","app/public/character/frames/lateral_05.webp","app/public/character/frames/lateral_06.webp","app/public/character/frames/lateral_07.webp","app/public/character/frames/lateral_08.webp",
  "app/public/character/frames/sit_01.webp","app/public/character/frames/sit_02.webp","app/public/character/frames/sit_03.webp","app/public/character/frames/sit_04.webp","app/public/character/frames/sit_05.webp","app/public/character/frames/sit_06.webp",
  "app/public/character/frames/scale_01.webp","app/public/character/frames/scale_02.webp","app/public/character/frames/scale_03.webp","app/public/character/frames/scale_04.webp","app/public/character/frames/scale_05.webp","app/public/character/frames/scale_06.webp","app/public/character/frames/scale_07.webp","app/public/character/frames/scale_08.webp","app/public/character/frames/scale_09.webp","app/public/character/frames/scale_10.webp",
  "app/public/ui/frame_16x9.svg","app/public/ui/frame_9x16.svg","app/public/ui/frame_1x1.svg",
  "app/public/ui/glasses_glow.webp","app/public/ui/projection_beam.webp","app/public/ui/rebirth_wave.webp","app/public/ui/favicon.svg",
  "app/public/ui/env_floor.webp","app/public/ui/env_fog_01.webp","app/public/ui/env_fog_02.webp","app/public/ui/env_fog_03.webp",
  "app/public/character/animations/glasses_activation.webm","app/public/character/animations/glasses_activation.mp4",
  "app/public/character/animations/glasses_pulse.webm","app/public/character/animations/glasses_pulse.mp4",
  "app/public/character/animations/projection_beam.webm","app/public/character/animations/projection_beam.mp4",
  "app/public/character/animations/rebirth_wave.webm","app/public/character/animations/rebirth_wave.mp4",
  "app/public/projects/comerciais/proj_comercial_01.webm","app/public/projects/comerciais/proj_comercial_01.mp4","app/public/projects/comerciais/thumb_comercial_01.webp",
  "app/public/projects/comerciais/proj_comercial_02.webm","app/public/projects/comerciais/proj_comercial_02.mp4","app/public/projects/comerciais/thumb_comercial_02.webp",
  "app/public/projects/comerciais/proj_comercial_03.webm","app/public/projects/comerciais/proj_comercial_03.mp4","app/public/projects/comerciais/thumb_comercial_03.webp",
  "app/public/projects/comerciais/proj_comercial_04.webm","app/public/projects/comerciais/proj_comercial_04.mp4","app/public/projects/comerciais/thumb_comercial_04.webp",
  "app/public/projects/social/proj_social_01.webm","app/public/projects/social/proj_social_01.mp4","app/public/projects/social/thumb_social_01.webp",
  "app/public/projects/social/proj_social_02.webm","app/public/projects/social/proj_social_02.mp4","app/public/projects/social/thumb_social_02.webp",
  "app/public/projects/social/proj_social_03.webm","app/public/projects/social/proj_social_03.mp4","app/public/projects/social/thumb_social_03.webp",
  "app/public/projects/eventos/proj_event_01.webm","app/public/projects/eventos/proj_event_01.mp4","app/public/projects/eventos/thumb_event_01.webp",
  "app/public/projects/eventos/proj_event_02.webm","app/public/projects/eventos/proj_event_02.mp4","app/public/projects/eventos/thumb_event_02.webp",
  "app/public/projects/corporativo/proj_corp_01.webm","app/public/projects/corporativo/proj_corp_01.mp4","app/public/projects/corporativo/thumb_corp_01.webp"
)

$missing = $expected | Where-Object { -not (Test-Path $_) }
if ($missing) {
    Write-Host "FALTANDO:" -ForegroundColor Red
    $missing | ForEach-Object { Write-Host "  $_" }
} else {
    Write-Host "TODOS OS 100+ ARQUIVOS PRESENTES" -ForegroundColor Green
}
