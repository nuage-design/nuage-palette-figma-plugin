import { dispatch, handleEvent } from './codeMessageHandler';

const OPTIONS: ShowUIOptions = { width: 310, height: 234 }
const COLORS: string[] = ['primary', 'success', 'info', 'warning', 'danger', 'dark'];

figma.showUI(__html__, OPTIONS);

interface Size {
	width: number,
	height: number,
}
interface HSL {
	h: number,
	s: number,
	l: number,
}
interface PaletteRGB {
	50:  RGB,
	100: RGB,
	200: RGB,
	300: RGB,
	400: RGB,
	500: RGB,
	600: RGB,
	700: RGB,
	800: RGB,
	900: RGB,
	'100-transparent': RGB,
	'200-transparent': RGB,
}
interface PaletteHSL {
	50: string,
	100: string,
	200: string,
	300: string,
	400: string,
	500: string,
	600: string,
	700: string,
	800: string,
	900: string,
};

interface PaletteHex extends PaletteHSL { };

function hexToRgb(hex: string): RGB {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1], 16) / 255,
				g: parseInt(result[2], 16) / 255,
				b: parseInt(result[3], 16) / 255,
			}
		: null;
}

function hexToHSL(H: string): HSL | null {
  let ex = /^#([\da-f]{3}){1,2}$/i;
	if (ex.test(H)) {
		// convert hex to RGB first
		let r: number = 0;
		let g: number = 0;
		let b: number = 0;
		
		if (H.length == 4) {
			r = Number("0x" + H[1] + H[1]);
			g = Number("0x" + H[2] + H[2]);
			b = Number("0x" + H[3] + H[3]);
		} else if (H.length == 7) {
			r = Number("0x" + H[1] + H[2]);
			g = Number("0x" + H[3] + H[4]);
			b = Number("0x" + H[5] + H[6]);
		}
		// then to HSL
		r /= 255;
		g /= 255;
		b /= 255;
		
		let cmin: number = Math.min(r, g, b);
		let cmax: number = Math.max(r, g, b);
		let delta: number = cmax - cmin;

		let h: number = 0;
		let s: number = 0;
    let l: number = 0;

    if (delta == 0) h = 0;
    else if (cmax == r) h = ((g - b) / delta) % 6;
    else if (cmax == g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    if (h < 0) h += 360;

    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return {h, s, l};
  } else {
    return null;
  }
}

function hslToHex(hsl: HSL): string {
  const l = hsl.l / 100;
  const a = hsl.s * Math.min(l, 1 - l) / 100;
  const f = (n: number): string => {
    const k = (n + hsl.h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function createPalette(hsl: HSL) {
	const lightness = (100 - hsl.l) / 5;
	const darkness = hsl.l / 7;

	const paletteHex: PaletteHex = {
		50: hslToHex({h: hsl.h, s: hsl.s, l: Math.round(hsl.l + lightness * 4.5)}),
		100: hslToHex({h: hsl.h, s: hsl.s, l: Math.round(hsl.l + lightness * 4)}),
		200: hslToHex({h: hsl.h, s: hsl.s, l: Math.round(hsl.l + lightness * 3)}),
		300: hslToHex({h: hsl.h, s: hsl.s, l: Math.round(hsl.l + lightness * 2)}),
		400: hslToHex({h: hsl.h, s: hsl.s, l: Math.round(hsl.l + lightness)}),
		500: hslToHex({h: hsl.h, s: hsl.s, l: hsl.l}),
		600: hslToHex({h: hsl.h, s: hsl.s, l: Math.round(hsl.l - darkness)}),
		700: hslToHex({h: hsl.h, s: hsl.s, l: Math.round(hsl.l - darkness * 2)}),
		800: hslToHex({h: hsl.h, s: hsl.s, l: Math.round(hsl.l - darkness * 3)}),
		900: hslToHex({h: hsl.h, s: hsl.s, l: Math.round(hsl.l - darkness * 3.75)}),
	}

	const paletteRGB: PaletteRGB = {
		50: hexToRgb(paletteHex['50']),
		100: hexToRgb(paletteHex['100']),
		200: hexToRgb(paletteHex['200']),
		300: hexToRgb(paletteHex['300']),
		400: hexToRgb(paletteHex['400']),
		500: hexToRgb(paletteHex['500']),
		600: hexToRgb(paletteHex['600']),
		700: hexToRgb(paletteHex['700']),
		800: hexToRgb(paletteHex['800']),
		900: hexToRgb(paletteHex['900']),
		'100-transparent': hexToRgb(paletteHex['100']),
		'200-transparent': hexToRgb(paletteHex['200']),
	}

	return paletteRGB;
}

handleEvent('createColorBlock', (hexObj: Object) => {
	const size: Size = {
		width: 150,
		height: 60,
	}

	const styles: PaintStyle[] = figma.getLocalPaintStyles();
	console.log(styles);

	for (let i = 0; i < COLORS.length; i++) {
		let paletteRGB: PaletteRGB = createPalette(hexToHSL(hexObj[COLORS[i]]));
		let j: number = 0;

		for (let key in paletteRGB) {
			let paint: SolidPaint;
			paint = {
				type: 'SOLID',
				color: paletteRGB[key],
				opacity: key.indexOf('transparent') != -1 ? 0.5 : 1
			};

			const rect = figma.createRectangle();
			let style = styles.find((style) => style.name === `${COLORS[i]}/${key}`);

			if (style) style.paints = [paint];
			else {
				style = figma.createPaintStyle();
				style.name = `${COLORS[i]}/${key}`
				style.paints = [paint];
			}

			rect.name = `${COLORS[i]}-${key}`;
			rect.y = j++ * size.height;
			rect.x = i * size.width;

			rect.resize(size.width, size.height);
			rect.fillStyleId = style.id;
		}
	}
	
	dispatch('colorBlockCreated');
});
