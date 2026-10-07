import { useState, useCallback } from 'react';
import { LoadingState } from '../types/apiTypes';

export interface UseLoadingResult {
  loadingStates: Record<string, LoadingState>;
  startLoading: (key: string, state?: LoadingState) => void;
  stopLoading: (key: string) => void;
  isLoading: (key?: string) => boolean;
  isState: (key: string, state: LoadingState) => boolean;
  isSubmitting: boolean;
  isDeleting: boolean;
  isUpdating: boolean;
  isRefreshing: boolean;
  isSearching: boolean;
  isFiltering: boolean;
  isPaginationLoading: boolean;
  resetLoading: () => void;
}

export function useLoading(initialState: Record<string, LoadingState> = {}): UseLoadingResult {
  const [loadingStates, setLoadingStates] = useState<Record<string, LoadingState>>(initialState);

  const startLoading = useCallback((key: string, state: LoadingState = 'loading') => {
    setLoadingStates((prev) => ({ ...prev, [key]: state }));
  }, []);

  const stopLoading = useCallback((key: string) => {
    setLoadingStates((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const isLoading = useCallback(
    (key?: string) => {
      if (key) {
        const state = loadingStates[key];
        return !!state && state !== 'idle' && state !== 'success' && state !== 'error';
      }
      return Object.values(loadingStates).some(
        (s) => s !== 'idle' && s !== 'success' && s !== 'error'
      );
    },
    [loadingStates]
  );

  const isState = useCallback(
    (key: string, state: LoadingState) => {
      return loadingStates[key] === state;
    },
    [loadingStates]
  );

  const resetLoading = useCallback(() => {
    setLoadingStates({});
  }, []);

  const isSubmitting = Object.values(loadingStates).includes('submitting');
  const isDeleting = Object.values(loadingStates).includes('deleting');
  const isUpdating = Object.values(loadingStates).includes('updating');
  const isRefreshing = Object.values(loadingStates).includes('refreshing');
  const isSearching = Object.values(loadingStates).includes('searching');
  const isFiltering = Object.values(loadingStates).includes('filtering');
  const isPaginationLoading = Object.values(loadingStates).includes('paginationLoading');

  return {
    loadingStates,
    startLoading,
    stopLoading,
    isLoading,
    isState,
    isSubmitting,
    isDeleting,
    isUpdating,
    isRefreshing,
    isSearching,
    isFiltering,
    isPaginationLoading,
    resetLoading,
  };
}
