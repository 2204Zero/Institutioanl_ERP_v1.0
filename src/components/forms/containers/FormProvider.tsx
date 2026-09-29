import React from 'react';
import { FormProvider as RHFFormProvider, FieldValues, UseFormReturn } from 'react-hook-form';
import { FormMode } from '../../../types/formTypes';

export interface FormProviderProps<TFieldValues extends FieldValues = FieldValues> {
  form: UseFormReturn<TFieldValues>;
  children: React.ReactNode;
  mode?: FormMode;
  autosaveStatus?: 'idle' | 'saving' | 'saved' | 'error';
  lastAutosavedAt?: string | null;
}

export function FormProvider<TFieldValues extends FieldValues = FieldValues>({
  form,
  children,
}: FormProviderProps<TFieldValues>) {
  return <RHFFormProvider {...form}>{children}</RHFFormProvider>;
}
