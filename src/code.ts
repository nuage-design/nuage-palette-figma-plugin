import { dispatch, handleEvent } from './codeMessageHandler'

const OPTIONS: ShowUIOptions = { width: 310, height: 234 }
const COLORS: string[] = [
  'primary',
  'success',
  'info',
  'warning',
  'danger',
  'dark',
]

figma.showUI(__html__, OPTIONS)

function hexToHSL(H: string): HSL | null {
  let ex = /^#([\da-f]{3}){1,2}$/i
  if (ex.test(H)) {
    // convert hex to RGB first
    let r: number = 0
    let g: number = 0
    let b: number = 0

    if (H.length == 4) {
      r = Number('0x' + H[1] + H[1])
      g = Number('0x' + H[2] + H[2])
      b = Number('0x' + H[3] + H[3])
    } else if (H.length == 7) {
      r = Number('0x' + H[1] + H[2])
      g = Number('0x' + H[3] + H[4])
      b = Number('0x' + H[5] + H[6])
    }
    // then to HSL
    r /= 255
    g /= 255
    b /= 255

    let cmin: number = Math.min(r, g, b)
    let cmax: number = Math.max(r, g, b)
    let delta: number = cmax - cmin

    let h: number = 0
    let s: number = 0
    let l: number = 0

    if (delta == 0) h = 0
    else if (cmax == r) h = ((g - b) / delta) % 6
    else if (cmax == g) h = (b - r) / delta + 2
    else h = (r - g) / delta + 4

    h = Math.round(h * 60)

    if (h < 0) h += 360

    l = (cmax + cmin) / 2
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))
    s = +(s * 100).toFixed(1)
    l = +(l * 100).toFixed(1)

    // console.log(h, s, l)
    return { h, s, l }
  } else {
    return null
  }
}

function HSLToRGB(h: number, s: number, l: number): RGB {
  let r: number
  let g: number
  let b: number

  h /= 360
  s /= 100

  if (s == 0) {
    r = g = b = l // achromatic
  } else {
    let hue2rgb = function hue2rgb(p: number, q: number, t: number) {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    let q = l < 0.5 ? l * (1 + s) : l + s - l * s
    let p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return { r, g, b }
}

function createPalette(hsl: HSL): PaletteRGB {
  let { h, s } = hsl

  const paletteRGB: PaletteRGB = {
    50: HSLToRGB(h, s, 0.95),
    100: HSLToRGB(h, s, 0.9),
    200: HSLToRGB(h, s, 0.8),
    300: HSLToRGB(h, s, 0.7),
    400: HSLToRGB(h, s, 0.6),
    500: HSLToRGB(h, s, 0.5),
    600: HSLToRGB(h, s, 0.4),
    700: HSLToRGB(h, s, 0.3),
    800: HSLToRGB(h, s, 0.2),
    900: HSLToRGB(h, s, 0.1),
    '100-transparent': HSLToRGB(h, s, 0.9),
    '200-transparent': HSLToRGB(h, s, 0.8),
  }

  return paletteRGB
}

handleEvent('createColorBlock', (hexObj: Object) => {
  const size: Size = {
    width: 150,
    height: 60,
  }

  const styles: PaintStyle[] = figma.getLocalPaintStyles()
  console.log(styles)

  for (let i = 0; i < COLORS.length; i++) {
    let paletteRGB: PaletteRGB = createPalette(hexToHSL(hexObj[COLORS[i]]))
    let j: number = 0

    for (let key in paletteRGB) {
      let paint: SolidPaint
      paint = {
        type: 'SOLID',
        color: paletteRGB[key],
        opacity: key.indexOf('transparent') != -1 ? 0.5 : 1,
      }

      const rect = figma.createRectangle()
      let style = styles.find((style) => style.name === `${COLORS[i]}/${key}`)

      if (style) style.paints = [paint]
      else {
        style = figma.createPaintStyle()
        style.name = `${COLORS[i]}/${key}`
        style.paints = [paint]
      }

      rect.name = `${COLORS[i]}-${key}`
      rect.y = j++ * size.height
      rect.x = i * size.width

      rect.resize(size.width, size.height)
      rect.fillStyleId = style.id
    }
  }

  dispatch('colorBlockCreated')
})
