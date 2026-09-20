import React from 'react';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { SEOHead } from '../../components/seo/SEOHead';
import { APP_CONFIG } from '../../config/app.config';

export const TermsPage: React.FC = () => {
  return (
    <div className="py-8 sm:py-12">
      <SEOHead
        title={`Terms of Service — ${APP_CONFIG.name}`}
        description={`Terms of Service for using ${APP_CONFIG.name} free online document utilities.`}
        canonicalPath="/terms"
      />

      <div className="docveta-container max-w-3xl mx-auto">
        <Breadcrumbs items={[{ label: 'Terms of Service' }]} />

        <div className="space-y-6 bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-10 shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Terms of Service
          </h1>

          <p className="text-xs text-slate-400">
            Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>

          <p className="text-sm text-slate-600 leading-relaxed">
            By using <strong>{APP_CONFIG.name}</strong>, you agree to these terms. Please read them carefully.
          </p>

          <h2 className="text-lg font-bold text-slate-900 pt-2">
            1. Use of Service
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            DocVeta provides document utility tools directly in your web browser. You agree not to attempt to disrupt or impair the service, reverse-engineer proprietary components beyond open-source licenses, or use the service for unlawful purposes.
          </p>

          <h2 className="text-lg font-bold text-slate-900 pt-2">
            2. Intellectual Property & Ownership
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            You retain 100% ownership and copyright of all documents and files you process using DocVeta. Because processing takes place locally on your device, DocVeta claims zero ownership, license, or rights to any of your content.
          </p>

          <h2 className="text-lg font-bold text-slate-900 pt-2">
            3. Disclaimer of Warranties
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            DocVeta is provided "as is" and "as available", without warranty of any kind, express or implied. While we strive for high precision and stability, we do not guarantee that file conversions, text extractions, or OCR results will be 100% error-free.
          </p>
        </div>
      </div>
    </div>
  );
};
