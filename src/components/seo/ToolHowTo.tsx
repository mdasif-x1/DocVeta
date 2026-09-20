import React from 'react';

export interface HowToStep {
  step: number;
  title: string;
  description: string;
}

export interface ToolHowToProps {
  toolName: string;
  steps: HowToStep[];
}

export const ToolHowTo: React.FC<ToolHowToProps> = ({ toolName, steps }) => {
  return (
    <section className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 mt-12">
      <h2 className="text-xl font-bold text-slate-900 mb-6">
        How to use {toolName}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map(s => (
          <div key={s.step} className="flex flex-col">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200">
                {s.step}
              </span>
              <h3 className="font-semibold text-slate-800 text-base">
                {s.title}
              </h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed pl-10">
              {s.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
