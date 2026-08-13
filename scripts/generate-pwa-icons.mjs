/**
 * Gera os ícones quadrados do PWA do painel admin a partir da logo do grupo.
 *
 * Sem dependências externas: decodifica/codifica PNG usando apenas `zlib`.
 * A logo original é 2240x1260 (retangular) — declará-la como 192x192 no manifest
 * faz o Chrome recusar a instalação. Aqui ela é reamostrada e centralizada sobre
 * um fundo sólido, gerando ícones `any` e `maskable` válidos.
 *
 *   node scripts/generate-pwa-icons.mjs
 */

import fs from "node:fs"
import path from "node:path"
import zlib from "node:zlib"

const SOURCE = "public/images/logos/logo-grupo-michelines.png"
const OUT_DIR = "public/icons"

// Fundo dos ícones. A logo é azul-escura sobre transparente, então precisa de
// fundo claro para manter contraste (sobre navy ela praticamente desaparece).
const BG = { r: 0xff, g: 0xff, b: 0xff }

/** Ícones a gerar: [arquivo, lado, fração ocupada pela logo] */
const TARGETS = [
  ["admin-192.png", 192, 0.82],
  ["admin-512.png", 512, 0.82],
  // Maskable: o launcher recorta um círculo, então a logo fica na zona segura (80%)
  ["admin-maskable-192.png", 192, 0.6],
  ["admin-maskable-512.png", 512, 0.6],
  ["admin-apple-180.png", 180, 0.78],
]

// ─── Decodificação de PNG (RGBA 8-bit, não entrelaçado) ───────────────────────

function decodePng(buffer) {
  if (buffer.readUInt32BE(0) !== 0x89504e47) throw new Error("Não é um PNG")

  const width = buffer.readUInt32BE(16)
  const height = buffer.readUInt32BE(20)
  const bitDepth = buffer[24]
  const colorType = buffer[25]
  const interlace = buffer[28]

  if (bitDepth !== 8) throw new Error(`bitDepth ${bitDepth} não suportado`)
  if (interlace !== 0) throw new Error("PNG entrelaçado não suportado")

  // 0=gray, 2=RGB, 4=gray+alpha, 6=RGBA
  const CHANNELS = { 0: 1, 2: 3, 4: 2, 6: 4 }
  const channels = CHANNELS[colorType]
  if (!channels) throw new Error(`colorType ${colorType} não suportado`)

  // Concatena os blocos IDAT
  const idat = []
  let offset = 8
  while (offset < buffer.length) {
    const len = buffer.readUInt32BE(offset)
    const type = buffer.toString("ascii", offset + 4, offset + 8)
    if (type === "IDAT") idat.push(buffer.subarray(offset + 8, offset + 8 + len))
    if (type === "IEND") break
    offset += 12 + len
  }

  const raw = zlib.inflateSync(Buffer.concat(idat))
  const stride = width * channels
  const pixels = Buffer.alloc(width * height * 4)

  let prev = Buffer.alloc(stride)
  let pos = 0

  for (let y = 0; y < height; y++) {
    const filter = raw[pos++]
    const line = Buffer.from(raw.subarray(pos, pos + stride))
    pos += stride

    // Desfaz o filtro da linha (spec PNG §9.2)
    for (let i = 0; i < stride; i++) {
      const a = i >= channels ? line[i - channels] : 0
      const b = prev[i]
      const c = i >= channels ? prev[i - channels] : 0
      switch (filter) {
        case 0: break
        case 1: line[i] = (line[i] + a) & 0xff; break
        case 2: line[i] = (line[i] + b) & 0xff; break
        case 3: line[i] = (line[i] + ((a + b) >> 1)) & 0xff; break
        case 4: {
          const p = a + b - c
          const pa = Math.abs(p - a)
          const pb = Math.abs(p - b)
          const pc = Math.abs(p - c)
          const pred = pa <= pb && pa <= pc ? a : pb <= pc ? b : c
          line[i] = (line[i] + pred) & 0xff
          break
        }
        default: throw new Error(`Filtro PNG desconhecido: ${filter}`)
      }
    }
    prev = line

    // Normaliza qualquer colorType para RGBA
    for (let x = 0; x < width; x++) {
      const src = x * channels
      const dst = (y * width + x) * 4
      if (channels === 4) {
        pixels[dst] = line[src]; pixels[dst + 1] = line[src + 1]
        pixels[dst + 2] = line[src + 2]; pixels[dst + 3] = line[src + 3]
      } else if (channels === 3) {
        pixels[dst] = line[src]; pixels[dst + 1] = line[src + 1]
        pixels[dst + 2] = line[src + 2]; pixels[dst + 3] = 255
      } else if (channels === 2) {
        pixels[dst] = pixels[dst + 1] = pixels[dst + 2] = line[src]
        pixels[dst + 3] = line[src + 1]
      } else {
        pixels[dst] = pixels[dst + 1] = pixels[dst + 2] = line[src]
        pixels[dst + 3] = 255
      }
    }
  }

  return { width, height, pixels }
}

// ─── Codificação de PNG (RGBA 8-bit, filtro 0) ────────────────────────────────

function crc32(buf) {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
  }
  return ~c >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, "ascii"), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function encodePng(width, height, pixels) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8   // bit depth
  ihdr[9] = 6   // RGBA
  ihdr[10] = 0  // compressão deflate
  ihdr[11] = 0  // filtro adaptativo
  ihdr[12] = 0  // sem entrelaçamento

  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0 // filtro None
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ])
}

// ─── Reamostragem por média de área (box filter) ──────────────────────────────

function resize(src, srcW, srcH, dstW, dstH) {
  const out = Buffer.alloc(dstW * dstH * 4)
  const xRatio = srcW / dstW
  const yRatio = srcH / dstH

  for (let y = 0; y < dstH; y++) {
    const y0 = Math.floor(y * yRatio)
    const y1 = Math.max(y0 + 1, Math.floor((y + 1) * yRatio))
    for (let x = 0; x < dstW; x++) {
      const x0 = Math.floor(x * xRatio)
      const x1 = Math.max(x0 + 1, Math.floor((x + 1) * xRatio))

      let r = 0, g = 0, b = 0, a = 0, n = 0
      for (let sy = y0; sy < y1 && sy < srcH; sy++) {
        for (let sx = x0; sx < x1 && sx < srcW; sx++) {
          const i = (sy * srcW + sx) * 4
          const alpha = src[i + 3]
          // Média ponderada pelo alfa: evita halo escuro nas bordas
          r += src[i] * alpha; g += src[i + 1] * alpha; b += src[i + 2] * alpha
          a += alpha
          n++
        }
      }
      const o = (y * dstW + x) * 4
      if (a > 0) {
        out[o] = Math.round(r / a); out[o + 1] = Math.round(g / a); out[o + 2] = Math.round(b / a)
        out[o + 3] = Math.round(a / n)
      }
    }
  }
  return out
}

// ─── Composição sobre fundo sólido ────────────────────────────────────────────

function compose(side, logo, logoW, logoH) {
  const canvas = Buffer.alloc(side * side * 4)
  for (let i = 0; i < side * side; i++) {
    canvas[i * 4] = BG.r; canvas[i * 4 + 1] = BG.g
    canvas[i * 4 + 2] = BG.b; canvas[i * 4 + 3] = 255
  }

  const offX = Math.round((side - logoW) / 2)
  const offY = Math.round((side - logoH) / 2)

  for (let y = 0; y < logoH; y++) {
    for (let x = 0; x < logoW; x++) {
      const s = (y * logoW + x) * 4
      const alpha = logo[s + 3] / 255
      if (alpha === 0) continue
      const d = ((y + offY) * side + (x + offX)) * 4
      canvas[d] = Math.round(logo[s] * alpha + canvas[d] * (1 - alpha))
      canvas[d + 1] = Math.round(logo[s + 1] * alpha + canvas[d + 1] * (1 - alpha))
      canvas[d + 2] = Math.round(logo[s + 2] * alpha + canvas[d + 2] * (1 - alpha))
    }
  }
  return canvas
}

// ─── Execução ─────────────────────────────────────────────────────────────────

const source = decodePng(fs.readFileSync(SOURCE))
console.log(`Origem: ${SOURCE} (${source.width}x${source.height})`)

fs.mkdirSync(OUT_DIR, { recursive: true })

for (const [name, side, scale] of TARGETS) {
  // Preserva a proporção da logo dentro da fração alvo do quadrado
  const budget = side * scale
  const ratio = Math.min(budget / source.width, budget / source.height)
  const logoW = Math.max(1, Math.round(source.width * ratio))
  const logoH = Math.max(1, Math.round(source.height * ratio))

  const logo = resize(source.pixels, source.width, source.height, logoW, logoH)
  const canvas = compose(side, logo, logoW, logoH)
  const out = path.join(OUT_DIR, name)
  fs.writeFileSync(out, encodePng(side, side, canvas))
  console.log(`  ✓ ${out} — ${side}x${side} (logo ${logoW}x${logoH})`)
}

console.log("\nÍcones do PWA gerados com sucesso.")
