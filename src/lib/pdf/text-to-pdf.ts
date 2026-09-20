import { PDFDocument, StandardFonts, rgb, PDFFont } from 'pdf-lib';
import type { TextToPdfOptions, ProcessingProgress } from '../../types/processing.types';
import { getOrEmbedUnicodeFonts, type FontSet } from './font-loader';

const PAGE_DIMS = {
  A4: { width: 595.28, height: 841.89 },
  Letter: { width: 612.0, height: 792.0 },
};

const MARGIN_DIMS = {
  none: 30,
  small: 40,
  medium: 54,
  large: 72,
};

interface TextRun {
  text: string;
  font: PDFFont;
}

/**
 * Dynamically resolves the best matching font for a given character based on fontkit metadata glyph inspection.
 */
function resolveFontForChar(cp: number, fontSet: FontSet): PDFFont {
  if (fontSet.latinMeta.hasGlyphForCodePoint(cp)) {
    return fontSet.latinFont;
  }
  if (fontSet.devanagariMeta.hasGlyphForCodePoint(cp)) {
    return fontSet.devanagariFont;
  }
  if (fontSet.symbolsMeta.hasGlyphForCodePoint(cp)) {
    return fontSet.symbolsFont;
  }
  if (fontSet.symbols2Meta.hasGlyphForCodePoint(cp)) {
    return fontSet.symbols2Font;
  }
  // Default to latin font
  return fontSet.latinFont;
}

/**
 * Splits a text string into runs mapped to the exact font containing glyph coverage.
 */
function splitTextIntoFontRuns(text: string, fontSet: FontSet | null, fallbackFont: PDFFont): TextRun[] {
  if (!fontSet) {
    return [{ text, font: fallbackFont }];
  }

  const runs: TextRun[] = [];
  let currentSegment = '';
  let currentFont: PDFFont | null = null;

  for (const char of text) {
    const cp = char.codePointAt(0) || 0;
    const targetFont = resolveFontForChar(cp, fontSet);

    if (currentFont === null) {
      currentFont = targetFont;
      currentSegment = char;
    } else if (targetFont === currentFont) {
      currentSegment += char;
    } else {
      runs.push({ text: currentSegment, font: currentFont });
      currentSegment = char;
      currentFont = targetFont;
    }
  }

  if (currentSegment && currentFont) {
    runs.push({ text: currentSegment, font: currentFont });
  }

  return runs;
}

/**
 * Measures the total width of a line containing multi-font runs.
 */
function measureRunsWidth(runs: TextRun[], fontSize: number): number {
  let width = 0;
  for (const run of runs) {
    width += run.font.widthOfTextAtSize(run.text, fontSize);
  }
  return width;
}

/**
 * Splits plain text into wrapped lines of TextRuns fitting maxLineWidth points.
 */
function wrapUnicodeText(
  text: string,
  maxLineWidth: number,
  fontSize: number,
  fontSet: FontSet | null,
  fallbackFont: PDFFont
): TextRun[][] {
  const paragraphs = text.split(/\r?\n/);
  const wrappedLines: TextRun[][] = [];

  for (const para of paragraphs) {
    if (para.trim() === '') {
      wrappedLines.push([]);
      continue;
    }

    const words = para.split(/\s+/);
    let currentLineWords: string[] = [];

    for (const word of words) {
      const candidateText = currentLineWords.length > 0 ? `${currentLineWords.join(' ')} ${word}` : word;
      const candidateRuns = splitTextIntoFontRuns(candidateText, fontSet, fallbackFont);
      const width = measureRunsWidth(candidateRuns, fontSize);

      if (width <= maxLineWidth) {
        currentLineWords.push(word);
      } else {
        if (currentLineWords.length > 0) {
          const lineStr = currentLineWords.join(' ');
          wrappedLines.push(splitTextIntoFontRuns(lineStr, fontSet, fallbackFont));
        }
        currentLineWords = [word];
      }
    }

    if (currentLineWords.length > 0) {
      const lineStr = currentLineWords.join(' ');
      wrappedLines.push(splitTextIntoFontRuns(lineStr, fontSet, fallbackFont));
    }
  }

  return wrappedLines;
}

/**
 * Converts formatted plain text into a multi-page PDF document with full Unicode symbol support.
 */
export async function convertTextToPdf(
  text: string,
  options: TextToPdfOptions,
  onProgress?: (progress: ProcessingProgress) => void
): Promise<Blob> {
  const cleanText = text.trim();
  if (!cleanText) {
    throw new Error('Please enter text to generate a PDF.');
  }

  const pdfDoc = await PDFDocument.create();

  let fontSet: FontSet | null = null;
  let fallbackFont: PDFFont;

  try {
    fontSet = await getOrEmbedUnicodeFonts(pdfDoc);
    fallbackFont = fontSet.latinFont;
  } catch (err) {
    console.warn('Custom TTF font loading failed, falling back to StandardFonts:', err);
    switch (options.fontFamily) {
      case 'TimesRoman':
        fallbackFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        break;
      case 'Courier':
        fallbackFont = await pdfDoc.embedFont(StandardFonts.Courier);
        break;
      case 'Helvetica':
      default:
        fallbackFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        break;
    }
  }

  const pageBase = PAGE_DIMS[options.pageSize] || PAGE_DIMS.A4;
  const margin = MARGIN_DIMS[options.margin] || MARGIN_DIMS.medium;

  const contentWidth = pageBase.width - margin * 2;
  const contentHeight = pageBase.height - margin * 2;

  const fontSize = options.fontSize || 12;
  const lineHeight = fontSize * (options.lineHeight || 1.4);

  const lines = wrapUnicodeText(cleanText, contentWidth, fontSize, fontSet, fallbackFont);

  // Calculate max lines per page
  const maxLinesPerPage = Math.max(5, Math.floor(contentHeight / lineHeight));
  const totalPages = Math.ceil(lines.length / maxLinesPerPage) || 1;

  for (let pageNum = 0; pageNum < totalPages; pageNum++) {
    if (onProgress) {
      onProgress({
        currentStep: pageNum + 1,
        totalSteps: totalPages,
        percentage: Math.round(((pageNum + 1) / totalPages) * 100),
        statusMessage: `Formatting page ${pageNum + 1} of ${totalPages}...`,
      });
    }

    const page = pdfDoc.addPage([pageBase.width, pageBase.height]);
    const startIndex = pageNum * maxLinesPerPage;
    const pageLines = lines.slice(startIndex, startIndex + maxLinesPerPage);

    let currentY = pageBase.height - margin - fontSize;

    for (const lineRuns of pageLines) {
      if (lineRuns.length > 0) {
        let currentX = margin;

        for (const run of lineRuns) {
          page.drawText(run.text, {
            x: currentX,
            y: currentY,
            size: fontSize,
            font: run.font,
            color: rgb(0.1, 0.1, 0.15),
          });
          currentX += run.font.widthOfTextAtSize(run.text, fontSize);
        }
      }
      currentY -= lineHeight;
    }

    // Optional page number footer
    if (options.includePageNumbers) {
      const footerText = `Page ${pageNum + 1} of ${totalPages}`;
      const footerFont = fontSet ? fontSet.latinFont : fallbackFont;
      const footerWidth = footerFont.widthOfTextAtSize(footerText, 9);
      page.drawText(footerText, {
        x: (pageBase.width - footerWidth) / 2,
        y: margin / 2,
        size: 9,
        font: footerFont,
        color: rgb(0.5, 0.5, 0.5),
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
}
