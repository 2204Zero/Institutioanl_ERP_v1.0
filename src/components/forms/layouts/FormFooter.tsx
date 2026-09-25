import React from 'react';
import { Save, RefreshCw, X, CheckCircle2, CloudUpload } from 'lucide-react';
import { SubmitButton } from '../buttons/SubmitButton';
import { ResetButton } from '../buttons/ResetButton';
import { Button } from '../../ui/Button';
import { cn } from '../../../utils/cn';

export interface FormFooterProps {
  submitLabel?: string;
  submitIcon?: React.ReactNode;
  isSubmitting?: boolean;
  onSaveDraft?: () => void;
  isDrafting?: boolean;
  onReset?: () => void;
  onCancel?: () => void;
  autosaveStatus?: 'idle' | 'saving' | 'saved' | 'error';
  lastAutosavedAt?: string | null;
  className?: string;
}

export const FormFooter: React.FC<FormFooterProps> = React.memo(
  ({
    submitLabel = 'Submit Institutional Form',
    submitIcon,
    isSubmitting = false,
    onSaveDraft,
    isDrafting = false,
    onReset,
    onCancel,
    autosaveStatus = 'idle',
    lastAutosavedAt,
    className,
  }) => {
    return (
      <div
        className={cn(
          'p-4 bg-slate-50 border-t border-slate-200/80 rounded-xl flex flex-wrap items-center justify-between gap-3 text-left',
          className
        )}
      >
        {/* Autosave & Draft Indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          {autosaveStatus === 'saving' && (
            <span className="flex items-center gap-1.5 text-brand-600 font-semibold animate-pulse">
              <CloudUpload className="w-3.5 h-3.5" /> Autosaving draft...
            </span>
          )}
          {autosaveStatus === 'saved' && (
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Draft saved {lastAutosavedAt ? `at ${lastAutosavedAt}` : ''}
            </span>
          )}
          {autosaveStatus === 'error' && (
            <span className="flex items-center gap-1.5 text-amber-600 font-semibold">
              Draft save failed
            </span>
          )}
        </div>

        {/* Action Buttons Group */}
        <div className="flex flex-wrap items-center gap-2.5 ml-auto">
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel} icon={<X className="w-4 h-4 text-slate-500" />}>
              Cancel
            </Button>
          )}

          {onReset && <ResetButton onReset={onReset} />}

          {onSaveDraft && (
            <Button
              type="button"
              variant="outline"
              onClick={onSaveDraft}
              loading={isDrafting}
              icon={<Save className="w-4 h-4 text-slate-600" />}
            >
              {isDrafting ? 'Saving Draft...' : 'Save Draft'}
            </Button>
          )}

          <SubmitButton label={submitLabel} icon={submitIcon} isSubmitting={isSubmitting} />
        </div>
      </div>
    );
  }
);

FormFooter.displayName = 'FormFooter';
