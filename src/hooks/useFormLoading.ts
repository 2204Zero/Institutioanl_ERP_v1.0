import { useState, useCallback } from 'react';

export type FormActionType = 'idle' | 'submitting' | 'savingDraft' | 'resetting' | 'validatingAsync' | 'fetching';

export interface UseFormLoadingResult {
  currentAction: FormActionType;
  isLoading: boolean;
  isSubmitting: boolean;
  isDrafting: boolean;
  isValidatingAsync: boolean;
  setAction: (action: FormActionType) => void;
  startAction: (action: FormActionType) => void;
  finishAction: () => void;
}

export function useFormLoading(initialAction: FormActionType = 'idle'): UseFormLoadingResult {
  const [currentAction, setCurrentAction] = useState<FormActionType>(initialAction);

  const startAction = useCallback((action: FormActionType) => {
    setCurrentAction(action);
  }, []);

  const finishAction = useCallback(() => {
    setCurrentAction('idle');
  }, []);

  return {
    currentAction,
    isLoading: currentAction !== 'idle',
    isSubmitting: currentAction === 'submitting',
    isDrafting: currentAction === 'savingDraft',
    isValidatingAsync: currentAction === 'validatingAsync',
    setAction: setCurrentAction,
    startAction,
    finishAction,
  };
}
