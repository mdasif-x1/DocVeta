import React from 'react';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { SEOHead } from '../../components/seo/SEOHead';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { APP_CONFIG } from '../../config/app.config';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="py-8 sm:py-12">
      <SEOHead
        title={`Privacy Policy — ${APP_CONFIG.name}`}
        description={`Learn how ${APP_CONFIG.name} protects your privacy with 100% client-side browser file processing.`}
        canonicalPath="/privacy"
      />

      <div className="docveta-container max-w-3xl mx-auto">
        <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />

        <div className="space-y-6 bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-10 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 w-fit">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Files Processed Locally in Browser</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Privacy Policy
          </h1>

          <p className="text-xs text-slate-400">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            At <strong>{APP_CONFIG.name}</strong>, we believe the best way to safeguard user documents is simple: <em>never touch them in the first place</em>. This policy describes our exact architecture and how your data is handled.
          </p>

          <h2 className="text-lg font-bold text-slate-900 pt-3">
            1. Client-Side File Processing
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            All document and image operations on DocVeta (including Image to PDF, Merge PDF, PDF to Images, PDF to Text, and Image OCR) execute entirely inside your local browser tab on your computer or mobile device.
          </p>
          <ul className="space-y-2 text-sm text-slate-600 pl-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>We do not transmit your files over the network to any external backend server.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>We do not save, store, or copy your files in any remote cloud database.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Temporary file memory (Blob URLs, canvas buffers) is cleaned up upon completion or tab closure.</span>
            </li>
          </ul>

          <h2 className="text-lg font-bold text-slate-900 pt-3">
            2. Personal Information & Accounts
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            DocVeta does not require an account, email address, password, credit card, or personal identification to use any tool. We do not maintain user profile databases.
          </p>

          <h2 className="text-lg font-bold text-slate-900 pt-3">
            3. Analytics and Document Content
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            We strictly do not inspect, log, or track the contents of your documents, extracted texts, or image files. Standard static asset hosting providers may record basic HTTP request logs (e.g. IP address, user-agent) for basic traffic diagnostics and DDoS defense.
          </p>

          <h2 className="text-lg font-bold text-slate-900 pt-3">
            4. Questions & Feedback
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            If you have questions regarding our privacy architecture, feel free to visit our <a href="/contact" className="text-brand-600 font-medium underline">contact page</a>.
          </p>
        </div>
      </div>
    </div>
  );
};
