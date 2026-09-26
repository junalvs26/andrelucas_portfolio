"use client"

import { useEffect, useRef } from "react"
import { subscribeMotion } from "@/lib/motion"
import { useResizeObserver } from "@/hooks/useRenderLoop"
import { useReducedMotion } from "@/hooks/useReducedMotion"

const VS_SOURCE = [
  "attribute vec2 position;",
  "varying vec2 vUv;",
  "void main() {",
  "  vUv = position * 0.5 + 0.5;",
  "  gl_Position = vec4(position, 0.0, 1.0);",
  "}",
].join("\n")

const FS_SOURCE = [
  "precision mediump float;",
  "varying vec2 vUv;",
  "uniform float uTime;",
  "uniform float uSpeed;",
  "uniform float uDpr;",
  "uniform vec2 uResolution;",
  "",
  "float hash(vec2 p) {",
  "  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);",
  "}",
  "",
  "void main() {",
  // Posicao em pixels fisicos e em pixels CSS. Sao coisas diferentes e cada
  // efeito precisa da sua: scanline e uma medida de DESIGN (espessura aparente
  // constante em qualquer tela), grao e uma medida de DISPOSITIVO (uma amostra
  // por pixel real).
  "  vec2 devicePx = vUv * uResolution;",
  "  vec2 cssPx = devicePx / uDpr;",
  "",
  // Scanlines em espaco CSS, periodo de 3px. Antes a frequencia era
  // `uResolution.y * 0.9`, ou seja, em pixels FISICOS: num painel 2x o periodo
  // caia para ~1.1px, abaixo do limite de Nyquist da propria tela, e a senoide
  // virava moire. Em espaco CSS o periodo e estavel e sempre amostravel.
  "  float lines = sin(cssPx.y * 2.094 - uTime * 2.2);",
  "  float scan = smoothstep(0.35, 1.0, lines) * 0.022;",
  "",
  // Grao de filme: uma amostra por pixel fisico, nem mais nem menos. O fator
  // 0.6 que havia aqui espalhava cada amostra por ~1.7px, o que e exatamente a
  // aparencia de ruido em blocos.
  //
  // O tempo entra quantizado em ~12fps: grao renovado a 120fps vira cinza
  // uniforme, porque o olho integra frames consecutivos.
  "  float grainTime = floor(uTime * 12.0);",
  "  float grain = hash(devicePx + grainTime) * 0.030;",
  "",
  // Faixa de brilho percorrendo a tela devagar, como varredura de tubo.
  "  float sweep = exp(-pow((fract(uTime * 0.07) - vUv.y) * 7.0, 2.0)) * 0.035;",
  "",
  // A intensidade reage a velocidade do scroll: rolar rapido aumenta o grao e
  // as linhas, o que da textura ao movimento e mascara o serrilhado.
  "  float boost = 1.0 + uSpeed * 1.6;",
  "  float amount = (scan + grain + sweep) * boost;",
  "",
  "  gl_FragColor = vec4(vec3(1.0), amount);",
  "}",
].join("\n")

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    // Antes os erros de compilacao eram engolidos: o shader falhava, o
    // programa era usado de qualquer jeito e a camada ficava simplesmente
    // invisivel, sem nenhuma pista do motivo.
    console.warn("ScanlineOverlay shader:", gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

/**
 * Textura de filme sobre a cena: scanlines, grao e varredura.
 *
 * Mudancas: o shader agora reage a velocidade do scroll, o grao e quantizado no
 * tempo (senao vira cinza chapado), e falhas de compilacao sao reportadas em
 * vez de produzirem silenciosamente uma camada vazia.
 */
export default function ScanlineOverlay() {
  const prefersReducedMotion = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const uniformsRef = useRef<{
    time: WebGLUniformLocation | null
    speed: WebGLUniformLocation | null
    dpr: WebGLUniformLocation | null
    resolution: WebGLUniformLocation | null
  } | null>(null)

  useEffect(() => {
    if (prefersReducedMotion) return
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      // O conteudo e regenerado por frame; preservar o buffer so custa
      // banda de memoria.
      preserveDrawingBuffer: false,
    }) as WebGLRenderingContext | null
    if (!gl) return

    const vs = compile(gl, gl.VERTEX_SHADER, VS_SOURCE)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FS_SOURCE)
    if (!vs || !fs) return

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("ScanlineOverlay program:", gl.getProgramInfoLog(program))
      return
    }

    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    )

    const posLoc = gl.getAttribLocation(program, "position")
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    glRef.current = gl
    uniformsRef.current = {
      time: gl.getUniformLocation(program, "uTime"),
      speed: gl.getUniformLocation(program, "uSpeed"),
      dpr: gl.getUniformLocation(program, "uDpr"),
      resolution: gl.getUniformLocation(program, "uResolution"),
    }

    // A resolucao e enviada aqui tambem: o callback de resize roda antes do
    // contexto existir na primeira montagem.
    if (uniformsRef.current.resolution) {
      gl.uniform2f(uniformsRef.current.resolution, canvas.width, canvas.height)
    }
    if (uniformsRef.current.dpr) {
      gl.uniform1f(uniformsRef.current.dpr, Math.min(window.devicePixelRatio || 1, 2))
    }

    return () => {
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buffer)
      glRef.current = null
      uniformsRef.current = null
    }
  }, [prefersReducedMotion])

  useResizeObserver((dims) => {
    const canvas = canvasRef.current
    if (!canvas) return
    // Resolucao fisica plena, obrigatoriamente.
    //
    // Este canvas rodava a `min(dpr, 1.25)` para economizar fill rate. Foi um
    // erro: grao e scanline sao justamente detalhe de alta frequencia de um
    // pixel. Gerado a 0.625x da resolucao fisica e esticado, cada amostra de
    // ruido virava um bloco de 2x2 pixels - ruido em blocos sobre a tela
    // inteira, em todas as cenas. E o custo que isso economizava era irrisorio:
    // o shader nao le textura nenhuma e faz um passe unico sem profundidade.
    canvas.width = Math.round(dims.width * dims.dpr)
    canvas.height = Math.round(dims.height * dims.dpr)
    canvas.style.width = dims.width + "px"
    canvas.style.height = dims.height + "px"

    const gl = glRef.current
    if (!gl) return
    gl.viewport(0, 0, canvas.width, canvas.height)
    if (uniformsRef.current?.resolution) {
      gl.uniform2f(uniformsRef.current.resolution, canvas.width, canvas.height)
    }
    if (uniformsRef.current?.dpr) {
      gl.uniform1f(uniformsRef.current.dpr, dims.dpr)
    }
  })

  useEffect(() => {
    if (prefersReducedMotion) return

    return subscribeMotion((state) => {
      const gl = glRef.current
      const uniforms = uniformsRef.current
      if (!gl || !uniforms) return

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      if (uniforms.time) gl.uniform1f(uniforms.time, state.time / 1000)
      if (uniforms.speed) gl.uniform1f(uniforms.speed, state.speed)

      gl.drawArrays(gl.TRIANGLES, 0, 6)
    })
  }, [prefersReducedMotion])

  if (prefersReducedMotion) return null

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-[100] h-full w-full"
      aria-hidden="true"
      style={{ mixBlendMode: "screen" }}
    />
  )
}
