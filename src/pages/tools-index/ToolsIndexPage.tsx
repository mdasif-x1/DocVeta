import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, FileText, Images, Files, ScanText, AlignLeft } from 'lucide-react';
import { TOOLS_LIST } from '../../config/tools.config';
import { SEOHead } from '../../components/seo/SEOHead';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';

export const ToolsIndexPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTools = TOOLS_LIST.filter(tool => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || tool.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

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

  return (
    <div className="py-8 sm:py-12">
      <SEOHead
        title="All PDF & Document Tools Directory — DocVeta"
        description="Browse all free online PDF and document tools on DocVeta. Convert, merge, extract pages, and OCR images 100% in your browser."
        canonicalPath="/tools"
      />

      <div className="docveta-container">
        <Breadcrumbs items={[{ label: 'All Tools' }]} />

        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            All PDF & Document Tools
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Free, browser-based utilities to help you convert, organize, and extract files easily.
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="max-w-xl mx-auto mb-10 space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tools (e.g. JPG to PDF, Merge, OCR)..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            />
          </div>

          <div className="flex justify-center gap-2">
            {[
              { id: 'all', label: 'All Tools' },
              { id: 'convert', label: 'Convert' },
              { id: 'organize', label: 'Organize' },
              { id: 'create', label: 'Create' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedCategory === tab.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map(tool => (
            <Link
              key={tool.slug}
              to={`/${tool.slug}`}
              className="group bg-white border border-slate-200/90 hover:border-brand-400 rounded-2xl p-6 shadow-sm hover:shadow transition flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  {getToolIcon(tool.iconName)}
                </div>
                <h2 className="font-bold text-lg text-slate-900 group-hover:text-brand-600 transition-colors mb-2">
                  {tool.shortName}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-brand-600">
                <span>Open tool</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No tools found matching "{searchQuery}".
          </div>
        )}
      </div>
    </div>
  );
};
