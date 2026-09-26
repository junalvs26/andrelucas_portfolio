$files = @(
    "C:\Users\Jr\Desktop\Portfolio_Interativo\app\src\components\ScanlineOverlay.tsx",
    "C:\Users\Jr\Desktop\Portfolio_Interativo\app\src\components\SceneBackdrop.tsx",
    "C:\Users\Jr\Desktop\Portfolio_Interativo\app\src\components\SceneGallery.tsx",
    "C:\Users\Jr\Desktop\Portfolio_Interativo\app\src\components\SceneProcess.tsx",
    "C:\Users\Jr\Desktop\Portfolio_Interativo\app\src\components\SceneProjection.tsx",
    "C:\Users\Jr\Desktop\Portfolio_Interativo\app\src\components\Vignette.tsx",
    "C:\Users\Jr\Desktop\Portfolio_Interativo\app\src\hooks\useReducedMotion.ts"
)

foreach ($f in $files) {
    if (Test-Path $f) {
        $c = Get-Content -Path $f -Raw
        if ($c.StartsWith("use client")) {
            $c = "'use client'" + $c.Substring(10)
            Set-Content -Path $f -Value $c -Encoding UTF8
            Write-Host "Fixed: $f"
        }
    }
}
