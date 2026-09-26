const fs = require('fs')
const path = require('path')

const PUBLIC_DIR = path.join(__dirname, '..', 'public')

const FRAME_COUNTS = {
  idle: 2,
  walk: 12,
  turn: 8,
  projecting: 6,
  observing: 4,
  lateral: 8,
  sit: 6,
  scale: 10,
}

const SEQUENCES = Object.keys(FRAME_COUNTS)

function createPlaceholderSVG(width, height, text, bgColor = '#1a1a1a') {
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${bgColor}"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
        font-family="monospace" font-size="14" fill="#888899">${text}</text>
</svg>`
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function generateCharacterFrames() {
  const framesDir = path.join(PUBLIC_DIR, 'character', 'frames')
  ensureDir(framesDir)

  SEQUENCES.forEach(seq => {
    const count = FRAME_COUNTS[seq]
    for (let i = 1; i <= count; i++) {
      const filename = `${seq}_${i.toString().padStart(2, '0')}.svg`
      const filepath = path.join(framesDir, filename)
      const svg = createPlaceholderSVG(512, 768, `FRAME: ${seq.toUpperCase()} ${i}/${count}`)
      fs.writeFileSync(filepath, svg)
    }
  })

  const glowPath = path.join(PUBLIC_DIR, 'ui', 'glasses_glow.svg')
  const glowSvg = createPlaceholderSVG(512, 512, 'GLASSES GLOW', '#000000')
  fs.writeFileSync(glowPath, glowSvg)

  console.log('Character frames generated')
}

function generateProjectThumbnails() {
  const projects = [
    { dir: 'comerciais', files: ['proj_comercial_01', 'proj_comercial_02', 'proj_comercial_03', 'proj_comercial_04'] },
    { dir: 'social', files: ['proj_social_01', 'proj_social_02', 'proj_social_03'] },
    { dir: 'eventos', files: ['proj_event_01', 'proj_event_02'] },
    { dir: 'corporativo', files: ['proj_corp_01'] },
  ]

  projects.forEach(({ dir, files }) => {
    const projectDir = path.join(PUBLIC_DIR, 'projects', dir)
    ensureDir(projectDir)

    files.forEach(file => {
      const thumbPath = path.join(projectDir, `thumb_${file}.svg`)
      const thumbSvg = createPlaceholderSVG(640, 360, `THUMB: ${file.toUpperCase()}`, '#0a0a0a')
      fs.writeFileSync(thumbPath, thumbSvg)

      const posterPath = path.join(projectDir, `poster_${file}.svg`)
      fs.writeFileSync(posterPath, thumbSvg)
    })
  })

  console.log('Project thumbnails generated')
}

function generateUIAssets() {
  const uiDir = path.join(PUBLIC_DIR, 'ui')
  ensureDir(uiDir)

  const assets = [
    { name: 'projection_frame_16x9.svg', w: 1280, h: 720, text: 'FRAME 16:9' },
    { name: 'projection_frame_9x16.svg', w: 720, h: 1280, text: 'FRAME 9:16' },
    { name: 'projection_frame_1x1.svg', w: 720, h: 720, text: 'FRAME 1:1' },
    { name: 'cursor_default.svg', w: 32, h: 32, text: 'CURSOR' },
  ]

  assets.forEach(({ name, w, h, text }) => {
    const filepath = path.join(uiDir, name)
    const svg = createPlaceholderSVG(w, h, text, '#000000')
    fs.writeFileSync(filepath, svg)
  })

  console.log('UI assets generated')
}

function generateFavicon() {
  const publicDir = PUBLIC_DIR
  const faviconSvg = `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="8" cy="16" rx="7" ry="3.5" fill="none" stroke="#fff" stroke-width="1.5"/>
  <ellipse cx="24" cy="16" rx="7" ry="3.5" fill="none" stroke="#fff" stroke-width="1.5"/>
  <path d="M8 16 Q16 10 24 16" fill="none" stroke="#fff" stroke-width="1" stroke-linecap="round"/>
</svg>`
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg)
  console.log('Favicon generated')
}

function main() {
  console.log('Generating asset placeholders...\n')
  
  generateCharacterFrames()
  generateProjectThumbnails()
  generateUIAssets()
  generateFavicon()

  console.log('\nAll placeholders generated!')
  console.log('\nNext steps:')
  console.log('1. Replace .svg files in public/character/frames/ with actual rendered frames (WebP/PNG)')
  console.log('2. Replace project thumbnails in public/projects/*/ with actual thumbnails')
  console.log('3. Replace UI assets in public/ui/ with final versions')
  console.log('4. Add video files (.webm, .mp4) to public/projects/*/')
  console.log('5. Run: npm run dev')
}

main()