import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '../../../utils/cn';

export interface FormSectionProps {
  title: string;
  description?: string;
  badge?: string;
  icon?: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = React.memo(
  ({
    title,
    description,
    badge,
    icon,
    collapsible = false,
    defaultExpanded = true,
    children,
    className,
  }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
      <div
        className={cn(
          'bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden transition-all text-left',
          className
        )}
      >
        <div
          onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
          className={cn(
            'p-4 bg-slate-50/70 border-b border-slate-200/80 flex items-center justify-between',
            collapsible && 'cursor-pointer hover:bg-slate-100/70 select-none'
          )}
        >
          <div className="flex items-center gap-3">
            {icon && <div className="p-2 rounded-lg bg-brand-50 text-brand-600 shrink-0">{icon}</div>}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">{title}</h3>
                {badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">
                    {badge}
                  </span>
                )}
              </div>
              {description && <p className="text-xs text-slate-500 mt-0.5 font-medium">{description}</p>}
            </div>
          </div>

          {collapsible && (
            <button
              type="button"
              className="p-1 rounded text-slate-400 hover:text-slate-600 focus:outline-none"
              aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
        </div>

        {(!collapsible || isExpanded) && <div className="p-5">{children}</div>}
      </div>
    );
  }
);

FormSection.displayName = 'FormSection';
