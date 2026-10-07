/**
 * Enterprise Form System Type Definitions
 * Scalable for 100+ ERP Forms with WCAG 2.2 AA Accessibility & Dynamic Rules
 */

import React from 'react';
import { FieldError, FieldValues, Path, UseFormReturn } from 'react-hook-form';

export type FormMode = 'create' | 'update' | 'readonly' | 'review' | 'disabled' | 'print';

export type FieldType =
  | 'text'
  | 'email'
  | 'number'
  | 'password'
  | 'phone'
  | 'date'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'switch'
  | 'radio'
  | 'file'
  | 'image'
  | 'cascading';

export interface SelectOption<V = string | number> {
  label: string;
  value: V;
  disabled?: boolean;
  group?: string;
  badge?: string;
  description?: string;
}

export interface DependentRule<TFieldValues extends FieldValues = FieldValues> {
  field: Path<TFieldValues>;
  condition: (value: any, formValues: TFieldValues) => boolean;
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require' | 'optional';
  dynamicLabel?: string;
  dynamicPlaceholder?: string;
  dynamicHelperText?: string;
}

export interface CascadingOptionNode {
  id: string;
  name: string;
  code?: string;
  parentId?: string;
  children?: CascadingOptionNode[];
}

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  progress?: number;
  status?: 'uploading' | 'completed' | 'error';
  errorMessage?: string;
}

export interface FormMetaState {
  isAutosaving?: boolean;
  lastAutosavedAt?: string | null;
  draftId?: string | null;
  mode?: FormMode;
}

export interface BaseFieldProps<TFieldValues extends FieldValues = FieldValues> {
  name: Path<TFieldValues>;
  label?: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export interface FormContextValue<TFieldValues extends FieldValues = FieldValues> {
  form: UseFormReturn<TFieldValues>;
  mode: FormMode;
  isSubmitting: boolean;
  autosaveStatus?: 'idle' | 'saving' | 'saved' | 'error';
  lastAutosavedAt?: string | null;
  registerDraftSave?: (data: TFieldValues) => void;
}
