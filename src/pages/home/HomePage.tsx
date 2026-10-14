import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Lock, Sparkles, ArrowRight, FileText, Images, Files, ScanText, AlignLeft } from 'lucide-react';
import { POPULAR_TOOLS, TOOLS_BY_CATEGORY, TOOLS } from '../../config/tools.config';
import { SEOHead } from '../../components/seo/SEOHead';
import { ImageToPdfFeature } from '../../features/image-to-pdf/ImageToPdfFeature';
import { APP_CONFIG } from '../../config/app.config';

export const HomePage: React.FC = () => {
  const getToolIcon = (iconName: string) => {
    switch (iconName) {
      case 'Images':
      case 'Image':
        return <Images className="w-6 h-6 text-brand-600" />;
      case 'Files':
        return <Files className="w-6 h-6 text-indigo-600" />;
      case 'ScanText':
        return <ScanText className="w-6 h-6 text-amber-600" />;
      case 'AlignLeft':
        return <AlignLeft className="w-6 h-6 text-cyan-600" />;
      case 'FileText':
      default:
        return <FileText className="w-6 h-6 text-emerald-600" />;
    }
  };

  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: APP_CONFIG.name,
    url: APP_CONFIG.url,
    description: APP_CONFIG.description,
  };

  return (
    <div className="space-y-16 py-8 sm:py-12">
      <SEOHead
        title="DocVeta — Free PDF & Document Tools | 100% In-Browser"
        description="Free online document tools. Convert JPG, PNG to PDF, merge PDFs, extract pages to images, extract text, and OCR documents without signing up or uploading files to remote servers."
        canonicalPath="/"
        jsonLd={homeJsonLd}
      />

      {/* Hero Section */}
      <section className="docveta-container text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/90 text-slate-700 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>100% In-Browser Privacy • Zero Server Uploads • No Signup</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-slate-950 tracking-tight leading-[1.12]">
          Private Document Utilities for Modern Workflows
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Scan papers with your camera, convert photos to high-resolution PDFs, extract text, and merge files locally.
        </p>

        {/* Instant Quick-Action Tool on Homepage (Image to PDF) */}
        <div className="pt-6 text-left">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-7 shadow-sm ring-1 ring-slate-900/5">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900 tracking-tight">
                  Document Scanner & Image to PDF
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Use your device camera or upload image files to assemble, edit, and export a clean PDF.
                </p>
              </div>
              <Link
                to="/image-to-pdf"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
              >
                <span>Full Screen Tool</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <ImageToPdfFeature tool={TOOLS['image-to-pdf']} />
          </div>
        </div>
      </section>

      {/* Popular Tools Grid */}
      <section className="docveta-container">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Popular Tools
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Frequently used browser utilities for daily document tasks.
            </p>
          </div>
          <Link
            to="/tools"
            className="text-xs sm:text-sm font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
          >
            <span>View All Tools</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {POPULAR_TOOLS.map(tool => (
            <Link
              key={tool.slug}
              to={`/${tool.slug}`}
              className="group bg-white border border-slate-200/90 hover:border-brand-400 rounded-2xl p-6 shadow-sm hover:shadow transition flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  {getToolIcon(tool.iconName)}
                </div>
                <h3 className="font-bold text-lg text-slate-900 group-hover:text-brand-600 transition-colors mb-2">
                  {tool.shortName}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-brand-600">
                <span>Start using tool</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How DocVeta Works / Trust Signals */}
      <section className="bg-slate-100/60 py-12 border-y border-slate-200/80">
        <div className="docveta-container max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Why DocVeta is Built Different
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              Most online PDF tools upload your sensitive files to remote servers. DocVeta executes entirely inside your browser tab.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">
                100% Client-Side Privacy
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Your documents, photos, and texts never leave your device. Processing happens right in your browser through modern Web APIs and Web Workers.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">
                Zero Waiting for Uploads
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Skip long cloud upload and download queues. Because calculations happen locally on your processor, files are generated in seconds.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">
                Free Forever, No Signup
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                No credit card, no email collection, no accounts, and no hidden subscriptions. A straightforward public utility for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Directory by Category */}
      <section className="docveta-container">
        <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
          Browse Tools by Category
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Convert */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-brand-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-600" />
              Convert
            </h3>
            <ul className="space-y-3">
              {TOOLS_BY_CATEGORY.convert.map(t => (
                <li key={t.slug}>
                  <Link
                    to={`/${t.slug}`}
                    className="group flex items-start justify-between text-sm hover:text-brand-600 transition"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 group-hover:text-brand-600">
                        {t.shortName}
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-1">
                        {t.description}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-0.5 shrink-0 mt-1 ml-2 transition" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Organize */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-indigo-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              Organize
            </h3>
            <ul className="space-y-3">
              {TOOLS_BY_CATEGORY.organize.map(t => (
                <li key={t.slug}>
                  <Link
                    to={`/${t.slug}`}
                    className="group flex items-start justify-between text-sm hover:text-brand-600 transition"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 group-hover:text-brand-600">
                        {t.shortName}
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-1">
                        {t.description}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-0.5 shrink-0 mt-1 ml-2 transition" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Create */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              Create
            </h3>
            <ul className="space-y-3">
              {TOOLS_BY_CATEGORY.create.map(t => (
                <li key={t.slug}>
                  <Link
                    to={`/${t.slug}`}
                    className="group flex items-start justify-between text-sm hover:text-brand-600 transition"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 group-hover:text-brand-600">
                        {t.shortName}
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-1">
                        {t.description}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-0.5 shrink-0 mt-1 ml-2 transition" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Platform FAQ */}
      <section className="docveta-container max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
          Frequently Asked Questions
        </h2>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 divide-y divide-slate-100 shadow-sm">
          <div className="py-3.5">
            <h3 className="font-semibold text-slate-800 text-sm mb-1">
              Is DocVeta really free to use?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Yes, 100%. DocVeta runs processing client-side in your own browser, requiring virtually ₹0 server compute infrastructure, which allows us to keep the platform free for everyone.
            </p>
          </div>

          <div className="py-3.5">
            <h3 className="font-semibold text-slate-800 text-sm mb-1">
              Are my uploaded documents safe and private?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Your files stay on your device. File parsing, image rasterization, PDF merging, and OCR are executed locally using browser JavaScript and Web Workers. We do not store or transmit your documents.
            </p>
          </div>

          <div className="py-3.5">
            <h3 className="font-semibold text-slate-800 text-sm mb-1">
              Do I need to install any software or extensions?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              No software, plugins, or browser extensions are required. DocVeta works directly in any modern mobile or desktop web browser.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
