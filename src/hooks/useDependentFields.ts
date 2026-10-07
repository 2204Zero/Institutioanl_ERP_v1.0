import { useMemo } from 'react';
import { FieldValues, UseFormWatch, Path } from 'react-hook-form';
import { DependentRule } from '../types/formTypes';

export interface UseDependentFieldsProps<TFieldValues extends FieldValues = FieldValues> {
  watch: UseFormWatch<TFieldValues>;
  rules: DependentRule<TFieldValues>[];
}

export interface FieldStateOverride {
  isVisible: boolean;
  isDisabled: boolean;
  isRequired: boolean;
  label?: string;
  placeholder?: string;
  helperText?: string;
}

export function useDependentFields<TFieldValues extends FieldValues = FieldValues>({
  watch,
  rules,
}: UseDependentFieldsProps<TFieldValues>): Record<Path<TFieldValues>, FieldStateOverride> {
  const formValues = watch();

  return useMemo(() => {
    const overrides: Record<string, FieldStateOverride> = {};

    rules.forEach((rule) => {
      const fieldName = String(rule.field);
      const targetValue = formValues[rule.field];
      const isConditionMet = rule.condition(targetValue, formValues);

      if (!overrides[fieldName]) {
        overrides[fieldName] = {
          isVisible: true,
          isDisabled: false,
          isRequired: false,
        };
      }

      const current = overrides[fieldName];

      switch (rule.action) {
        case 'show':
          current.isVisible = isConditionMet;
          break;
        case 'hide':
          current.isVisible = !isConditionMet;
          break;
        case 'enable':
          current.isDisabled = !isConditionMet;
          break;
        case 'disable':
          current.isDisabled = isConditionMet;
          break;
        case 'require':
          current.isRequired = isConditionMet;
          break;
        case 'optional':
          current.isRequired = !isConditionMet;
          break;
      }

      if (isConditionMet) {
        if (rule.dynamicLabel) current.label = rule.dynamicLabel;
        if (rule.dynamicPlaceholder) current.placeholder = rule.dynamicPlaceholder;
        if (rule.dynamicHelperText) current.helperText = rule.dynamicHelperText;
      }
    });

    return overrides as Record<Path<TFieldValues>, FieldStateOverride>;
  }, [formValues, rules]);
}
