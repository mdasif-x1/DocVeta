import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowRight, FileQuestion } from 'lucide-react';
import { POPULAR_TOOLS } from '../../config/tools.config';
import { SEOHead } from '../../components/seo/SEOHead';
import { Button } from '../../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="py-12 sm:py-20 text-center">
      <SEOHead
        title="Page Not Found (404) — DocVeta"
        description="The document tool or page you requested could not be found on DocVeta."
      />

      <div className="docveta-container max-w-2xl mx-auto space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Page Not Found
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto">
            The page or tool you are looking for doesn't exist or may have been moved.
          </p>
        </div>

        <div className="flex justify-center gap-3">
          <Link to="/">
            <Button size="md" leftIcon={<Home className="w-4 h-4" />}>
              Return Home
            </Button>
          </Link>
          <Link to="/tools">
            <Button variant="outline" size="md">
              Browse All Tools
            </Button>
          </Link>
        </div>

        {/* Popular Tools recommendations on 404 */}
        <div className="pt-10 border-t border-slate-200/80 text-left">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 text-center">
            Popular Free Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {POPULAR_TOOLS.slice(0, 3).map(tool => (
              <Link
                key={tool.slug}
                to={`/${tool.slug}`}
                className="p-4 bg-white border border-slate-200 rounded-xl hover:border-brand-400 text-sm font-semibold text-slate-800 flex items-center justify-between group shadow-sm transition"
              >
                <span>{tool.shortName}</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
