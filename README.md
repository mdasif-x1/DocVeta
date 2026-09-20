# DocVeta — Free PDF & Document Tools

A production-quality, browser-first utility platform for working with PDFs, images, and documents — with **zero backend, zero account required, zero cost to host**.

## Features (V1 — 9 Tools)

| Tool | Description |
|------|-------------|
| **Image → PDF** | Convert JPG, PNG, or WebP images to a single PDF |
| **JPG → PDF** | Dedicated JPG to PDF converter |
| **PNG → PDF** | Dedicated PNG to PDF converter |
| **WebP → PDF** | Dedicated WebP to PDF converter |
| **Merge PDF** | Combine multiple PDFs into one, with reordering |
| **PDF → Image** | Render every PDF page as PNG or JPEG |
| **PDF → Text** | Extract selectable text from PDFs |
| **Image → Text (OCR)** | Extract text from image scans using Tesseract.js |
| **Text → PDF** | Convert plain text to a formatted PDF |

All processing happens **entirely in your browser**. Files never leave your device.

## Tech Stack

- **Vite 8** + **React 19** + **TypeScript 5** (strict, verbatimModuleSyntax)
- **Tailwind CSS 3** — brand colour palette + Inter font
- **pdf-lib** — PDF creation and merging
- **pdfjs-dist v6** — PDF rendering, text extraction
- **Tesseract.js v7** — In-browser OCR
- **jszip** — ZIP packaging for multi-page exports
- **lucide-react** — Icon set
- **Vitest** — Unit testing
- **react-router-dom v7** — Client-side routing

## Getting Started

```bash
npm install       # Install dependencies
npm run dev       # Start dev server (http://localhost:5173)
npm test          # Run all tests (16 tests, 4 suites)
npm run build     # Production build to dist/
npm run preview   # Preview production build locally
```

Requires **Node.js 20+**.

## Project Structure

```
src/
├── config/          # tools.config.ts, seo.config.ts, limits.config.ts, app.config.ts
├── types/           # file.types.ts, processing.types.ts, tool.types.ts
├── lib/             # Processing engines (pdf-lib, pdfjs, tesseract, canvas)
├── components/      # Reusable UI + SEO components
├── features/        # Self-contained tool feature components
├── pages/           # Route-level pages
└── test/            # Vitest unit tests
```

## Deployment

Build output is in dist/. Deploy to any static host:

- **Vercel**: ercel --prod
- **Netlify**: 
etlify deploy --prod --dir=dist
- **Cloudflare Pages**: build command 
pm run build, output dist

All hosts need a rewrite rule: /* → /index.html (SPA routing).

## Privacy

All file processing is done in the browser via Web APIs. Files are not uploaded to any server.

## License

MIT © DocVeta
