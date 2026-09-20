import React from 'react';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { SEOHead } from '../../components/seo/SEOHead';
import { ShieldCheck, Cpu } from 'lucide-react';
import { APP_CONFIG } from '../../config/app.config';

export const AboutPage: React.FC = () => {
  return (
    <div className="py-8 sm:py-12">
      <SEOHead
        title={`About ${APP_CONFIG.name} — Free Browser-First PDF Tools`}
        description={`Learn about ${APP_CONFIG.name}, our browser-first architecture, and why we build free, private document tools for everyone.`}
        canonicalPath="/about"
      />

      <div className="docveta-container max-w-3xl mx-auto">
        <Breadcrumbs items={[{ label: 'About' }]} />

        <div className="space-y-6 bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-10 shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            About {APP_CONFIG.name}
          </h1>

          <p className="text-base text-slate-600 leading-relaxed">
            <strong>{APP_CONFIG.name}</strong> was created with a straightforward mission: to provide fast, dependable, and genuinely free document utilities without the annoyance of paywalls, sign-up forms, email gates, or cloud file storage.
          </p>

          <h2 className="text-xl font-bold text-slate-800 pt-4">
            The Browser-First Philosophy
          </h2>

          <p className="text-sm text-slate-600 leading-relaxed">
            Most online document conversion tools follow an outdated pattern: they require you to upload your personal files to a remote server, wait in a processing queue, and then download the output from cloud storage. This exposes your sensitive documents to potential data breaches, incurs significant server expenses, and introduces artificial waiting times.
          </p>

          <p className="text-sm text-slate-600 leading-relaxed">
            With modern web technologies such as WebAssembly, Web Workers, and HTML5 Canvas, modern devices have more than enough computing power to perform operations like PDF creation, page reordering, image rasterization, and optical character recognition locally.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 font-bold text-slate-800 mb-1 text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Zero Server Uploads</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your files remain strictly inside your browser tab on your computer or phone.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 font-bold text-slate-800 mb-1 text-sm">
                <Cpu className="w-4 h-4 text-brand-600" />
                <span>Zero Wait Queues</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Processing runs on your local CPU. Instant execution without waiting on server queues.
              </p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-800 pt-4">
            Free and Accessible to Everyone
          </h2>

          <p className="text-sm text-slate-600 leading-relaxed">
            Because our architecture offloads heavy computational processing to client-side code, DocVeta operates with minimal server infrastructure costs. This enables us to offer these tools freely to users worldwide without requiring paid subscriptions or accounts.
          </p>
        </div>
      </div>
    </div>
  );
};
