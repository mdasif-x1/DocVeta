import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Images, Files, ScanText, AlignLeft } from 'lucide-react';
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
    <div className="space-y-12 py-6 sm:py-10">
      <SEOHead
        title="DocVeta — Private PDF & Document Utilities"
        description="Fast, private document utilities in your browser. Convert photos to PDF, merge documents, extract text, and OCR without cloud uploads."
        canonicalPath="/"
        jsonLd={homeJsonLd}
      />

      {/* Hero Workspace: Title + Instant Document Scanner & Converter */}
      <section className="docveta-container max-w-4xl mx-auto space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-950 tracking-tight">
            Document Utilities
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Process files directly on your device. Zero cloud uploads.
          </p>
        </div>

        {/* Primary Interactive Workspace */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
                Scan & Convert to PDF
              </h2>
            </div>
            <Link
              to="/image-to-pdf"
              className="text-xs font-medium text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
            >
              <span>Full Screen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <ImageToPdfFeature tool={TOOLS['image-to-pdf']} />
        </div>
      </section>

      {/* Document Tools Directory */}
      <section className="docveta-container max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            All Tools
          </h2>
          <Link
            to="/tools"
            className="text-xs font-medium text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
          >
            <span>Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {POPULAR_TOOLS.map(tool => (
            <Link
              key={tool.slug}
              to={`/${tool.slug}`}
              className="group bg-white border border-slate-200/80 hover:border-slate-300 rounded-xl p-4 shadow-2xs hover:shadow-xs transition flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  {getToolIcon(tool.iconName)}
                </div>
                <h3 className="font-semibold text-sm text-slate-900 group-hover:text-brand-600 transition-colors mb-1">
                  {tool.shortName}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-100/80 flex items-center justify-between text-[11px] font-medium text-slate-500 group-hover:text-brand-600">
                <span>Open tool</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Directory by Category */}
      <section className="docveta-container max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Convert */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Convert
            </h3>
            <ul className="space-y-2">
              {TOOLS_BY_CATEGORY.convert.map(t => (
                <li key={t.slug}>
                  <Link
                    to={`/${t.slug}`}
                    className="group flex items-start justify-between text-xs hover:text-brand-600 transition py-0.5"
                  >
                    <div>
                      <div className="font-medium text-slate-800 group-hover:text-brand-600">
                        {t.shortName}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        {t.description}
                      </div>
                    </div>
                    <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-brand-600 shrink-0 mt-1 ml-2 transition" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Organize */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Organize
            </h3>
            <ul className="space-y-2">
              {TOOLS_BY_CATEGORY.organize.map(t => (
                <li key={t.slug}>
                  <Link
                    to={`/${t.slug}`}
                    className="group flex items-start justify-between text-xs hover:text-brand-600 transition py-0.5"
                  >
                    <div>
                      <div className="font-medium text-slate-800 group-hover:text-brand-600">
                        {t.shortName}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        {t.description}
                      </div>
                    </div>
                    <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-brand-600 shrink-0 mt-1 ml-2 transition" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Create */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Create & Extract
            </h3>
            <ul className="space-y-2">
              {TOOLS_BY_CATEGORY.create.map(t => (
                <li key={t.slug}>
                  <Link
                    to={`/${t.slug}`}
                    className="group flex items-start justify-between text-xs hover:text-brand-600 transition py-0.5"
                  >
                    <div>
                      <div className="font-medium text-slate-800 group-hover:text-brand-600">
                        {t.shortName}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        {t.description}
                      </div>
                    </div>
                    <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-brand-600 shrink-0 mt-1 ml-2 transition" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="docveta-container max-w-3xl mx-auto">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3 text-center">
          Common Questions
        </h2>

        <div className="bg-white border border-slate-200/80 rounded-xl p-5 divide-y divide-slate-100 shadow-2xs">
          <div className="pb-3">
            <h3 className="font-medium text-slate-800 text-xs mb-1">
              Do my files get uploaded to a server?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No. Document processing, PDF compilation, image rasterization, and OCR occur inside your browser via WebAssembly and Web Workers.
            </p>
          </div>

          <div className="py-3">
            <h3 className="font-medium text-slate-800 text-xs mb-1">
              Is there a file or page limit?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Up to 50 photos or pages can be processed in a single batch, depending on your device memory.
            </p>
          </div>

          <div className="pt-3">
            <h3 className="font-medium text-slate-800 text-xs mb-1">
              Is any software installation required?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No. DocVeta functions directly within modern mobile, tablet, and desktop web browsers without extensions or plugins.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
