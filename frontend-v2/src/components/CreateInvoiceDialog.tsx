import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Loader2, PlusCircle, ReceiptText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useFeeStructures, useAssignFeeStructure, formatCurrency, parseAmount } from '../hooks/queries/useFinance';

const assignFeeSchema = z.object({
  studentId: z.string().min(1, 'Valid Student ID is required'),
  feeStructureId: z.string().min(1, 'Please select a Fee Structure'),
  academicYearId: z.string().min(1, 'Valid Academic Year ID is required'),
});

type FormValues = z.infer<typeof assignFeeSchema>;

interface CreateInvoiceDialogProps {
  initialStudentId?: number;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function CreateInvoiceDialog({ initialStudentId, trigger, onSuccess }: CreateInvoiceDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: feeStructures = [], isLoading: isLoadingStructures } = useFeeStructures({ enabled: open });
  const assignFeeMutation = useAssignFeeStructure();

  const form = useForm<FormValues, any, FormValues>({
    resolver: zodResolver(assignFeeSchema),
    defaultValues: {
      studentId: initialStudentId ? String(initialStudentId) : '',
      feeStructureId: '',
      academicYearId: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        studentId: initialStudentId ? String(initialStudentId) : '',
        feeStructureId: '',
        academicYearId: '',
      });
    }
  }, [open, initialStudentId, form]);

  const selectedFeeStructureId = form.watch('feeStructureId');
  const selectedStructure = feeStructures.find(s => String(s.id) === String(selectedFeeStructureId));

  const totalGrossPreview = selectedStructure?.components?.reduce(
    (acc, curr) => acc + parseAmount(curr.amount),
    0
  ) ?? 0;

  const handleStructureChange = (val: string) => {
    form.setValue('feeStructureId', val, { shouldValidate: true });
    const match = feeStructures.find(s => String(s.id) === val);
    if (match?.academicYearId) {
      form.setValue('academicYearId', String(match.academicYearId), { shouldValidate: true });
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      await assignFeeMutation.mutateAsync({
        studentId: Number(data.studentId),
        feeStructureId: Number(data.feeStructureId),
        academicYearId: Number(data.academicYearId),
      });

      toast.success('Fee assigned and invoice generated successfully!');
      setOpen(false);
      form.reset();
      onSuccess?.();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to assign fee structure';
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button className="flex items-center space-x-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-sm font-semibold h-9 px-4">
            <PlusCircle className="w-4 h-4 mr-1.5" />
            <span>Assign Fee / Invoice</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-lg font-bold text-slate-900">
            <ReceiptText className="w-5 h-5 mr-2 text-slate-700" />
            Assign Fee Structure
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Assign an approved institutional fee structure to generate a student fee record and invoice.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField<FormValues>
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700">Student ID</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g. 101"
                      disabled={!!initialStudentId}
                      className="text-sm bg-slate-50 border-slate-200"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-600" />
                </FormItem>
              )}
            />

            <FormField<FormValues>
              control={form.control}
              name="feeStructureId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700">Fee Structure</FormLabel>
                  <Select
                    disabled={isLoadingStructures}
                    value={field.value}
                    onValueChange={handleStructureChange}
                  >
                    <FormControl>
                      <SelectTrigger className="text-sm bg-slate-50 border-slate-200">
                        <SelectValue placeholder={isLoadingStructures ? 'Loading structures...' : 'Select a fee structure'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {feeStructures
                        .filter(s => s.active)
                        .map(structure => (
                          <SelectItem key={structure.id} value={String(structure.id)}>
                            <div className="flex items-center justify-between gap-4">
                              <span className="font-medium text-slate-900">{structure.name}</span>
                              <span className="text-xs font-mono text-slate-500">[{structure.code}]</span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs text-red-600" />
                </FormItem>
              )}
            />

            {selectedStructure && (
              <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3.5 space-y-2 text-xs">
                <div className="flex justify-between items-center pb-1 border-b border-slate-200 font-semibold text-slate-700">
                  <span>Structure Components</span>
                  <span className="text-slate-900">{formatCurrency(totalGrossPreview)}</span>
                </div>
                {selectedStructure.components && selectedStructure.components.length > 0 ? (
                  <div className="space-y-1 text-slate-600 max-h-28 overflow-y-auto pr-1">
                    {selectedStructure.components.map(comp => (
                      <div key={comp.id} className="flex justify-between items-center text-[11px]">
                        <span>{comp.feeHeadName || comp.feeHeadCode || `Component #${comp.id}`}</span>
                        <span className="font-medium text-slate-800">{formatCurrency(comp.amount)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic text-[11px]">No components listed in structure</p>
                )}
              </div>
            )}

            <FormField<FormValues>
              control={form.control}
              name="academicYearId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700">Academic Year ID</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g. 1"
                      className="text-sm bg-slate-50 border-slate-200"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-[11px] text-slate-500">
                    Matches academic session for billing cycle.
                  </p>
                  <FormMessage className="text-xs text-red-600" />
                </FormItem>
              )}
            />

            <div className="pt-2 flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
                disabled={assignFeeMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                disabled={assignFeeMutation.isPending}
              >
                {assignFeeMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                )}
                {assignFeeMutation.isPending ? 'Assigning...' : 'Assign & Invoice'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
