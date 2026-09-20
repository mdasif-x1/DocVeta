import React from 'react';

export interface ProgressBarProps {
  percentage: number;
  statusMessage?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  statusMessage,
  className = '',
}) => {
  const clamped = Math.min(100, Math.max(0, Math.round(percentage)));

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium text-slate-700 truncate" aria-live="polite">
          {statusMessage || 'Processing...'}
        </span>
        <span className="text-xs font-semibold text-slate-600 ml-2">
          {clamped}%
        </span>
      </div>
      <div
        className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={statusMessage || 'Progress'}
      >
        <div
          className="bg-brand-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
