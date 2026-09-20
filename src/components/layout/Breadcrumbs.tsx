import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumbs" className="py-3">
      <ol className="flex items-center space-x-2 text-xs text-slate-500">
        <li>
          <Link
            to="/"
            className="flex items-center hover:text-slate-900 transition-colors"
            aria-label="Home"
          >
            <Home className="w-3.5 h-3.5" />
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={index}>
              <li>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </li>
              <li>
                {item.href && !isLast ? (
                  <Link
                    to={item.href}
                    className="hover:text-slate-900 transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="font-medium text-slate-800" aria-current={isLast ? 'page' : undefined}>
                    {item.label}
                  </span>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};
