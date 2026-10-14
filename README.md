# DocVeta

> A private, browser-based document utility for converting, organizing, and extracting documents. All processing runs directly on your device using client-side Web APIs and Web Workers — zero server uploads, zero accounts required.

**Live Application**: [https://doc-veta.vercel.app/](https://doc-veta.vercel.app/)  
**GitHub Repository**: [https://github.com/mdasif-x1/DocVeta](https://github.com/mdasif-x1/DocVeta)

---

## Overview

DocVeta is designed as an intentional, distraction-free document utility. Unlike traditional web converters that require sending personal files to remote cloud servers, DocVeta processes documents entirely inside the browser tab using WebAssembly and Web Worker pipelines.

---

## Key Features

### 1. Document Scanning & Image to PDF
- **Camera Capture**: Live viewfinder with multi-tier hardware constraint fallback (`environment` facingMode, 1080p target resolution, and fallback video constraints).
- **Multi-Photo Collection**: Capture consecutive pages into a session tray before committing to the document.
- **Native Camera Fallback**: Direct fallback to system camera and photo gallery via file input capture.
- **Dedicated Formats**: Direct workflows for JPG, PNG, and WebP to PDF conversion.

### 2. Page Organization & Reordering
- **Drag-and-Drop Arrangement**: Visual grid with smooth drag-and-drop reordering.
- **Accessible Reordering**: Keyboard- and touch-accessible up/down ordering buttons for each page.
- **Page Transformations**: Non-destructive individual page rotation (90° increments) and full document batch rotation.
- **Standardized Previews**: True aspect-ratio document preview cards (`aspect-3/4`) without stretching.

### 3. In-Browser Image Editing & Enhancement
- **Interactive Cropping**: Freeform and preset aspect ratios (Free, A4 Paper, 1:1, 4:3) with interactive corner handles and rule-of-thirds grid.
- **Document Filters**: Canvas-based filters for document cleanup:
  - *Original*: Natural color balance.
  - *Magic Color*: Contrast and saturation enhancement for paper scans.
  - *B&W Document*: High-contrast thresholding for text readability.
  - *Grayscale*: Smooth 8-bit monochrome.
- **Manual Adjustments**: Fine-grained brightness and contrast sliders with live canvas rendering.

### 4. PDF Merging
- **Combine Multiple PDFs**: Merge two or more PDF files into a single document using `pdf-lib`.
- **Merge Order Control**: Reorder uploaded PDFs before merging.
- **Page Count Inspection**: Automatic client-side page count detection.

### 5. PDF to Image Conversion
- **Page Rasterization**: Render every PDF page into high-resolution JPG or PNG images using `pdfjs-dist`.
- **Batch Export**: Download individual page images or package all pages into a `.zip` archive using `jszip`.
- **Quality & DPI Settings**: Configurable render scale and compression quality.

### 6. Text Extraction (PDF to Text)
- **Digital PDF Parsing**: Extract selectable text streams across all pages directly from PDF structure.
- **Copy & Export**: One-click clipboard copy and `.txt` file export.

### 7. Optical Character Recognition (Image to Text / OCR)
- **Client-Side OCR**: Extract text from scans, photos, and receipts using `tesseract.js` in a background Web Worker.
- **Confidence Scoring**: Real-time progress feedback and recognition confidence percentage.
- **Editable Output**: Review and edit recognized text before copying or downloading.

### 8. Text to PDF Conversion
- **Formatted Document Generation**: Convert plain text or markdown notes into clean, paginated PDF documents.
- **Typography & Layout Controls**: Configurable standard fonts (Helvetica, Times Roman, Courier), font size, line spacing, margins (A4 and US Letter), and automatic page numbering.

---

## Technology Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vite.dev/)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/)
- **PDF Engine**: [pdf-lib](https://pdf-lib.js.org/) + [@pdf-lib/fontkit](https://github.com/Hopding/fontkit)
- **PDF Rendering & Text Extraction**: [pdfjs-dist](https://github.com/mozilla/pdf.js)
- **Optical Character Recognition**: [Tesseract.js](https://tesseract.projectnaptha.com/)
- **Archive Generation**: [JSZip](https://stuk.github.io/jszip/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Testing**: [Vitest](https://vitest.dev/) (unit & DOM lifecycle testing)
- **Linting**: [Oxlint](https://oxc.rs/)

---

## Project Structure

```
DocVeta/
├── src/
│   ├── components/         # Shared UI, layout, and modal components
│   │   ├── camera/         # CameraCaptureModal with resilient lifecycle handling
│   │   ├── file-preview/   # FileCard and FilePreviewGrid components
│   │   ├── file-upload/    # FileUpload dropzone and native inputs
│   │   ├── image-editor/   # ImageEditorModal (crop, filters, rotate, brightness)
│   │   ├── layout/         # Header, Footer, and Breadcrumbs
│   │   ├── seo/            # SEOHead, ToolHowTo, ToolFaq, RelatedTools
│   │   └── ui/             # Button, Select, ProgressBar, Alert
│   ├── config/             # App, tools, limits, and SEO configurations
│   ├── features/           # Feature workspaces for each document utility
│   │   ├── image-to-pdf/   # Multi-photo capture, arrangement, and PDF export
│   │   ├── image-to-text/  # In-browser OCR extraction
│   │   ├── merge-pdf/      # PDF file combination and ordering
│   │   ├── pdf-to-image/   # PDF rasterization to JPG/PNG and ZIP packaging
│   │   ├── pdf-to-text/    # Selectable text extraction from PDF
│   │   └── text-to-pdf/    # Plain text pagination and PDF compilation
│   ├── lib/                # Core processing utilities
│   │   ├── image/          # Canvas transformations, filters, and thumbnail helpers
│   │   ├── ocr/            # Tesseract worker setup and OCR runner
│   │   ├── pdf/            # pdf-lib builders and font loaders
│   │   ├── pdfjs/          # PDF.js worker integration for rendering and text
│   │   ├── utilities/      # Formatters, download handlers, sanitization
│   │   └── validation/     # Client-side file type, MIME, and size validators
│   ├── pages/              # Route pages (Home, ToolPage, ToolsIndex, Static)
│   ├── test/               # Vitest test suites (camera, canvas, pdf, ocr, etc.)
│   ├── types/              # TypeScript definitions for files, tools, and options
│   ├── App.tsx             # Route definitions and layout shell
│   ├── index.css           # Global Tailwind directives and base styles
│   └── main.tsx            # React application entry point
├── package.json            # Scripts and dependencies
├── tailwind.config.js      # Palette tokens, typography, and theme extensions
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

---

## Getting Started

### Prerequisites

- **Node.js**: Version 20.x or higher
- **Package Manager**: npm (bundled with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/mdasif-x1/DocVeta.git
   cd DocVeta
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

---

## Available npm Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run dev` | `vite` | Starts local development server with hot module replacement (HMR) |
| `npm run build` | `tsc -b && vite build` | Type-checks with TypeScript and compiles production bundle to `dist/` |
| `npm test` | `vitest run` | Executes all Vitest unit and integration test suites |
| `npm run lint` | `oxlint` | Runs fast code analysis and linting across the repository |
| `npm run preview` | `vite preview` | Locally serves the compiled production build from `dist/` |

---

## Usage

1. **Select a Tool**: Choose a tool from the homepage or directory (e.g., *Image to PDF*, *Merge PDF*, *Image to Text*).
2. **Add Files**: Drag and drop files onto the upload zone, use the system file picker, or click **Camera Scan** to take photos.
3. **Organize & Edit**:
   - Drag thumbnails to adjust the page sequence.
   - Click any photo thumbnail to open the darkroom editor for cropping, rotating, applying filters, or adjusting contrast.
4. **Export**: Click the primary action button (e.g., *Export PDF*, *Merge PDFs*, *Extract Text*) to generate and download the output directly to your device.

---

## Browser Compatibility & Limitations

- **Secure Context**: Live camera streaming (`getUserMedia`) requires a secure context (`https://` or `localhost`). In insecure environments, the application automatically directs users to the native system camera capture fallback.
- **Device Hardware**: Camera switching depends on whether the device exposes multiple video input hardware tracks (front and rear sensors).
- **Processing Memory**: Because processing occurs on the client device, maximum batch size (up to 50 files per batch) is constrained by available device memory (RAM).
- **Scanned vs. Digital PDFs**: The *PDF to Text* utility extracts selectable text from native digital PDFs. For scanned paper documents saved as PDFs, use *PDF to Image* followed by *Image to Text (OCR)*.
- **OCR Accuracy**: Character recognition runs via WebAssembly; accuracy depends on image clarity, resolution, lighting, and font legibility.

---

## License

This project is open-source under the [MIT License](LICENSE).
