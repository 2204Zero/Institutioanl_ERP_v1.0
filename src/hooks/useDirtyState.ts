import { useEffect, useCallback } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';

export interface UseDirtyStateOptions<TFieldValues extends FieldValues = FieldValues> {
  form: UseFormReturn<TFieldValues>;
  warnOnLeave?: boolean;
  warningMessage?: string;
  onAutosave?: (values: TFieldValues) => void;
  autosaveIntervalMs?: number;
}

export function useDirtyState<TFieldValues extends FieldValues = FieldValues>({
  form,
  warnOnLeave = true,
  warningMessage = 'You have unsaved form changes. Are you sure you want to leave?',
  onAutosave,
  autosaveIntervalMs,
}: UseDirtyStateOptions<TFieldValues>): {
  isDirty: boolean;
  dirtyFields: Record<string, boolean>;
  touchedFields: Record<string, boolean>;
  resetDirtyState: () => void;
} {
  const { isDirty, dirtyFields, touchedFields } = form.formState;

  // Browser beforeunload event listener
  useEffect(() => {
    if (!warnOnLeave || !isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = warningMessage;
      return warningMessage;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [warnOnLeave, isDirty, warningMessage]);

  // Optional periodic autosave
  useEffect(() => {
    if (!onAutosave || !autosaveIntervalMs || !isDirty) return;

    const interval = setInterval(() => {
      onAutosave(form.getValues());
    }, autosaveIntervalMs);

    return () => clearInterval(interval);
  }, [onAutosave, autosaveIntervalMs, isDirty, form]);

  const resetDirtyState = useCallback(() => {
    form.reset(form.getValues());
  }, [form]);

  return {
    isDirty,
    dirtyFields: dirtyFields as Record<string, boolean>,
    touchedFields: touchedFields as Record<string, boolean>,
    resetDirtyState,
  };
}
