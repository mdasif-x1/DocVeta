import 'regenerator-runtime/runtime';
import fontkit from '@pdf-lib/fontkit';
import type { PDFDocument, PDFFont } from 'pdf-lib';

export interface FontKitFont {
  hasGlyphForCodePoint(codePoint: number): boolean;
}

let notoLatinBytes: ArrayBuffer | null = null;
let notoDevanagariBytes: ArrayBuffer | null = null;
let notoSymbolsBytes: ArrayBuffer | null = null;
let notoSymbols2Bytes: ArrayBuffer | null = null;

let parsedLatinFont: FontKitFont | null = null;
let parsedDevanagariFont: FontKitFont | null = null;
let parsedSymbolsFont: FontKitFont | null = null;
let parsedSymbols2Font: FontKitFont | null = null;

async function loadFontArrayBuffer(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load font from ${url}`);
  }
  return await response.arrayBuffer();
}

export interface FontSet {
  latinFont: PDFFont;
  devanagariFont: PDFFont;
  symbolsFont: PDFFont;
  symbols2Font: PDFFont;
  latinMeta: FontKitFont;
  devanagariMeta: FontKitFont;
  symbolsMeta: FontKitFont;
  symbols2Meta: FontKitFont;
}

/**
 * Loads and registers fontkit custom fonts into a pdf-lib PDFDocument instance.
 * Returns embedded PDFFont objects alongside fontkit metadata objects for exact glyph presence checks.
 */
export async function getOrEmbedUnicodeFonts(pdfDoc: PDFDocument): Promise<FontSet> {
  pdfDoc.registerFontkit(fontkit);

  if (!notoLatinBytes) {
    notoLatinBytes = await loadFontArrayBuffer('/fonts/NotoSans-Full.ttf');
  }
  if (!notoDevanagariBytes) {
    notoDevanagariBytes = await loadFontArrayBuffer('/fonts/NotoSansDevanagari-Regular.ttf');
  }
  if (!notoSymbolsBytes) {
    notoSymbolsBytes = await loadFontArrayBuffer('/fonts/NotoSansSymbols-Regular.ttf');
  }
  if (!notoSymbols2Bytes) {
    notoSymbols2Bytes = await loadFontArrayBuffer('/fonts/NotoSansSymbols2-Regular.ttf');
  }

  if (!parsedLatinFont) {
    parsedLatinFont = fontkit.create(new Uint8Array(notoLatinBytes)) as unknown as FontKitFont;
  }
  if (!parsedDevanagariFont) {
    parsedDevanagariFont = fontkit.create(new Uint8Array(notoDevanagariBytes)) as unknown as FontKitFont;
  }
  if (!parsedSymbolsFont) {
    parsedSymbolsFont = fontkit.create(new Uint8Array(notoSymbolsBytes)) as unknown as FontKitFont;
  }
  if (!parsedSymbols2Font) {
    parsedSymbols2Font = fontkit.create(new Uint8Array(notoSymbols2Bytes)) as unknown as FontKitFont;
  }

  const latinFont = await pdfDoc.embedFont(notoLatinBytes, { subset: true });
  const devanagariFont = await pdfDoc.embedFont(notoDevanagariBytes, { subset: true });
  const symbolsFont = await pdfDoc.embedFont(notoSymbolsBytes, { subset: true });
  const symbols2Font = await pdfDoc.embedFont(notoSymbols2Bytes, { subset: true });

  return {
    latinFont,
    devanagariFont,
    symbolsFont,
    symbols2Font,
    latinMeta: parsedLatinFont,
    devanagariMeta: parsedDevanagariFont,
    symbolsMeta: parsedSymbolsFont,
    symbols2Meta: parsedSymbols2Font,
  };
}
