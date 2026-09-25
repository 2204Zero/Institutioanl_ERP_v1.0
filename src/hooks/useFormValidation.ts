import { useForm, UseFormProps, UseFormReturn, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFocusFirstError } from './useFocusFirstError';

export interface UseFormValidationProps<TSchema extends z.ZodType<any, any, any>>
  extends Omit<UseFormProps<z.infer<TSchema>>, 'resolver'> {
  schema: TSchema;
  autoFocusError?: boolean;
}

export function useFormValidation<TSchema extends z.ZodType<any, any, any>>(
  props: UseFormValidationProps<TSchema>
): UseFormReturn<z.infer<TSchema>> {
  const { schema, autoFocusError = true, defaultValues, mode = 'onTouched', ...formProps } = props;

  const form = useForm<z.infer<TSchema>>({
    ...formProps,
    resolver: zodResolver(schema),
    defaultValues,
    mode,
  });

  if (autoFocusError) {
    useFocusFirstError(form.formState.errors, form.formState.isSubmitting);
  }

  return form;
}
