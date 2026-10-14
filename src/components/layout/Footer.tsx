import React from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { APP_CONFIG } from '../../config/app.config';
import { TOOLS_BY_CATEGORY } from '../../config/tools.config';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800 mt-auto">
      <div className="docveta-container py-10 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-3">
            <Link to="/" className="flex items-center gap-2 text-white">
              <div className="w-6 h-6 rounded bg-brand-600 flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold text-base tracking-tight text-white">
                {APP_CONFIG.name}
              </span>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Private, zero-install document tools. PDF conversions, page reordering, text extraction, and OCR run directly on your device.
            </p>
          </div>

          {/* Convert Tools */}
          <div>
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Convert
            </h3>
            <ul className="space-y-2">
              {TOOLS_BY_CATEGORY.convert.map(tool => (
                <li key={tool.slug}>
                  <Link
                    to={`/${tool.slug}`}
                    className="hover:text-white transition-colors"
                  >
                    {tool.shortName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Organize & Create */}
          <div>
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Organize & Create
            </h3>
            <ul className="space-y-2">
              {TOOLS_BY_CATEGORY.organize.map(tool => (
                <li key={tool.slug}>
                  <Link
                    to={`/${tool.slug}`}
                    className="hover:text-white transition-colors"
                  >
                    {tool.shortName}
                  </Link>
                </li>
              ))}
              {TOOLS_BY_CATEGORY.create.map(tool => (
                <li key={tool.slug}>
                  <Link
                    to={`/${tool.slug}`}
                    className="hover:text-white transition-colors"
                  >
                    {tool.shortName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform & Legal */}
          <div>
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Platform & Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/tools" className="hover:text-white transition-colors">
                  All Tools Directory
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About DocVeta
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact & Feedback
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-12 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {APP_CONFIG.name}. Built with browser standards.</p>
          <div className="flex items-center gap-1">
            <span>Free and public utility platform for everyone.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
