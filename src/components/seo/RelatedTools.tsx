import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getToolBySlug } from '../../config/tools.config';

export interface RelatedToolsProps {
  relatedSlugs: string[];
}

export const RelatedTools: React.FC<RelatedToolsProps> = ({ relatedSlugs }) => {
  const tools = relatedSlugs
    .map(slug => getToolBySlug(slug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  if (tools.length === 0) return null;

  return (
    <section className="mt-12 mb-8">
      <h2 className="text-xl font-bold text-slate-900 mb-6">
        Related Document Tools
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map(tool => (
          <Link
            key={tool.slug}
            to={`/${tool.slug}`}
            className="group card-base p-5 flex flex-col justify-between hover:border-brand-400"
          >
            <div>
              <h3 className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors mb-1.5 flex items-center justify-between">
                <span>{tool.shortName}</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition" />
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {tool.description}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-[11px] font-semibold text-brand-600">
              Open Tool
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
