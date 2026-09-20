import React, { useState } from 'react';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { SEOHead } from '../../components/seo/SEOHead';
import { Button } from '../../components/ui/Button';
import { Mail, Send, CheckCircle2 } from 'lucide-react';
import { APP_CONFIG } from '../../config/app.config';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="py-8 sm:py-12">
      <SEOHead
        title={`Contact & Feedback — ${APP_CONFIG.name}`}
        description={`Send questions, report issues, or suggest new document utilities for ${APP_CONFIG.name}.`}
        canonicalPath="/contact"
      />

      <div className="docveta-container max-w-2xl mx-auto">
        <Breadcrumbs items={[{ label: 'Contact' }]} />

        <div className="space-y-6 bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Contact & Feedback
              </h1>
              <p className="text-xs text-slate-500">
                We'd love to hear your tool suggestions, bug reports, and feedback.
              </p>
            </div>
          </div>

          {submitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-slate-900">Thank you for your feedback!</h3>
              <p className="text-xs text-slate-600">
                Your message has been received. We appreciate you helping us improve DocVeta.
              </p>
              <Button variant="outline" size="sm" onClick={() => { setSubmitted(false); setMessage(''); }} className="mt-2">
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="message" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Feedback or Tool Suggestion
                </label>
                <textarea
                  id="message"
                  rows={5}
                  required
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Share a tool you'd like to see, report a bug, or give general feedback..."
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400">
                  Direct email: <a href={`mailto:${APP_CONFIG.supportEmail}`} className="text-brand-600 underline">{APP_CONFIG.supportEmail}</a>
                </span>
                <Button type="submit" size="md" leftIcon={<Send className="w-4 h-4" />}>
                  Submit Feedback
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
