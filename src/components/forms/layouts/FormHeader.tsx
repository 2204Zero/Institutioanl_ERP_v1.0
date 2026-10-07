import React from 'react';
import { cn } from '../../../utils/cn';

export interface FormHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  icon?: React.ReactNode;
  stepProgress?: {
    current: number;
    total: number;
  };
  className?: string;
}

export const FormHeader: React.FC<FormHeaderProps> = React.memo(
  ({ title, description, badge, icon, stepProgress, className }) => {
    return (
      <div className={cn('p-5 bg-slate-900 text-white rounded-xl border border-slate-800 shadow-md text-left', className)}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {icon && (
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                {icon}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white">{title}</h2>
                {badge && (
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-brand-500/30 text-brand-300 border border-brand-400/30 uppercase tracking-wider">
                    {badge}
                  </span>
                )}
              </div>
              {description && <p className="text-xs text-slate-300 mt-0.5 font-medium">{description}</p>}
            </div>
          </div>

          {stepProgress && (
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
              <span className="text-slate-400 font-medium">Step</span>
              <span className="font-bold text-brand-400 font-mono">
                {stepProgress.current} / {stepProgress.total}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

FormHeader.displayName = 'FormHeader';
