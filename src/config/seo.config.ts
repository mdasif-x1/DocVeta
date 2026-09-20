import type { ToolId } from '../types/tool.types';

export interface ToolSeoData {
  slug: string;
  title: string;
  description: string;
  h1: string;
  badge: string;
  howTo: {
    step: number;
    title: string;
    description: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
}

export const SEO_CONFIG: Record<ToolId, ToolSeoData> = {
  'image-to-pdf': {
    slug: 'image-to-pdf',
    title: 'Image to PDF Converter — Free Online | DocVeta',
    description: 'Convert JPG, PNG, and WebP images to high-quality PDF files online. Reorder, rotate, adjust margins, and download your PDF instantly without signing up.',
    h1: 'Image to PDF Converter',
    badge: '100% In-Browser & Private',
    howTo: [
      {
        step: 1,
        title: 'Select or drop your images',
        description: 'Choose JPG, PNG, or WebP images from your phone, tablet, or computer. You can upload multiple images at once.',
      },
      {
        step: 2,
        title: 'Reorder, rotate, and adjust layout',
        description: 'Drag or use the arrow buttons to arrange pages in your desired sequence. Rotate photos and configure page margins.',
      },
      {
        step: 3,
        title: 'Generate and download PDF',
        description: 'Click "Create PDF". Your document is compiled instantly in your browser and ready to download.',
      },
    ],
    faqs: [
      {
        question: 'Are my images uploaded to an external server?',
        answer: 'No. DocVeta processes your images entirely inside your browser using client-side JavaScript. Your files never leave your device.',
      },
      {
        question: 'Can I combine different image formats into a single PDF?',
        answer: 'Yes! You can mix JPG, PNG, and WebP images together into the same document.',
      },
      {
        question: 'Will my images be distorted or compressed?',
        answer: 'By default, DocVeta strictly preserves the aspect ratio of each image. You can also customize fit, orientation, and margin settings.',
      },
    ],
  },
  'jpg-to-pdf': {
    slug: 'jpg-to-pdf',
    title: 'JPG to PDF Converter — Free Online | DocVeta',
    description: 'Convert JPG / JPEG photos into a clean PDF document directly in your browser. Fast, free, mobile-friendly, and no account needed.',
    h1: 'JPG to PDF Converter',
    badge: 'Optimized for Photos & Scans',
    howTo: [
      {
        step: 1,
        title: 'Select your JPG files',
        description: 'Pick JPEG photos from your gallery or drag and drop from your computer.',
      },
      {
        step: 2,
        title: 'Customize page settings',
        description: 'Arrange page sequence, rotate orientations, and choose A4, Letter, or Fit-to-Image dimensions.',
      },
      {
        step: 3,
        title: 'Download your PDF',
        description: 'Click "Create PDF" to build and save your merged document instantly.',
      },
    ],
    faqs: [
      {
        question: 'What is the maximum number of JPGs I can convert?',
        answer: 'DocVeta supports up to 50 photos in a single batch, up to a total batch size of 150MB.',
      },
      {
        question: 'Does this work on mobile phones?',
        answer: 'Yes. DocVeta is mobile-first and allows selecting pictures directly from your mobile photo gallery or camera.',
      },
    ],
  },
  'png-to-pdf': {
    slug: 'png-to-pdf',
    title: 'PNG to PDF Converter — Free Online | DocVeta',
    description: 'Convert PNG images and screenshots to high-resolution PDF pages with transparent background handling. 100% private in-browser tool.',
    h1: 'PNG to PDF Converter',
    badge: 'High-Resolution Vector & Raster',
    howTo: [
      {
        step: 1,
        title: 'Upload PNG images',
        description: 'Choose one or multiple PNG graphics or screenshots.',
      },
      {
        step: 2,
        title: 'Set margins and page sizes',
        description: 'Preview thumbnails, rotate if needed, and select page format.',
      },
      {
        step: 3,
        title: 'Save PDF',
        description: 'Click "Create PDF" and your document downloads immediately.',
      },
    ],
    faqs: [
      {
        question: 'How does DocVeta handle PNG transparency?',
        answer: 'Transparent PNG areas are rendered on a clean white page background by default so they display properly in all standard PDF readers.',
      },
    ],
  },
  'webp-to-pdf': {
    slug: 'webp-to-pdf',
    title: 'WebP to PDF Converter — Free Online | DocVeta',
    description: 'Convert modern WebP images to universal PDF documents for sharing and printing. No email or signup required.',
    h1: 'WebP to PDF Converter',
    badge: 'Modern Web Image Support',
    howTo: [
      {
        step: 1,
        title: 'Select WebP files',
        description: 'Choose WebP images saved from the web or camera.',
      },
      {
        step: 2,
        title: 'Review layout',
        description: 'Organize pages and adjust margins to fit your document needs.',
      },
      {
        step: 3,
        title: 'Create and download',
        description: 'Generate your PDF locally and download it in seconds.',
      },
    ],
    faqs: [
      {
        question: 'Why convert WebP to PDF?',
        answer: 'WebP is great for web browsers, but many desktop apps and print services require standard PDF files for document exchange.',
      },
    ],
  },
  'text-to-pdf': {
    slug: 'text-to-pdf',
    title: 'Text to PDF Converter — Free Online | DocVeta',
    description: 'Type or paste text and generate clean, formatted, printable PDF documents with custom typography and page numbering.',
    h1: 'Text to PDF Converter',
    badge: 'Instant Document Formatter',
    howTo: [
      {
        step: 1,
        title: 'Enter or paste your text',
        description: 'Type directly into the editor or upload a .txt or .md plain text file.',
      },
      {
        step: 2,
        title: 'Choose typography and layout',
        description: 'Select font style (Helvetica, Times, Courier), font size, margins, and page numbering.',
      },
      {
        step: 3,
        title: 'Download PDF',
        description: 'Click "Create PDF" to produce a clean paginated PDF.',
      },
    ],
    faqs: [
      {
        question: 'Does Text to PDF support long documents?',
        answer: 'Yes, DocVeta automatically calculates line wrapping and splits content into numbered pages gracefully.',
      },
      {
        question: 'Is my text stored anywhere?',
        answer: 'No. Text is converted in memory inside your browser and is never saved to any database or server.',
      },
    ],
  },
  'merge-pdf': {
    slug: 'merge-pdf',
    title: 'Merge PDF Online — Free & Private | DocVeta',
    description: 'Combine multiple PDF files into one unified document. Drag to reorder files and combine in your browser with zero file uploads to servers.',
    h1: 'Merge PDF Files Online',
    badge: 'Fast & Secure Multi-PDF Merger',
    howTo: [
      {
        step: 1,
        title: 'Select PDF files',
        description: 'Choose 2 or more PDF documents from your device.',
      },
      {
        step: 2,
        title: 'Arrange file order',
        description: 'Drag or move cards to establish the exact sequence of documents.',
      },
      {
        step: 3,
        title: 'Merge and download',
        description: 'Click "Merge PDF" to combine all pages into one single downloadable PDF.',
      },
    ],
    faqs: [
      {
        question: 'Does merging preserve original page quality and links?',
        answer: 'Yes. DocVeta uses pdf-lib to copy native PDF page trees directly without re-rendering or degrading vector quality.',
      },
      {
        question: 'Can I merge password-protected PDFs?',
        answer: 'Encrypted PDFs must have passwords removed before client-side merging for security reasons.',
      },
    ],
  },
  'pdf-to-image': {
    slug: 'pdf-to-image',
    title: 'PDF to Image Converter — Free Online | DocVeta',
    description: 'Convert PDF pages into high-resolution JPG or PNG pictures. Select specific pages or export all pages as a ZIP archive.',
    h1: 'PDF to Image Converter',
    badge: 'High-DPI Page Renderer',
    howTo: [
      {
        step: 1,
        title: 'Upload your PDF',
        description: 'Select a PDF document from your phone or computer.',
      },
      {
        step: 2,
        title: 'Select format and pages',
        description: 'Choose between JPG or PNG output and pick the pages you want to render.',
      },
      {
        step: 3,
        title: 'Download pages or ZIP',
        description: 'Download individual page images or download all rendered pages at once in a convenient ZIP file.',
      },
    ],
    faqs: [
      {
        question: 'Should I choose JPG or PNG?',
        answer: 'JPG produces smaller file sizes and is best for photographic documents. PNG provides lossless clarity and is best for text and diagrams.',
      },
    ],
  },
  'pdf-to-text': {
    slug: 'pdf-to-text',
    title: 'PDF to Text Converter — Free Online | DocVeta',
    description: 'Extract readable, selectable digital text from PDF files directly in your browser. Copy to clipboard or download as a text file.',
    h1: 'PDF to Text Converter',
    badge: 'Selectable Text Extractor',
    howTo: [
      {
        step: 1,
        title: 'Upload PDF file',
        description: 'Drop your PDF document into the tool.',
      },
      {
        step: 2,
        title: 'Extract text',
        description: 'DocVeta reads digital font streams and extracts text page by page.',
      },
      {
        step: 3,
        title: 'Copy or save text',
        description: 'Inspect the extracted text, copy with one click, or download as a .txt file.',
      },
    ],
    faqs: [
      {
        question: 'What happens if my PDF is a scanned document with no selectable text?',
        answer: 'If no selectable digital text is found, DocVeta will clearly notify you that the document is scanned and recommend using our Image to Text (OCR) tool.',
      },
    ],
  },
  'image-to-text': {
    slug: 'image-to-text',
    title: 'Image to Text (OCR) — Free Online Tool | DocVeta',
    description: 'Extract text from pictures, receipts, scans, and screenshots using browser-based OCR. Free, private, and no signup needed.',
    h1: 'Image to Text (OCR)',
    badge: 'Client-Side Optical Recognition',
    howTo: [
      {
        step: 1,
        title: 'Upload an image or document photo',
        description: 'Select an image containing text from your computer or phone camera.',
      },
      {
        step: 2,
        title: 'Run optical character recognition',
        description: 'Tesseract OCR runs in a background Web Worker so your browser interface remains responsive.',
      },
      {
        step: 3,
        title: 'Review and copy text',
        description: 'Edit, review, copy to clipboard, or download your recognized text.',
      },
    ],
    faqs: [
      {
        question: 'Is OCR recognition 100% accurate?',
        answer: 'No tool can guarantee 100% OCR accuracy. Recognition quality depends heavily on image clarity, resolution, lighting, fonts, and background noise.',
      },
      {
        question: 'Does OCR slow down my device?',
        answer: 'DocVeta runs OCR inside an isolated Web Worker to keep the main UI responsive. Processing takes a few seconds depending on image complexity.',
      },
    ],
  },
};
