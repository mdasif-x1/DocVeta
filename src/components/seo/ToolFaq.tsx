import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ToolFaqProps {
  toolName: string;
  faqs: FaqItem[];
}

export const ToolFaq: React.FC<ToolFaqProps> = ({ toolName, faqs }) => {
  const [openIndexes, setOpenIndexes] = useState<number[]>([0]);

  const toggleFaq = (index: number) => {
    setOpenIndexes(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  return (
    <section className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 mt-8">
      <h2 className="text-xl font-bold text-slate-900 mb-6">
        Frequently Asked Questions about {toolName}
      </h2>

      <div className="divide-y divide-slate-100">
        {faqs.map((faq, index) => {
          const isOpen = openIndexes.includes(index);
          return (
            <div key={index} className="py-4">
              <button
                type="button"
                onClick={() => toggleFaq(index)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between text-left gap-4 font-semibold text-slate-800 hover:text-brand-600 transition-colors"
              >
                <span className="text-base">{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-brand-600' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="mt-3 text-sm text-slate-600 leading-relaxed pr-6">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
